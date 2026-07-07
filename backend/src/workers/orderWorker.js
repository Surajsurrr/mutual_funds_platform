import { queue, TOPICS } from '../queue/index.js';
import { queryPrimary, withTransaction } from '../db/pools.js';
import { withRetry } from '../services/retry.js';
import { debitBankAccount } from '../services/bankApi.js';
import { invalidate } from '../cache/index.js';
import { publishOrderEvent } from '../services/orderEvents.js';
import { config } from '../config.js';

// ═══ The async batch worker — where ALL the heavy lifting happens ════════════
// Pulls order intents from the durable queue in batches, calls the external
// bank API (with exponential backoff + jitter), then commits MANY orders per
// database transaction so the primary only ever sees a steady, batched stream.
// Bank still down after max retries → the order parks in the DLQ, blocking
// nothing, until ops replays it.

async function settleBatch(batch) {
  const intents = batch.map((m) => m.data);
  const refs = intents.map((i) => i.clientRef);

  // Ensure intent rows exist — a no-op in default mode, the actual batch
  // insert in thin-intake mode. ON CONFLICT collapses duplicates (idempotency).
  const values = [];
  const params = [];
  intents.forEach((i, n) => {
    const b = n * 6;
    values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6})`);
    params.push(i.clientRef, i.userId, i.schemeId, i.orderType, i.amount, i.sipDate);
  });
  await queryPrimary(
    `INSERT INTO orders (client_ref, user_id, scheme_id, order_type, amount, sip_date)
     VALUES ${values.join(',')} ON CONFLICT (client_ref) DO NOTHING`, params);

  // Load current state; skip anything already settled (redelivery / DLQ replay
  // of a settled order must be a no-op — this is what makes replay safe).
  const { rows: orders } = await queryPrimary(
    `SELECT o.*, s.nav AS current_nav FROM orders o
     JOIN schemes s ON s.id = o.scheme_id
     WHERE o.client_ref = ANY($1) AND o.status <> 'SUCCESS'`, [refs]);
  if (orders.length === 0) return;

  await queryPrimary(
    `UPDATE orders SET status = 'PROCESSING' WHERE id = ANY($1)`,
    [orders.map((o) => o.id)]);

  // External dependency, isolated per order: retry 2s → 4s → 8s with full
  // jitter, never letting one flaky bank response sink the whole batch.
  const results = await Promise.all(orders.map(async (order) => {
    try {
      const receipt = await withRetry(
        () => debitBankAccount({ clientRef: order.client_ref, amount: Number(order.amount) }),
        { onRetry: (attempt, delay, err) =>
            console.log(`[orders] ${order.client_ref} attempt ${attempt} failed (${err.message}) — retrying in ${delay}ms`) }
      );
      return { order, receipt };
    } catch (err) {
      return { order, error: err };
    }
  }));

  const settled = results.filter((r) => r.receipt);
  const failed = results.filter((r) => r.error);

  // ONE commit settles the whole batch (PDF write-spike rule #5).
  // Status changes are collected here and pushed to SSE subscribers only
  // AFTER the commit — never announce a state the DB doesn't hold yet.
  const events = [];
  await withTransaction(async (tx) => {
    for (const { order, receipt } of settled) {
      const units = +(Number(order.amount) / Number(order.current_nav)).toFixed(4);

      if (order.order_type === 'REDEEM') {
        // Redemption: re-check units inside the transaction (the request-path
        // check can be stale), reduce cost basis proportionally, never go < 0.
        const { rows: upd } = await tx.query(
          `UPDATE holdings SET
             invested = GREATEST(invested - invested * (LEAST($3, units) / units), 0),
             units = GREATEST(units - $3, 0),
             updated_at = now()
           WHERE user_id = $1 AND scheme_id = $2 AND units > 0 AND units >= $3 - 0.001
           RETURNING units`,
          [order.user_id, order.scheme_id, units]);
        if (!upd[0]) {
          await tx.query(
            `INSERT INTO transactions (user_id, scheme_id, order_id, txn_type, amount, units, nav, status)
             VALUES ($1,$2,$3,'REDEEM',$4,0,$5,'failed')`,
            [order.user_id, order.scheme_id, order.id, order.amount, order.current_nav]);
          await tx.query(
            `UPDATE orders SET status = 'DEAD', error = 'Insufficient units at settlement' WHERE id = $1`,
            [order.id]);
          events.push({ clientRef: order.client_ref, userId: order.user_id, status: 'DEAD', error: 'Insufficient units at settlement' });
          continue;
        }
      } else {
        await tx.query(
          `INSERT INTO holdings (user_id, scheme_id, units, invested, sip_status)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (user_id, scheme_id) DO UPDATE SET
             units = holdings.units + EXCLUDED.units,
             invested = holdings.invested + EXCLUDED.invested,
             sip_status = CASE WHEN EXCLUDED.sip_status = 'Active' THEN 'Active' ELSE holdings.sip_status END,
             updated_at = now()`,
          [order.user_id, order.scheme_id, units, order.amount, order.order_type === 'SIP' ? 'Active' : 'None']);
      }

      await tx.query(
        `INSERT INTO transactions (user_id, scheme_id, order_id, txn_type, amount, units, nav, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'success')`,
        [order.user_id, order.scheme_id, order.id, order.order_type, order.amount, units, order.current_nav]);
      await tx.query(
        `UPDATE orders SET status = 'SUCCESS', nav = $2, units = $3, utr = $4, settled_at = now(), error = NULL
         WHERE id = $1`,
        [order.id, order.current_nav, units, receipt.utr]);
      events.push({ clientRef: order.client_ref, userId: order.user_id, status: 'SUCCESS',
        nav: Number(order.current_nav), units, utr: receipt.utr });
    }
    for (const { order, error } of failed) {
      await tx.query(
        `INSERT INTO transactions (user_id, scheme_id, order_id, txn_type, amount, units, nav, status)
         VALUES ($1,$2,$3,$4,$5,0,$6,'failed')`,
        [order.user_id, order.scheme_id, order.id, order.order_type, order.amount, order.current_nav]);
      await tx.query(
        `UPDATE orders SET status = 'DEAD', error = $2 WHERE id = $1`,
        [order.id, String(error.message)]);
      events.push({ clientRef: order.client_ref, userId: order.user_id, status: 'DEAD', error: String(error.message) });
    }
  });

  // Park permanent failures in the DLQ for manual replay once the bank is back.
  for (const { order, error } of failed) {
    const msg = batch.find((m) => m.data.clientRef === order.client_ref);
    await queue.deadLetter(TOPICS.ORDERS, msg ?? { data: { clientRef: order.client_ref } }, error.message);
    console.error(`[orders] ${order.client_ref} → DLQ after ${config.retry.maxAttempts} attempts: ${error.message}`);
  }

  // Synchronous cache update (PDF refinement #1): bust each affected user's
  // portfolio so their very next read shows the settled order — no replica lag.
  const userIds = [...new Set(orders.map((o) => o.user_id))];
  await invalidate(...userIds.map((u) => `portfolio:${u}`), 'stats:cb', 'stats:admin', 'stats:amc:*', 'stats:analytics');

  // Push the committed status changes to any browser listening on SSE.
  for (const event of events) await publishOrderEvent(event);

  if (settled.length) console.log(`[orders] settled ${settled.length} order(s) in one commit`);
}

export function startOrderWorker() {
  console.log('[orders] worker consuming — batch size', config.orderBatchSize);
  queue.consume(TOPICS.ORDERS, {
    batchSize: config.orderBatchSize,
    batchWaitMs: config.orderBatchWaitMs,
    handler: settleBatch,
  });
}
