# FundFlow Backend

Backend for the FundFlow mutual funds platform, built to the **"How to Handle Lakhs of Users"** playbook:
one atomic PostgreSQL primary for writes, and every layer above it shrinking the load before it gets there.

```
lakhs of users → rate limit → cache (90-95% of reads) → read replicas → PgBouncer → 1 primary (writes only)
                                          write spikes → durable queue → batch workers → primary
```

## Playbook layer → code mapping

| # | Playbook layer | Where it lives |
|---|----------------|----------------|
| 1 | CDN / edge | Not in code — Cloudflare in front of the deployed app (static SPA is CDN-cacheable as-is) |
| 2 | **Cache (Redis)** | `src/cache/` — cache-aside `withCache()`; Redis adapter or in-process TTL fallback. NAV, fund lists, portfolios, stats all served from cache |
| 3 | **Read replicas** | `src/db/pools.js` — `queryRead()` round-robins across `REPLICA_URLS`; `queryPrimary()` is writes-only. Read API never touches the primary (one documented exception below) |
| 4 | **Pooling (PgBouncer)** | `docker-compose.yml` — pgbouncer service (transaction pooling, 5000 client conns → 100 real). `DATABASE_URL` points at it in production |
| 5 | **Queue + async workers** | `src/queue/` (Redis Streams or durable file queue) + `src/workers/orderWorker.js` — orders return `202 PENDING` instantly; workers settle in batches, one commit per batch |
| B | Partition big tables | `db/schema.sql` — `transactions` and `nav_history` are range-partitioned by month, partitions created programmatically |
| — | Write spikes: thin signup | `POST /api/write/auth/register` inserts only the user row; KYC runs in `kycWorker` |
| — | Write spikes: queue-don't-write | `POST /api/write/orders` — validates against cache, enqueues, acks `PENDING`. `ORDER_THIN_INTAKE=true` = zero DB work on the request path (workers batch-insert the intent rows too) |
| — | Idempotency | `orders.client_ref UNIQUE` — double-clicks, retries, queue redelivery and DLQ replays can never double-charge |
| — | Retries + backoff + jitter | `src/services/retry.js` — 2s → 4s → 8s exponential, **full jitter** (no thundering herd) |
| — | Dead Letter Queue | failed orders park in `orders:dlq`; `GET /api/read/admin/dlq` to inspect, `POST /api/write/admin/dlq/replay` to replay (idempotent) |
| — | Rate limiting | `src/middleware/rateLimit.js` — per user/IP windows on the shared cache backend |
| — | Read-after-write | `GET /api/read/orders/:clientRef` reads the **primary** (replicas lag ms); workers also invalidate the user's portfolio cache the moment an order settles |
| — | Don't over-queue | `PATCH /api/write/profile` goes straight to the primary — only spiky writes ride the queue |

## Topology

Two HTTP services from one codebase (matches the frontend's `vite.config.js` proxy):

- **Write API** — `http://localhost:5000/api/write` (auth, orders, admin/cb/amc writes)
- **Read API** — `http://localhost:5001/api/read` (everything else; cache → replica)
- **Workers** — order settlement, KYC verification, daily NAV load

`API_ROLE=read|write|worker|all` picks what a process runs (`all` = dev default), so each tier scales independently in production.

## Running it

### Dev (no Docker needed)

```bash
cd backend
npm install
npm run dev        # boots an embedded PostgreSQL on 127.0.0.1:5434,
                   # applies schema + seed, starts both APIs + workers
```

Port 5434 (not 5433) because this machine's installed PostgreSQL 16 service
already listens on 5433. The embedded cluster is created with UTF-8 encoding
(Windows initdb would otherwise default to WIN1252, which can't store the
seed's emoji data).

Cache falls back to in-process TTL, queue to a durable file queue (`data/queue/`) — same interfaces, same semantics, swap in Redis by setting `REDIS_URL`.

### Production-shaped (Docker)

```bash
cd backend
docker compose up -d          # primary + streaming replica + PgBouncer + Redis
npm run db:setup              # schema + seed via PgBouncer
DATABASE_URL=postgresql://fundflow:fundflow@localhost:6432/fundflow \
REPLICA_URLS=postgresql://fundflow:fundflow@localhost:5442/fundflow \
REDIS_URL=redis://localhost:6379 \
npm start
```

### Frontend

`npm run dev` in the project root — the existing Vite proxy already routes `/api/read` → 5001 and `/api/write` → 5000.

## Demo accounts (password: `demo123`)

| Role | Email |
|------|-------|
| Investor | client@fundflow.in |
| Corporate Banking | cb@fundflow.in |
| AMC Manager | amc@fundflow.in |
| Admin | admin@fundflow.in |

## Testing the failure paths (simulated bank API)

The worker-only bank simulator (`src/services/bankApi.js`) has deterministic hooks on the order amount's last 3 digits:

- amount ending **007** (e.g. ₹5007) → fails twice, then succeeds → watch backoff+jitter retries in the logs
- amount ending **013** (e.g. ₹5013) → fails every attempt → order goes `DEAD` and parks in the **DLQ**; replay from the admin endpoint
- anything else → ~5% random transient failure (`BANK_FAILURE_RATE`)

## Status

All done and verified end-to-end (48/48 smoke checks passing):

- [x] Frontend analysed — all mock shapes, roles, and the read/write axios split mapped
- [x] Schema + seed (partitioned `transactions` / `nav_history`, `client_ref UNIQUE`, demo data mirroring the frontend mocks)
- [x] DB pools with read/write routing, cache facade (Redis/memory), queue facade (Streams/file) with consumer groups + DLQ
- [x] JWT auth + role guards, rate limiting, retry-with-jitter, simulated bank API
- [x] Read API: amcs, schemes, scheme detail, NAV history, portfolio, transactions, order status (read-after-write), CB/AMC/Admin reads, DLQ inspection
- [x] Write API: login, thin-signup register, queued `POST /orders` (202 PENDING, idempotent), profile, CB/AMC/Admin writes, DLQ replay, NAV job trigger
- [x] Workers: batched order settlement (bank call w/ backoff+jitter → one commit per batch → cache invalidation → DLQ), KYC worker, NAV load worker
- [x] docker-compose: primary + streaming replica + PgBouncer (transaction pooling) + Redis (AOF)
- [x] Embedded-Postgres dev stack (`npm run dev`) on port 5434, UTF-8 cluster
- [x] Frontend wired: all pages call the real API via `src/api/useApi.js` (mockData.js removed), frontend builds clean
- [x] First boot + full smoke test: login (all 4 roles), cached reads, buy → `PENDING` → worker settles → portfolio updates, duplicate `clientRef` returns the same order, `₹xx07` retries then succeeds, `₹xx13` dead-letters and replays, register → async KYC verification, AMC approve / scheme CRUD / NAV job
