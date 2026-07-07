import { Router } from 'express';
import { queryRead } from '../../db/pools.js';
import { withCache } from '../../cache/index.js';
import { config } from '../../config.js';
import { asyncHandler } from '../../middleware/errors.js';
import { mapScheme, formatInr } from '../../services/mappers.js';

// AMC manager portal reads, scoped to the manager's fund house.
export const amcReadRouter = Router();

// AMC managers carry their amc_id in the JWT; admins can inspect any via ?amcId=.
const resolveAmcId = (req) => (req.user.role === 'amc' ? req.user.amcId : req.query.amcId) || 'AMC001';

amcReadRouter.get('/stats', asyncHandler(async (req, res) => {
  const amcId = resolveAmcId(req);
  const stats = await withCache(`stats:amc:${amcId}`, config.cacheTtl.stats, async () => {
    const [schemes, investors] = await Promise.all([
      queryRead(`SELECT count(*)::int AS n, COALESCE(sum(aum_cr),0) AS aum, COALESCE(avg(returns_1y),0) AS avg1y
                 FROM schemes WHERE amc_id = $1 AND status = 'Active'`, [amcId]),
      queryRead(`SELECT count(DISTINCT h.user_id)::int AS investors,
                        count(*) FILTER (WHERE h.sip_status = 'Active')::int AS active_sips
                 FROM holdings h JOIN schemes s ON s.id = h.scheme_id
                 WHERE s.amc_id = $1 AND h.units > 0`, [amcId]),
    ]);
    return {
      totalSchemes: schemes.rows[0].n,
      totalInvestors: investors.rows[0].investors,
      totalAUM: `₹${formatInr(schemes.rows[0].aum)} Cr`,
      avgReturns1Y: +Number(schemes.rows[0].avg1y).toFixed(1),
      activeSips: investors.rows[0].active_sips,
    };
  });
  res.json(stats);
}));

amcReadRouter.get('/schemes', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    'SELECT * FROM schemes WHERE amc_id = $1 ORDER BY id', [resolveAmcId(req)]);
  res.json(rows.map(mapScheme));
}));

amcReadRouter.get('/investors', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    `SELECT u.id, u.name, u.email, s.name AS scheme, h.units, h.invested, h.sip_status,
            h.units * s.nav AS value
     FROM holdings h
     JOIN users u ON u.id = h.user_id
     JOIN schemes s ON s.id = h.scheme_id
     WHERE s.amc_id = $1 AND h.units > 0
     ORDER BY value DESC`,
    [resolveAmcId(req)]);
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    scheme: r.scheme,
    units: +r.units.toFixed(2),
    invested: Math.round(r.invested),
    value: Math.round(r.value),
    gain: Math.round(r.value - r.invested),
    sip: r.sip_status,
  })));
}));
