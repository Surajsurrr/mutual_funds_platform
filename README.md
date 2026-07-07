# FundFlow — Mutual Funds Platform

A full-stack mutual funds demo platform with four role-based portals — **Investor**, **Corporate Banking**, **AMC Manager**, and **Admin** — built on a React SPA and an Express/PostgreSQL backend designed around the *"How to Handle Lakhs of Users"* scaling playbook (cache → replicas → pooling → queue → one primary).

**Live demo:** deployed on Render via [`render.yaml`](render.yaml) (free tier — first visit after idle takes ~50s to wake).

---

## Quick start

Prerequisites: **Node.js 22+** (no Docker, no local Postgres needed — the backend boots its own embedded PostgreSQL).

```bash
# 1. Backend — embedded Postgres on 127.0.0.1:5434, schema + seed, both APIs + workers
cd backend
npm install
npm run dev

# 2. Frontend — in a second terminal, from the repo root
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/api/read` → `:5001` and `/api/write` → `:5000` (see `vite.config.js`), so no CORS setup is needed.

> Port note: the embedded dev Postgres uses **5434** because 5433 is a common conflict with locally installed PostgreSQL. The cluster is created with UTF-8 encoding explicitly (Windows initdb would otherwise default to WIN1252 and reject the seed's emoji data).

### Demo accounts (password: `demo123`)

| Role | Email | Portal |
|------|-------|--------|
| Investor | `client@fundflow.in` | browse schemes, buy funds, portfolio, transactions |
| Corporate Banking | `cb@fundflow.in` | client onboarding/monitoring, transaction verification, reports |
| AMC Manager | `amc@fundflow.in` | scheme CRUD, investor analytics |
| Admin | `admin@fundflow.in` | user management, AMC approvals, system analytics |

---

## Repository layout

```
├── src/                        # React SPA (Vite 8, React 19, Tailwind CSS v4)
│   ├── api/
│   │   ├── axiosClients.js     # readClient (/api/read) + writeClient (/api/write), JWT header, 401 auto-logout
│   │   └── useApi.js           # one hook per endpoint (useSchemes, usePortfolio, useCbClients, ...)
│   ├── components/
│   │   ├── Navbar/  Sidebar/   # shared shell (profile dropdown, role-based nav)
│   │   └── UI/                 # Button, Input, Modal, Badge, DataTable, StatsCard
│   ├── layouts/                # AuthLayout (public marketing shell), DashboardLayout (app shell)
│   ├── pages/                  # one folder per role: Auth, Client, CB, AMC, Admin, Profile
│   ├── routes/
│   │   ├── AppRoutes.jsx       # all routes
│   │   └── PrivateRoute.jsx    # PrivateRoute / RoleRoute / PublicRoute guards
│   ├── store/authStore.js      # zustand + persist (localStorage keys: ff_token, ff_user)
│   └── index.css               # design tokens + custom classes (see "Styling" below)
│
├── backend/                    # Express + PostgreSQL (see backend/README.md for the full architecture)
│   ├── db/schema.sql           # partitioned tables, idempotent (IF NOT EXISTS)
│   ├── db/seed.js              # demo data, idempotent (ON CONFLICT DO NOTHING)
│   ├── scripts/dev-stack.js    # npm run dev: embedded PG + schema + seed + server
│   ├── scripts/deploy-start.js # production boot: schema + seed + server
│   └── src/
│       ├── routes/read/        # cache → replica reads (market, me, cb, amc, admin)
│       ├── routes/write/       # auth, orders (queued), cb, amc, admin
│       ├── workers/            # order settlement (batched), KYC, NAV load
│       ├── queue/  cache/      # Redis Streams / file queue, Redis / in-memory TTL — same interfaces
│       └── middleware/         # JWT auth, role guards, rate limiting, error handler
│
└── render.yaml                 # one-click Render blueprint (free web service + free Postgres)
```

---

## How it works (the 5-minute version)

- **Two logical APIs, one codebase.** Reads go through `/api/read` (cache-aside → read replicas), writes through `/api/write` (the only tier that touches the primary). `API_ROLE=read|write|worker|all|web` decides what a process runs, so tiers scale independently in production.
- **Orders are queued, not written.** `POST /api/write/orders` validates against cache, enqueues, and returns `202 PENDING` instantly. A worker settles orders in batches (one commit per batch) through a simulated bank API with exponential backoff + jitter; permanently failing orders park in a dead-letter queue that admins can inspect and replay. `orders.client_ref UNIQUE` makes retries and double-clicks idempotent.
- **Registration is a thin signup.** Only the user row is inserted on the request path; KYC verification runs in a background worker.
- **Auth** is a JWT in `localStorage` (`ff_token`), attached by both axios clients; a 401 anywhere wipes the session and redirects to `/login`. Route access is enforced by `RoleRoute` in `src/routes/PrivateRoute.jsx`.
- **Dev fallbacks:** without `REDIS_URL` the cache is in-process TTL and the queue is a durable file queue (`backend/data/queue/`) — same semantics, so code never branches on environment.

Deep details, layer-by-layer mapping, and the docker-compose production topology (primary + streaming replica + PgBouncer + Redis) are in [`backend/README.md`](backend/README.md).

### Demo party tricks

The simulated bank keys off the order amount's last 3 digits:

- amount ending **007** (e.g. ₹5,007) → fails twice, then succeeds — watch backoff + jitter retries in the backend logs
- amount ending **013** (e.g. ₹5,013) → fails every attempt → order goes `DEAD`, parks in the DLQ, replayable from the admin API
- anything else → ~5% random transient failure

---

## Common modifications

**Add an API endpoint.** Pick a router in `backend/src/routes/read/` or `routes/write/` (reads use `queryRead`/`withCache`, writes use `queryPrimary`), then expose it to the UI as a one-liner hook in `src/api/useApi.js`. Role restrictions come free from where you mount it (`app.js` wraps `/cb`, `/amc`, `/admin` in `requireRole`).

**Add a page.** Create it under `src/pages/<Role>/`, register it in `src/routes/AppRoutes.jsx` inside the matching `RoleRoute` block, and add a nav item in `src/components/Sidebar/Sidebar.jsx`.

**Change the seed data.** Edit `backend/db/seed.js` — it's idempotent, so just restart the backend. To start truly fresh, delete `backend/data/` (embedded PG cluster + file queue) and run `npm run dev` again.

**Styling conventions.** Dark glassmorphism theme: cards are `rgba(255,255,255,0.03)` with a `blur(12px)` backdrop, accent teal is `#12B4C3`, headings use Poppins, body uses Inter. Shared primitives live in `src/components/UI/`.

> ⚠️ **Tailwind v4 gotcha:** custom classes in `src/index.css` (e.g. `.input-field`, `.data-table`) are *unlayered* CSS, which **always beats Tailwind utility classes** (they live in `@layer utilities`). If a utility like `pl-10` mysteriously does nothing, that's why — use an inline style, or move the custom rule into `@layer components`.

**Environment variables** (all optional in dev — see `backend/.env.example`): `DATABASE_URL`, `REPLICA_URLS`, `REDIS_URL`, `JWT_SECRET`, `PORT`/`API_ROLE`, `ORDER_THIN_INTAKE`, `BANK_FAILURE_RATE`, rate-limit and TTL knobs in `backend/src/config.js`.

---

## Deployment

**Render (current setup):** `render.yaml` provisions a free web service + free Postgres. The service runs `API_ROLE=web` — a single process serving the built SPA, both APIs, and the workers on one port — and `deploy-start.js` applies schema + seed on every boot (safe: both are idempotent). Deploy via *Render dashboard → New → Blueprint → select this repo*. Free-tier caveats: sleeps after 15 min idle (~50s cold start), database expires after 30 days.

**Anywhere else:** any Node host + any Postgres works:

```bash
npm ci && npm run build                 # build the SPA into dist/
cd backend && npm ci --omit=dev
DATABASE_URL=postgres://... JWT_SECRET=... API_ROLE=web PORT=8080 node scripts/deploy-start.js
```

**Production-shaped (Docker):** `backend/docker-compose.yml` runs the full playbook topology — primary + streaming replica + PgBouncer + Redis — see `backend/README.md`.

---

## Known gaps / ideas to complete

- **Public landing content:** the login page header links (About Us / Services / Blog / Contact) point to `#anchor` sections that were never built; footer links are also dead.
- **Forgot password** links to `/forgot-password`, which has no route (falls through to the 404).
- **Navbar extras are static:** the notifications dropdown and the NAV price ticker are hardcoded demo data.
- **Admin → Settings** "save" is still a placeholder `alert()`.
- **Light mode** is not implemented (the Settings toggle says so).
- **No automated tests** — verification has been manual/end-to-end so far; the backend's clean route/worker separation makes it a good candidate for integration tests against the embedded Postgres.
- `npx oxlint src` reports harmless unused-import warnings that could be cleaned up.
