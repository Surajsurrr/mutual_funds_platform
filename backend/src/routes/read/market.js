import { Router } from 'express';
import { queryRead } from '../../db/pools.js';
import { withCache } from '../../cache/index.js';
import { config } from '../../config.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';
import { mapAmc, mapScheme } from '../../services/mappers.js';

// Market data: the hottest reads on the platform and the least volatile —
// exactly what layer 2 (cache) exists for. Every handler is cache-aside;
// misses go to a replica (layer 3), never the primary.
export const marketRouter = Router();

marketRouter.get('/amcs', asyncHandler(async (req, res) => {
  const amcs = await withCache('amcs:list', config.cacheTtl.amcList, async () => {
    const { rows } = await queryRead(
      `SELECT * FROM amcs WHERE status = 'Active' ORDER BY id`);
    return rows.map(mapAmc);
  });
  res.json(amcs);
}));

marketRouter.get('/schemes', asyncHandler(async (req, res) => {
  const { amcId = '', category = '', search = '' } = req.query;
  const key = `schemes:list:${amcId}:${category}:${search.toLowerCase()}`;
  const schemes = await withCache(key, config.cacheTtl.schemeList, async () => {
    const { rows } = await queryRead(
      `SELECT s.* FROM schemes s
       JOIN amcs a ON a.id = s.amc_id AND a.status = 'Active'
       WHERE s.status = 'Active'
         AND ($1 = '' OR s.amc_id = $1)
         AND ($2 = '' OR s.category = $2)
         AND ($3 = '' OR s.name ILIKE '%' || $3 || '%')
       ORDER BY s.id`,
      [amcId, category, search]);
    return rows.map(mapScheme);
  });
  res.json(schemes);
}));

marketRouter.get('/schemes/:id', asyncHandler(async (req, res) => {
  const scheme = await withCache(`scheme:${req.params.id}`, config.cacheTtl.scheme, async () => {
    const { rows } = await queryRead('SELECT * FROM schemes WHERE id = $1', [req.params.id]);
    return rows[0] ? mapScheme(rows[0]) : null;
  });
  if (!scheme) throw new HttpError(404, 'Scheme not found');
  res.json(scheme);
}));

marketRouter.get('/schemes/:id/nav-history', asyncHandler(async (req, res) => {
  const days = Math.min(365, parseInt(req.query.days, 10) || 30);
  const history = await withCache(`nav:${req.params.id}:${days}`, config.cacheTtl.navHistory, async () => {
    // Partition pruning: only the last 1-2 monthly partitions are scanned.
    const { rows } = await queryRead(
      `SELECT nav_date, nav FROM nav_history
       WHERE scheme_id = $1 AND nav_date >= CURRENT_DATE - $2::int
       ORDER BY nav_date`,
      [req.params.id, days]);
    return rows.map((r) => ({
      date: new Date(r.nav_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      nav: Number(r.nav),
    }));
  });
  res.json(history);
}));
