// Deploy entrypoint: apply schema + seed (both idempotent), then start the server.
import { setupDatabase } from './db-setup.js';

console.log('[deploy] applying schema + seed...');
await setupDatabase();
console.log('[deploy] database ready');

await import('../src/server.js');
