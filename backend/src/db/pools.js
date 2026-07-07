import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

// NUMERIC → number, BIGINT → number, DATE → 'YYYY-MM-DD' string (no TZ shifts)
pg.types.setTypeParser(1700, parseFloat);
pg.types.setTypeParser(20, (v) => parseInt(v, 10));
pg.types.setTypeParser(1082, (v) => v);

// ─── Golden rule: ALL writes go to ONE atomic Postgres primary ───────────────
// In production this URL points at PgBouncer in front of the primary (layer 4),
// so thousands of app-tier connections collapse onto ~100 real ones.
export const primary = new Pool({
  connectionString: config.databaseUrl,
  max: config.pgPoolSize,
  idleTimeoutMillis: 30_000,
});

// ─── Layer 3: read replicas ──────────────────────────────────────────────────
// Reads round-robin across REPLICA_URLS. With none configured (dev), reads
// simply hit the primary — the routing code stays identical either way.
const replicas = config.replicaUrls.map(
  (url) => new Pool({ connectionString: url, max: config.pgPoolSize, idleTimeoutMillis: 30_000 })
);
let rr = 0;
const nextReplica = () => (replicas.length ? replicas[rr++ % replicas.length] : primary);

/** Read query → replica (or primary when no replicas are configured). */
export const queryRead = (text, params) => nextReplica().query(text, params);

/** Write query (or read-after-write, PDF refinement #1) → primary. */
export const queryPrimary = (text, params) => primary.query(text, params);

/** Run fn inside a single primary transaction (workers batch many orders per commit). */
export async function withTransaction(fn) {
  const client = await primary.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function closePools() {
  await Promise.allSettled([primary.end(), ...replicas.map((r) => r.end())]);
}
