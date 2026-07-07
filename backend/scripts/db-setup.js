// Apply schema + seed against DATABASE_URL (use this with the docker stack).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config } from '../src/config.js';
import { seed } from '../db/seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export async function setupDatabase(databaseUrl = config.databaseUrl) {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  const schema = fs.readFileSync(path.join(here, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  await seed(pool);
  await pool.end();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase()
    .then(() => { console.log('[db-setup] done'); process.exit(0); })
    .catch((err) => { console.error('[db-setup] failed:', err); process.exit(1); });
}
