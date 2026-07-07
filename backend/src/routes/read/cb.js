import { Router } from 'express';
import { queryRead } from '../../db/pools.js';
import { withCache } from '../../cache/index.js';
import { config } from '../../config.js';
import { asyncHandler } from '../../middleware/errors.js';
import { mapTransaction, formatCompactInr } from '../../services/mappers.js';

// Corporate banking desk: monitoring reads across all clients.
export const cbReadRouter = Router();

cbReadRouter.get('/stats', asyncHandler(async (req, res) => {
  const stats = await withCache('stats:cb', config.cacheTtl.stats, async () => {
    const [clients, volume, flagged] = await Promise.all([
      queryRead(`SELECT count(*)::int AS total,
                        count(*) FILTER (WHERE last_active::date = CURRENT_DATE)::int AS active_today
                 FROM users WHERE role = 'client'`),
      queryRead(`SELECT COALESCE(sum(amount), 0) AS vol FROM transactions
                 WHERE txn_date >= date_trunc('month', CURRENT_DATE) AND status <> 'failed'`),
      queryRead(`SELECT (SELECT count(*) FROM users WHERE status = 'Flagged')::int
                      + (SELECT count(*) FROM transactions WHERE status = 'flagged')::int AS flagged`),
    ]);
    return {
      totalClients: clients.rows[0].total,
      activeToday: clients.rows[0].active_today,
      transactionVolume: formatCompactInr(volume.rows[0].vol),
      flaggedAccounts: flagged.rows[0].flagged,
    };
  });
  res.json(stats);
}));

cbReadRouter.get('/clients', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    `SELECT u.id, u.name, u.email, u.risk_profile, u.status, u.last_active,
            COALESCE(sum(h.units * s.nav), 0) AS holdings_value
     FROM users u
     LEFT JOIN holdings h ON h.user_id = u.id
     LEFT JOIN schemes s ON s.id = h.scheme_id
     WHERE u.role = 'client'
     GROUP BY u.id ORDER BY u.id`);
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    holdings: Math.round(r.holdings_value),
    risk: r.risk_profile,
    status: r.status,
    lastActive: r.last_active,
  })));
}));

cbReadRouter.get('/transactions', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    `SELECT t.id, t.txn_date, t.txn_type, t.amount, t.units, t.nav, t.status,
            s.name AS scheme_name, u.name AS client_name
     FROM transactions t
     JOIN schemes s ON s.id = t.scheme_id
     JOIN users u ON u.id = t.user_id
     ORDER BY t.txn_date DESC, t.id DESC LIMIT 200`);
  res.json(rows.map((r) => ({ ...mapTransaction(r), clientName: r.client_name })));
}));
