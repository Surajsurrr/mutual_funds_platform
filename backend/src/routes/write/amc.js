import { Router } from 'express';
import { z } from 'zod';
import { queryPrimary } from '../../db/pools.js';
import { invalidate } from '../../cache/index.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';
import { mapScheme } from '../../services/mappers.js';

// Scheme CRUD for AMC managers. Low volume → direct to primary; every change
// busts the market-data caches so investors see it within one TTL.
export const amcWriteRouter = Router();

const resolveAmcId = (req) => (req.user.role === 'amc' ? req.user.amcId : req.body.amcId) || 'AMC001';

const schemeSchema = z.object({
  name: z.string().min(3),
  category: z.string().min(2),
  nav: z.number().positive(),
  risk: z.string().default('Moderate'),
  minSIP: z.number().int().positive().default(500),
  minLumpsum: z.number().int().positive().default(5000),
  returns1Y: z.number().default(0),
  returns3Y: z.number().default(0),
  returns5Y: z.number().default(0),
  aumCr: z.number().nonnegative().default(0),
  rating: z.number().int().min(1).max(5).default(4),
});

const bustMarketCaches = (schemeId) =>
  invalidate('schemes:list:*', `scheme:${schemeId}`, 'amcs:list', 'stats:amc:*');

amcWriteRouter.post('/schemes', asyncHandler(async (req, res) => {
  const s = schemeSchema.parse(req.body);
  const { rows } = await queryPrimary(
    `INSERT INTO schemes (id, amc_id, name, category, nav, risk, min_sip, min_lumpsum,
                          returns_1y, returns_3y, returns_5y, aum_cr, rating)
     VALUES ('SCH' || lpad(nextval('sch_seq')::text, 3, '0'), $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [resolveAmcId(req), s.name, s.category, s.nav, s.risk, s.minSIP, s.minLumpsum,
     s.returns1Y, s.returns3Y, s.returns5Y, s.aumCr, s.rating]);
  await bustMarketCaches(rows[0].id);
  res.status(201).json(mapScheme(rows[0]));
}));

amcWriteRouter.patch('/schemes/:id', asyncHandler(async (req, res) => {
  const s = schemeSchema.partial().parse(req.body);
  const { rows } = await queryPrimary(
    `UPDATE schemes SET
       name = COALESCE($3, name), category = COALESCE($4, category), nav = COALESCE($5, nav),
       risk = COALESCE($6, risk), min_sip = COALESCE($7, min_sip), min_lumpsum = COALESCE($8, min_lumpsum),
       returns_1y = COALESCE($9, returns_1y), aum_cr = COALESCE($10, aum_cr), rating = COALESCE($11, rating)
     WHERE id = $1 AND amc_id = $2 RETURNING *`,
    [req.params.id, resolveAmcId(req), s.name ?? null, s.category ?? null, s.nav ?? null,
     s.risk ?? null, s.minSIP ?? null, s.minLumpsum ?? null, s.returns1Y ?? null,
     s.aumCr ?? null, s.rating ?? null]);
  if (!rows[0]) throw new HttpError(404, 'Scheme not found for this AMC');
  await bustMarketCaches(req.params.id);
  res.json(mapScheme(rows[0]));
}));

amcWriteRouter.delete('/schemes/:id', asyncHandler(async (req, res) => {
  // Investors may hold units — never hard-delete; pause the scheme instead.
  const { rows } = await queryPrimary(
    `UPDATE schemes SET status = 'Paused' WHERE id = $1 AND amc_id = $2 RETURNING id`,
    [req.params.id, resolveAmcId(req)]);
  if (!rows[0]) throw new HttpError(404, 'Scheme not found for this AMC');
  await bustMarketCaches(req.params.id);
  res.json({ id: rows[0].id, status: 'Paused' });
}));
