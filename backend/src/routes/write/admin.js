import { Router } from 'express';
import { z } from 'zod';
import { queryPrimary } from '../../db/pools.js';
import { invalidate } from '../../cache/index.js';
import { queue, TOPICS } from '../../queue/index.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';

export const adminWriteRouter = Router();

const userStatusSchema = z.object({ status: z.enum(['Active', 'Blocked', 'Suspended', 'Flagged']) });

adminWriteRouter.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = userStatusSchema.parse(req.body);
  const { rows } = await queryPrimary(
    'UPDATE users SET status = $2 WHERE id = $1 RETURNING id, status', [req.params.id, status]);
  if (!rows[0]) throw new HttpError(404, 'User not found');
  await invalidate('stats:admin', 'stats:cb');
  res.json(rows[0]);
}));

const amcStatusSchema = z.object({ status: z.enum(['Active', 'Suspended']) });

adminWriteRouter.patch('/amcs/:id/status', asyncHandler(async (req, res) => {
  const { status } = amcStatusSchema.parse(req.body);
  const { rows } = await queryPrimary(
    'UPDATE amcs SET status = $2 WHERE id = $1 RETURNING id, status', [req.params.id, status]);
  if (!rows[0]) throw new HttpError(404, 'AMC not found');
  await invalidate('amcs:list', 'schemes:list:*', 'stats:admin');
  res.json(rows[0]);
}));

adminWriteRouter.post('/amcs/:id/approve', asyncHandler(async (req, res) => {
  const { rows } = await queryPrimary(
    `UPDATE amcs SET status = 'Active' WHERE id = $1 AND status = 'Pending' RETURNING id, status`,
    [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Pending AMC not found');
  await invalidate('amcs:list', 'stats:admin');
  res.json(rows[0]);
}));

adminWriteRouter.post('/amcs/:id/reject', asyncHandler(async (req, res) => {
  const { rows } = await queryPrimary(
    `UPDATE amcs SET status = 'Rejected' WHERE id = $1 AND status = 'Pending' RETURNING id, status`,
    [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Pending AMC not found');
  res.json(rows[0]);
}));

// ─── DLQ replay (PDF resilience rule #3 + #5) ────────────────────────────────
// Once the bank is back, ops replays parked orders. client_ref UNIQUE plus the
// worker's settled-status guard make replay idempotent: an already-settled
// order can never double-charge or double-allot.
adminWriteRouter.post('/dlq/replay', asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) && req.body.ids.length ? req.body.ids : null;
  const replayed = await queue.replayDLQ(TOPICS.ORDERS, ids);
  res.json({ replayed });
}));

// Trigger the daily NAV load (normally a scheduled job at market close).
adminWriteRouter.post('/jobs/nav-load', asyncHandler(async (req, res) => {
  await queue.add(TOPICS.NAV, { requestedBy: req.user.sub, at: new Date().toISOString() });
  res.status(202).json({ status: 'QUEUED', job: 'nav-load' });
}));
