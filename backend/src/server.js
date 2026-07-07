import { config } from './config.js';
import { buildApp } from './app.js';
import { closePools } from './db/pools.js';
import { startOrderWorker } from './workers/orderWorker.js';
import { startKycWorker } from './workers/kycWorker.js';
import { startNavWorker } from './workers/navWorker.js';

// ─── Deployment shape mirrors the playbook ───────────────────────────────────
//   API_ROLE=read   → read service  (scale these with traffic; cache + replicas)
//   API_ROLE=write  → write service (talks to the primary via PgBouncer)
//   API_ROLE=worker → queue consumers only (drain rate independent of web tier)
//   API_ROLE=all    → everything in one process (development default)
//   API_ROLE=web    → demo deploy: both APIs + workers + the built SPA on one PORT
const role = config.apiRole;
const servers = [];

if (role === 'web') {
  servers.push(
    buildApp('web').listen(config.webPort, () =>
      console.log(`[server] WEB (spa + read + write) → http://localhost:${config.webPort}`))
  );
}

if (role === 'write' || role === 'all') {
  servers.push(
    buildApp('write').listen(config.writePort, () =>
      console.log(`[server] WRITE api  → http://localhost:${config.writePort}/api/write`))
  );
}

if (role === 'read' || role === 'all') {
  servers.push(
    buildApp('read').listen(config.readPort, () =>
      console.log(`[server] READ  api  → http://localhost:${config.readPort}/api/read`))
  );
}

if (role === 'worker' || role === 'all' || role === 'web') {
  startOrderWorker();
  startKycWorker();
  startNavWorker();
  console.log('[server] workers    → orders / kyc / nav-load consumers running');
}

async function shutdown() {
  console.log('[server] shutting down...');
  await Promise.allSettled(servers.map((s) => new Promise((r) => s.close(r))));
  await closePools();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
