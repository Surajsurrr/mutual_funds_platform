import { Router } from 'express';
import { z } from 'zod';
import { queryPrimary } from '../../db/pools.js';
import { withCache } from '../../cache/index.js';
import { queue, TOPICS } from '../../queue/index.js';
import { queryRead } from '../../db/pools.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';
import { config } from '../../config.js';
import { mapScheme, mapOrder } from '../../services/mappers.js';

// ═══ Queue-based load leveling: the shock absorber ═══════════════════════════
// A buy/SIP order before the daily cutoff gets that day's NAV and settles in a
// batch anyway — so the request path only captures the INTENT fast and durably,
// returns "PENDING" instantly, and workers feed Postgres at its own pace.
// The bank is never called here (one slow bank must not freeze the site).
export const ordersRouter = Router();

const orderSchema = z.object({
  clientRef: z.string().min(8).max(64),
  schemeId: z.string().min(1),
  type: z.enum(['BUY', 'SIP', 'REDEEM']),
  amount: z.number().positive(),
  sipDate: z.number().int().min(1).max(28).optional(),
});

ordersRouter.post(
  '/orders',
  requireRole('client', 'admin'),
  rateLimit(config.rateLimit.orderPerMin, 'orders'),
  asyncHandler(async (req, res) => {
    const order = orderSchema.parse(req.body);
    const userId = req.user.sub;

    // Validate fast — against the CACHE, not the database.
    const scheme = await withCache(`scheme:${order.schemeId}`, config.cacheTtl.scheme, async () => {
      const { rows } = await queryRead('SELECT * FROM schemes WHERE id = $1', [order.schemeId]);
      return rows[0] ? mapScheme(rows[0]) : null;
    });
    if (!scheme) throw new HttpError(404, 'Scheme not found');
    if (order.type === 'REDEEM') {
      // Redemption: validate against what the user actually holds (cheap
      // indexed read). Settlement re-checks inside the batch transaction.
      const { rows } = await queryRead(
        'SELECT units FROM holdings WHERE user_id = $1 AND scheme_id = $2', [userId, order.schemeId]);
      const heldValue = rows[0] ? Number(rows[0].units) * scheme.nav : 0;
      if (heldValue <= 0) throw new HttpError(400, 'You do not hold any units of this scheme');
      if (order.amount > heldValue + 0.01) {
        throw new HttpError(400, `Redemption exceeds current holding value (₹${heldValue.toFixed(2)})`);
      }
    } else {
      const minAmount = order.type === 'SIP' ? scheme.minSIP : scheme.minLumpsum;
      if (order.amount < minAmount) {
        throw new HttpError(400, `Minimum ${order.type} amount for this scheme is ₹${minAmount}`);
      }
    }

    const intent = {
      clientRef: order.clientRef,
      userId,
      schemeId: order.schemeId,
      orderType: order.type,
      amount: order.amount,
      sipDate: order.sipDate ?? null,
    };

    if (!config.thinIntake) {
      // Default mode: one thin indexed insert so status is queryable instantly.
      // client_ref UNIQUE = idempotency — a double-click or network retry
      // cannot create a second debit, it just gets the original order back.
      const { rows } = await queryPrimary(
        `INSERT INTO orders (client_ref, user_id, scheme_id, order_type, amount, sip_date)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (client_ref) DO NOTHING
         RETURNING *`,
        [intent.clientRef, userId, intent.schemeId, intent.orderType, intent.amount, intent.sipDate]);
      if (!rows[0]) {
        const { rows: existing } = await queryPrimary(
          'SELECT * FROM orders WHERE client_ref = $1', [intent.clientRef]);
        return res.status(200).json({ ...mapOrder(existing[0]), duplicate: true });
      }
    }
    // Burst mode (ORDER_THIN_INTAKE=true): no DB touch at all — workers
    // batch-insert intents with ON CONFLICT DO NOTHING collapsing duplicates.

    // Durable enqueue, instant acknowledgement. Allotment happens at the NAV
    // cutoff anyway — nobody needs this write to be synchronous.
    await queue.add(TOPICS.ORDERS, intent);

    res.status(202).json({
      clientRef: order.clientRef,
      status: 'PENDING',
      message: order.type === 'REDEEM'
        ? 'Redemption accepted — units will be redeemed at today\'s NAV cutoff'
        : 'Order accepted — units will be allotted at today\'s NAV cutoff',
    });
  })
);

// ─── Small writes skip the queue (PDF refinement #2) ─────────────────────────
// A profile edit is not a burst risk: straight to the primary via the pool.
const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
});

ordersRouter.patch('/profile', asyncHandler(async (req, res) => {
  const updates = profileSchema.parse(req.body);
  const { rows } = await queryPrimary(
    `UPDATE users SET name = COALESCE($2, name), phone = COALESCE($3, phone)
     WHERE id = $1 RETURNING id, name, email, phone, role`,
    [req.user.sub, updates.name ?? null, updates.phone ?? null]);
  res.json(rows[0]);
}));
