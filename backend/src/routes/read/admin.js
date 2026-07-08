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

// ─── Database explorer (admin only) ──────────────────────────────────────────
// Browse the live schema and real row data. SECURITY: table/column identifiers
// are validated against the live catalog and quoted; every user-supplied value
// (search term, page size, offset) is passed as a bound parameter — there is no
// string-interpolated SQL injection surface. Secret-looking columns are masked.
const SENSITIVE_COL = /pass|secret|token|hash/i;
const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;

// Top-level base tables in the public schema (partition children excluded).
const listPublicTables = async () => {
  const { rows } = await queryRead(
    `SELECT c.relname AS name
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind IN ('r', 'p')
        AND c.relispartition = false
      ORDER BY c.relname`);
  return rows.map((r) => r.name);
};

const redactRow = (row) => {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v != null && SENSITIVE_COL.test(k) ? '••••••••' : v;
  }
  return out;
};

// List every table with its column definitions and exact row count.
adminReadRouter.get('/db/tables', asyncHandler(async (req, res) => {
  const names = await listPublicTables();
  const { rows: cols } = await queryRead(
    `SELECT table_name, column_name, data_type, ordinal_position
       FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position`);

  const colsByTable = {};
  for (const c of cols) {
    (colsByTable[c.table_name] ||= []).push({ name: c.column_name, type: c.data_type });
  }

  const counts = await Promise.all(
    names.map((n) =>
      queryRead(`SELECT count(*)::int AS n FROM ${quoteIdent(n)}`).then((r) => r.rows[0].n))
  );

  res.json(names.map((name, i) => ({
    name,
    rowCount: counts[i],
    columns: colsByTable[name] || [],
  })));
}));

// Paginated, searchable rows for one table.
adminReadRouter.get('/db/tables/:name', asyncHandler(async (req, res) => {
  const names = await listPublicTables();
  const table = req.params.name;
  if (!names.includes(table)) {
    return res.status(404).json({ error: `Unknown table: ${table}` });
  }

  const { rows: colRows } = await queryRead(
    `SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`, [table]);
  const columns = colRows.map((c) => ({ name: c.column_name, type: c.data_type }));

  const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 50));
  const search   = (req.query.search || '').trim();

  const qt = quoteIdent(table);
  const params = [];
  let where = '';
  if (search && columns.length) {
    // Cast every column to text so search works generically across all types.
    const clauses = columns.map((c) => `CAST(${quoteIdent(c.name)} AS text) ILIKE $1`);
    where = ` WHERE (${clauses.join(' OR ')})`;
    params.push(`%${search}%`);
  }

  const totalRes = await queryRead(`SELECT count(*)::int AS n FROM ${qt}${where}`, params);
  const total = totalRes.rows[0].n;

  const orderCol = columns[0] ? quoteIdent(columns[0].name) : '1';
  const { rows } = await queryRead(
    `SELECT * FROM ${qt}${where} ORDER BY ${orderCol} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, (page - 1) * pageSize]);

  res.json({
    table,
    columns,
    rows: rows.map(redactRow),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}));
