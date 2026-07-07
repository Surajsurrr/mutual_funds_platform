import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { Router } from 'express';
import { config } from './config.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errors.js';

import { marketRouter } from './routes/read/market.js';
import { meRouter } from './routes/read/me.js';
import { cbReadRouter } from './routes/read/cb.js';
import { amcReadRouter } from './routes/read/amc.js';
import { adminReadRouter } from './routes/read/admin.js';

import { authRouter } from './routes/write/auth.js';
import { ordersRouter } from './routes/write/orders.js';
import { cbWriteRouter } from './routes/write/cb.js';
import { amcWriteRouter } from './routes/write/amc.js';
import { adminWriteRouter } from './routes/write/admin.js';

// The app tier is STATELESS — no sessions, no local state — so read and write
// services scale horizontally behind a load balancer and can be autoscaled
// independently for launch events.
export function buildApp(role) {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (req, res) => res.json({ ok: true, role, uptime: process.uptime() }));

  if (role === 'read' || role === 'web' || role === 'all') {
    // ─── Read service: cache → replica. Never the primary (except the one
    // documented read-after-write endpoint). ────────────────────────────────
    const read = Router();
    read.use(requireAuth, rateLimit(config.rateLimit.readPerMin, 'read'));
    read.use(marketRouter);
    read.use('/cb', requireRole('cb', 'admin'), cbReadRouter);
    read.use('/amc', requireRole('amc', 'admin'), amcReadRouter);
    read.use('/admin', requireRole('admin'), adminReadRouter);
    // Last: this role guard runs for every path that falls through to here,
    // so the role-scoped routers above must be mounted before it.
    read.use(requireRole('client', 'admin'), meRouter);
    app.use('/api/read', read);
  }

  if (role === 'write' || role === 'web' || role === 'all') {
    // ─── Write service: the only tier that talks to the primary. ────────────
    const write = Router();
    write.use('/auth', authRouter); // public: login + register
    write.use(requireAuth, rateLimit(config.rateLimit.writePerMin, 'write'));
    write.use(ordersRouter); // POST /orders (queued), PATCH /profile (direct)
    write.use('/cb', requireRole('cb', 'admin'), cbWriteRouter);
    write.use('/amc', requireRole('amc', 'admin'), amcWriteRouter);
    write.use('/admin', requireRole('admin'), adminWriteRouter);
    app.use('/api/write', write);
  }

  if (role === 'web') {
    // Single-service deploy: serve the built SPA next to the APIs.
    const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
    app.use(express.static(dist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  app.use((req, res) => res.status(404).json({ error: `No route: ${req.method} ${req.path}` }));
  app.use(errorHandler);
  return app;
}
