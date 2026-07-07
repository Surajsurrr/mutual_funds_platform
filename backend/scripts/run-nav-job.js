// Run the daily NAV load once, directly (bypasses the queue) — `npm run job:nav`.
// Requires the database to be up (embedded dev stack or docker stack).
import { runNavLoad } from '../src/workers/navWorker.js';
import { closePools } from '../src/db/pools.js';

runNavLoad()
  .then(async () => { await closePools(); process.exit(0); })
  .catch(async (err) => { console.error('[nav-job] failed:', err); await closePools(); process.exit(1); });
