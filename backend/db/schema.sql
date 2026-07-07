-- ═══════════════════════════════════════════════════════════════════════════
-- FundFlow schema — ONE atomic Postgres primary owns every write.
-- Big append-only tables (transactions, nav_history) are partitioned by date
-- (playbook option B): small slices, fast queries, cheap archival.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  dob           DATE,
  pan           TEXT,
  aadhaar_last4 TEXT,
  bank_account  TEXT,
  ifsc          TEXT,
  role          TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','cb','amc','admin')),
  kyc_status    TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending','verified','rejected')),
  status        TEXT NOT NULL DEFAULT 'Active'  CHECK (status IN ('Active','Blocked','Suspended','Flagged')),
  risk_profile  TEXT NOT NULL DEFAULT 'Moderate',
  amc_id        TEXT,
  joined_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  last_active   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS usr_seq START 200;
CREATE SEQUENCE IF NOT EXISTS sch_seq START 100;

CREATE TABLE IF NOT EXISTS amcs (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  logo       TEXT NOT NULL DEFAULT '🏦',
  category   TEXT NOT NULL DEFAULT 'Diversified',
  rating     NUMERIC(3,1) NOT NULL DEFAULT 4.0,
  commission NUMERIC(5,2) NOT NULL DEFAULT 0.15,
  aum_cr     NUMERIC(14,2) NOT NULL DEFAULT 0,
  fund_count INT NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Pending','Active','Suspended','Rejected')),
  applied_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS schemes (
  id             TEXT PRIMARY KEY,
  amc_id         TEXT NOT NULL REFERENCES amcs(id),
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  nav            NUMERIC(14,4) NOT NULL,
  day_change     NUMERIC(10,4) NOT NULL DEFAULT 0,
  day_change_pct NUMERIC(8,4)  NOT NULL DEFAULT 0,
  returns_1y     NUMERIC(8,2) NOT NULL DEFAULT 0,
  returns_3y     NUMERIC(8,2) NOT NULL DEFAULT 0,
  returns_5y     NUMERIC(8,2) NOT NULL DEFAULT 0,
  risk           TEXT NOT NULL DEFAULT 'Moderate',
  min_sip        INT NOT NULL DEFAULT 500,
  min_lumpsum    INT NOT NULL DEFAULT 5000,
  aum_cr         NUMERIC(14,2) NOT NULL DEFAULT 0,
  rating         INT NOT NULL DEFAULT 4,
  status         TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Paused'))
);
CREATE INDEX IF NOT EXISTS idx_schemes_amc ON schemes(amc_id);

-- ─── nav_history: partitioned by date (one small partition per month) ────────
CREATE TABLE IF NOT EXISTS nav_history (
  scheme_id TEXT NOT NULL,
  nav_date  DATE NOT NULL,
  nav       NUMERIC(14,4) NOT NULL,
  PRIMARY KEY (scheme_id, nav_date)
) PARTITION BY RANGE (nav_date);

-- ─── orders: the intent log the queue feeds. client_ref UNIQUE is the ────────
-- idempotency key: double-clicks, retries and DLQ replays can never create a
-- duplicate debit (PDF write-spike rule #4 / resilience rule #5).
CREATE TABLE IF NOT EXISTS orders (
  id         BIGSERIAL PRIMARY KEY,
  client_ref TEXT NOT NULL UNIQUE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  scheme_id  TEXT NOT NULL REFERENCES schemes(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('BUY','SIP')),
  amount     NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  sip_date   INT,
  status     TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','SUCCESS','FAILED','DEAD')),
  nav        NUMERIC(14,4),
  units      NUMERIC(18,4),
  utr        TEXT,
  error      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE status IN ('PENDING','PROCESSING');

-- ─── transactions: partitioned by date; inserts always hit one small ─────────
-- partition (PDF write-spike rule #5). PK must include the partition key.
CREATE SEQUENCE IF NOT EXISTS txn_seq START 100;
CREATE TABLE IF NOT EXISTS transactions (
  id        TEXT NOT NULL DEFAULT ('TXN' || lpad(nextval('txn_seq')::TEXT, 6, '0')),
  user_id   TEXT NOT NULL,
  scheme_id TEXT NOT NULL,
  order_id  BIGINT,
  txn_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  txn_type  TEXT NOT NULL CHECK (txn_type IN ('BUY','SIP','REDEEM')),
  amount    NUMERIC(14,2) NOT NULL,
  units     NUMERIC(18,4) NOT NULL,
  nav       NUMERIC(14,4) NOT NULL,
  status    TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','flagged')),
  PRIMARY KEY (id, txn_date)
) PARTITION BY RANGE (txn_date);
CREATE INDEX IF NOT EXISTS idx_txn_user ON transactions(user_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_scheme ON transactions(scheme_id, txn_date DESC);

-- ─── holdings: current position per (user, scheme) — updated by workers ──────
CREATE TABLE IF NOT EXISTS holdings (
  user_id    TEXT NOT NULL REFERENCES users(id),
  scheme_id  TEXT NOT NULL REFERENCES schemes(id),
  units      NUMERIC(18,4) NOT NULL DEFAULT 0,
  invested   NUMERIC(14,2) NOT NULL DEFAULT 0,
  sip_status TEXT NOT NULL DEFAULT 'None' CHECK (sip_status IN ('Active','Paused','None')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scheme_id)
);

-- ─── Monthly partitions: rolling window, created programmatically ────────────
-- (in production a nightly job creates next month's partition ahead of time)
DO $$
DECLARE
  m DATE := date_trunc('month', CURRENT_DATE) - INTERVAL '6 months';
  stop DATE := date_trunc('month', CURRENT_DATE) + INTERVAL '3 months';
BEGIN
  WHILE m < stop LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS transactions_%s PARTITION OF transactions FOR VALUES FROM (%L) TO (%L)',
      to_char(m, 'YYYY_MM'), m, m + INTERVAL '1 month');
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS nav_history_%s PARTITION OF nav_history FOR VALUES FROM (%L) TO (%L)',
      to_char(m, 'YYYY_MM'), m, m + INTERVAL '1 month');
    m := m + INTERVAL '1 month';
  END LOOP;
END $$;

-- Safety net for out-of-window dates (should stay empty in practice)
CREATE TABLE IF NOT EXISTS transactions_default PARTITION OF transactions DEFAULT;
CREATE TABLE IF NOT EXISTS nav_history_default PARTITION OF nav_history DEFAULT;
