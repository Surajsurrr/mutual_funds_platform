import { Router } from 'express';
import { queryRead, queryPrimary } from '../../db/pools.js';
import { withCache } from '../../cache/index.js';
import { config } from '../../config.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';
import { mapTransaction, mapOrder } from '../../services/mappers.js';

// Per-user reads for the signed-in investor.
export const meRouter = Router();

meRouter.get('/portfolio', asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  // Cached briefly and invalidated the moment a worker settles one of this
  // user's orders — so a fresh portfolio after a buy comes from the
  // synchronously-updated cache, not a lagging replica (PDF refinement #1).
  const portfolio = await withCache(`portfolio:${userId}`, config.cacheTtl.portfolio, async () => {
    const { rows } = await queryRead(
      `SELECT h.scheme_id, h.units, h.invested, h.sip_status,
              s.name AS scheme_name, s.nav, s.day_change, a.name AS amc_name
       FROM holdings h
       JOIN schemes s ON s.id = h.scheme_id
       JOIN amcs a ON a.id = s.amc_id
       WHERE h.user_id = $1 AND h.units > 0
       ORDER BY h.invested DESC`,
      [userId]);

    const holdings = rows.map((r) => {
      const currentValue = r.units * r.nav;
      const gain = currentValue - r.invested;
      return {
        schemeId: r.scheme_id,
        schemeName: r.scheme_name,
        amcName: r.amc_name,
        units: +r.units.toFixed(4),
        avgNAV: +(r.invested / r.units).toFixed(2),
        currentNAV: r.nav,
        invested: +r.invested.toFixed(2),
        currentValue: +currentValue.toFixed(2),
        gain: +gain.toFixed(2),
        gainPct: +(r.invested > 0 ? (gain / r.invested) * 100 : 0).toFixed(2),
        sipStatus: r.sip_status,
      };
    });

    const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
    const currentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const dayChange = rows.reduce((s, r) => s + r.units * r.day_change, 0);
    const prevValue = currentValue - dayChange;
    return {
      totalInvested: +totalInvested.toFixed(2),
      currentValue: +currentValue.toFixed(2),
      totalGain: +(currentValue - totalInvested).toFixed(2),
      totalGainPct: +(totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0).toFixed(2),
      dayChange: +dayChange.toFixed(2),
      dayChangePct: +(prevValue > 0 ? (dayChange / prevValue) * 100 : 0).toFixed(2),
      holdings,
    };
  });
  res.json(portfolio);
}));

meRouter.get('/transactions', asyncHandler(async (req, res) => {
  const { type = '', limit = 100 } = req.query;
  // Date-partitioned table: this only touches recent partitions.
  const { rows } = await queryRead(
    `SELECT t.id, t.txn_date, t.txn_type, t.amount, t.units, t.nav, t.status, s.name AS scheme_name
     FROM transactions t JOIN schemes s ON s.id = t.scheme_id
     WHERE t.user_id = $1 AND ($2 = '' OR t.txn_type = $2)
     ORDER BY t.txn_date DESC, t.id DESC
     LIMIT $3`,
    [req.user.sub, type, Math.min(500, +limit)]);
  res.json(rows.map(mapTransaction));
}));

meRouter.get('/orders', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    `SELECT o.*, s.name AS scheme_name FROM orders o
     JOIN schemes s ON s.id = o.scheme_id
     WHERE o.user_id = $1 ORDER BY o.created_at DESC LIMIT 50`,
    [req.user.sub]);
  res.json(rows.map(mapOrder));
}));

// ─── Read-after-write (PDF refinement #1) ────────────────────────────────────
// Right after placing an order the user polls its status. Replicas lag by
// milliseconds, so THIS one read goes to the primary.
meRouter.get('/orders/:clientRef', asyncHandler(async (req, res) => {
  const { rows } = await queryPrimary(
    `SELECT o.*, s.name AS scheme_name FROM orders o
     JOIN schemes s ON s.id = o.scheme_id
     WHERE o.client_ref = $1 AND o.user_id = $2`,
    [req.params.clientRef, req.user.sub]);
  if (!rows[0]) {
    // Thin-intake mode: the intent may still be in the queue, not yet in the DB.
    if (config.thinIntake) return res.json({ clientRef: req.params.clientRef, status: 'PENDING', queued: true });
    throw new HttpError(404, 'Order not found');
  }
  res.json(mapOrder(rows[0]));
}));
