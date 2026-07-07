import { Router } from 'express';
import { queryRead } from '../../db/pools.js';
import { withCache } from '../../cache/index.js';
import { config } from '../../config.js';
import { asyncHandler } from '../../middleware/errors.js';
import { queue, TOPICS } from '../../queue/index.js';
import { formatInr, formatCompactInr } from '../../services/mappers.js';

// Platform administration reads.
export const adminReadRouter = Router();

adminReadRouter.get('/stats', asyncHandler(async (req, res) => {
  const stats = await withCache('stats:admin', config.cacheTtl.stats, async () => {
    const [users, amcs, txns] = await Promise.all([
      queryRead(`SELECT count(*)::int AS total,
                        count(*) FILTER (WHERE last_active::date = CURRENT_DATE)::int AS active,
                        count(*) FILTER (WHERE joined_at = CURRENT_DATE)::int AS new_today
                 FROM users`),
      queryRead(`SELECT count(*) FILTER (WHERE status = 'Active')::int AS total,
                        COALESCE(sum(aum_cr) FILTER (WHERE status = 'Active'), 0) AS aum
                 FROM amcs`),
      queryRead('SELECT count(*)::int AS total FROM transactions'),
    ]);
    return {
      totalUsers: users.rows[0].total,
      totalAMCs: amcs.rows[0].total,
      totalAUM: `₹${formatInr(amcs.rows[0].aum)} Cr`,
      totalTransactions: txns.rows[0].total,
      activeUsers: users.rows[0].active,
      newUsersToday: users.rows[0].new_today,
    };
  });
  res.json(stats);
}));

adminReadRouter.get('/users', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    'SELECT id, name, email, role, status, joined_at FROM users ORDER BY id');
  res.json(rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, role: r.role, status: r.status, joined: r.joined_at,
  })));
}));

adminReadRouter.get('/amcs', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    `SELECT id, name, email, aum_cr, commission, status FROM amcs
     WHERE status IN ('Active','Suspended') ORDER BY id`);
  res.json(rows.map((r) => ({
    id: r.id, name: r.name, email: r.email,
    aum: Math.round(r.aum_cr), commission: Number(r.commission), status: r.status,
  })));
}));

adminReadRouter.get('/amcs/pending', asyncHandler(async (req, res) => {
  const { rows } = await queryRead(
    `SELECT id, name, applied_at, aum_cr FROM amcs WHERE status = 'Pending' ORDER BY applied_at`);
  res.json(rows.map((r) => ({
    id: r.id, name: r.name, applied: r.applied_at, aum: `₹${formatInr(r.aum_cr)} Cr`,
  })));
}));

adminReadRouter.get('/analytics', asyncHandler(async (req, res) => {
  const analytics = await withCache('stats:analytics', config.cacheTtl.stats, async () => {
    const [growth, allocations] = await Promise.all([
      queryRead(
        `SELECT to_char(m, 'Mon') AS month,
                (SELECT count(*) FROM users u WHERE u.joined_at < m + interval '1 month')::int AS users,
                (SELECT count(*) FROM transactions t
                  WHERE t.txn_date >= m AND t.txn_date < m + interval '1 month')::int AS txns,
                COALESCE((SELECT sum(t.amount) FROM transactions t
                  WHERE t.txn_date >= m AND t.txn_date < m + interval '1 month'), 0) AS volume
         FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '11 months',
                              date_trunc('month', CURRENT_DATE), interval '1 month') AS m`),
      queryRead(
        `SELECT s.category, sum(h.units * s.nav) AS value
         FROM holdings h JOIN schemes s ON s.id = h.scheme_id
         GROUP BY s.category ORDER BY value DESC`),
    ]);
    const totalAlloc = allocations.rows.reduce((s, r) => s + Number(r.value), 0) || 1;
    return {
      growth: growth.rows.map((r) => ({ month: r.month, users: r.users, txns: r.txns, volume: Number(r.volume) })),
      allocations: allocations.rows.map((r) => ({
        category: r.category, value: Math.round((Number(r.value) / totalAlloc) * 100),
      })),
    };
  });
  res.json(analytics);
}));

// ─── DLQ visibility: what's parked, waiting for manual replay ────────────────
adminReadRouter.get('/dlq', asyncHandler(async (req, res) => {
  const [dead, depth] = await Promise.all([
    queue.readDLQ(TOPICS.ORDERS),
    queue.depth(TOPICS.ORDERS),
  ]);
  res.json({ queueDepth: depth, deadLetters: dead });
}));

// System health snapshot for the admin dashboard.
adminReadRouter.get('/system', asyncHandler(async (req, res) => {
  const volume = await queryRead(
    `SELECT COALESCE(sum(amount),0) AS vol FROM transactions WHERE txn_date = CURRENT_DATE`);
  res.json({
    queueDepth: await queue.depth(TOPICS.ORDERS),
    todayVolume: formatCompactInr(volume.rows[0].vol),
    cacheBackend: config.redisUrl ? 'redis' : 'memory',
    replicas: config.replicaUrls.length,
  });
}));
