// ─── One-command dev stack ───────────────────────────────────────────────────
// Boots a real (embedded) PostgreSQL on 127.0.0.1:5433, applies schema + seed,
// then starts the read API, write API and workers in one process.
// No Docker required. Production uses docker-compose.yml instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';
import { setupDatabase } from './db-setup.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, '..', 'data', 'pg');
// 5434: this machine's installed PostgreSQL 16 service already owns 5433.
const PORT = 5434;

const pgServer = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'postgres',
  port: PORT,
  persistent: true,
  // Windows initdb defaults to the ANSI codepage (WIN1252), which cannot store
  // the seed's emoji/UTF-8 data — force a UTF-8 cluster.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
});

async function main() {
  const alreadyInitialised = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!alreadyInitialised) {
    console.log('[dev-stack] initialising embedded PostgreSQL (first run)...');
    await pgServer.initialise();
  }
  await pgServer.start();
  console.log(`[dev-stack] PostgreSQL running on 127.0.0.1:${PORT}`);

  try {
    await pgServer.createDatabase('fundflow');
  } catch {
    /* database already exists */
  }

  await setupDatabase();
  console.log('[dev-stack] schema + seed applied');

  await import('../src/server.js');
}

async function shutdown() {
  console.log('\n[dev-stack] stopping embedded PostgreSQL...');
  try { await pgServer.stop(); } catch { /* already stopped */ }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch(async (err) => {
  console.error('[dev-stack] failed to start:', err);
  try { await pgServer.stop(); } catch { /* noop */ }
  process.exit(1);
});
