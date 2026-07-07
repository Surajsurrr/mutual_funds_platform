import 'dotenv/config';

const int = (v, d) => (v !== undefined && v !== '' ? parseInt(v, 10) : d);
const num = (v, d) => (v !== undefined && v !== '' ? parseFloat(v) : d);

export const config = {
  env: process.env.NODE_ENV || 'development',

  // ─── App tier (stateless — scale horizontally) ────────────────────────────
  // API_ROLE: 'read' | 'write' | 'worker' | 'all' (dev default: everything in one process)
  // 'web' = single-port demo deploy: both APIs + workers + the built SPA on PORT
  apiRole: process.env.API_ROLE || 'all',
  writePort: int(process.env.WRITE_PORT, 5000),
  readPort: int(process.env.READ_PORT, 5001),
  webPort: int(process.env.PORT, 8080),

  // ─── Layer 4: connection pooling ──────────────────────────────────────────
  // In production DATABASE_URL points at PgBouncer (transaction pooling),
  // which multiplexes thousands of app connections onto ~100 real ones.
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5434/fundflow',
  // Layer 3: comma-separated replica URLs. Reads round-robin across these;
  // empty in dev → reads fall back to the primary pool.
  replicaUrls: (process.env.REPLICA_URLS || '').split(',').map(s => s.trim()).filter(Boolean),
  pgPoolSize: int(process.env.PG_POOL_SIZE, 10),

  // ─── Layer 2: cache ───────────────────────────────────────────────────────
  // REDIS_URL unset → in-process TTL cache (dev fallback, same interface).
  redisUrl: process.env.REDIS_URL || '',
  cacheTtl: {
    amcList: int(process.env.TTL_AMC_LIST, 300),        // fund lists change rarely
    schemeList: int(process.env.TTL_SCHEME_LIST, 300),
    scheme: int(process.env.TTL_SCHEME, 300),
    navHistory: int(process.env.TTL_NAV_HISTORY, 3600), // NAV loads once a day
    portfolio: int(process.env.TTL_PORTFOLIO, 120),     // invalidated on settle anyway
    stats: int(process.env.TTL_STATS, 60),
  },

  // ─── Layer 5: queue + async workers ───────────────────────────────────────
  // Redis Streams when REDIS_URL is set; durable file queue otherwise.
  queueDir: process.env.QUEUE_DIR || './data/queue',
  orderBatchSize: int(process.env.ORDER_BATCH_SIZE, 100), // orders committed per txn
  orderBatchWaitMs: int(process.env.ORDER_BATCH_WAIT_MS, 500),
  // NFO/SIP burst mode: when true the write API does ZERO db work on the order
  // path — the intent goes only to the durable queue and workers batch-insert
  // the rows ("queue, don't write"). Default keeps a thin synchronous insert
  // so order status is queryable instantly.
  thinIntake: process.env.ORDER_THIN_INTAKE === 'true',

  // Retries: exponential backoff 2s → 4s → 8s with full jitter (PDF gotcha #4).
  // Dev shrinks the base so a forced failure dead-letters in seconds, not tens of.
  retry: {
    maxAttempts: int(process.env.RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: int(process.env.RETRY_BASE_DELAY_MS, 2000),
  },

  // Simulated external bank/payment API
  bank: {
    latencyMs: int(process.env.BANK_LATENCY_MS, 300),
    failureRate: num(process.env.BANK_FAILURE_RATE, 0.05), // transient failure odds
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiry: process.env.JWT_EXPIRY || '12h',

  // ─── Rate limiting (per user / IP, before anything touches the DB) ───────
  rateLimit: {
    readPerMin: int(process.env.RATE_READ_PER_MIN, 300),
    writePerMin: int(process.env.RATE_WRITE_PER_MIN, 60),
    orderPerMin: int(process.env.RATE_ORDER_PER_MIN, 20),
  },
};
