import { Router } from 'express';
import { z } from 'zod';
import { queryPrimary } from '../../db/pools.js';
import { invalidate } from '../../cache/index.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';

// CB desk writes — low-volume operational updates, straight to the primary.
export const cbWriteRouter = Router();

const statusSchema = z.object({ status: z.enum(['Active', 'Blocked', 'Suspended', 'Flagged']) });

cbWriteRouter.patch('/clients/:id/status', asyncHandler(async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  const { rows } = await queryPrimary(
    `UPDATE users SET status = $2 WHERE id = $1 AND role = 'client' RETURNING id, status`,
    [req.params.id, status]);
  if (!rows[0]) throw new HttpError(404, 'Client not found');
  await invalidate('stats:cb', 'stats:admin');
  res.json(rows[0]);
}));

cbWriteRouter.patch('/transactions/:id/verify', asyncHandler(async (req, res) => {
  const { rows } = await queryPrimary(
    `UPDATE transactions SET status = 'success' WHERE id = $1 AND status = 'flagged' RETURNING id, status`,
    [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Flagged transaction not found');
  await invalidate('stats:cb');
  res.json(rows[0]);
}));
