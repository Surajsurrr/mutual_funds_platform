import { queue, TOPICS } from '../queue/index.js';
import { queryPrimary, withTransaction } from '../db/pools.js';
import { invalidate } from '../cache/index.js';

// Daily NAV load — the classic "heavy, bursty, not urgent" job the PDF says to
// push off the request path. Updates every scheme + appends to the partitioned
// nav_history table in one commit, then busts the market caches once.
export async function runNavLoad() {
  const { rows: schemes } = await queryPrimary(`SELECT id, nav FROM schemes WHERE status = 'Active'`);

  await withTransaction(async (tx) => {
    for (const s of schemes) {
      const changePct = (Math.random() - 0.45) * 2.2; // mild daily drift, slightly bullish
      const newNav = +(Number(s.nav) * (1 + changePct / 100)).toFixed(4);
      await tx.query(
        `UPDATE schemes SET nav = $2, day_change = $3, day_change_pct = $4 WHERE id = $1`,
        [s.id, newNav, +(newNav - s.nav).toFixed(4), +changePct.toFixed(4)]);
      await tx.query(
        `INSERT INTO nav_history (scheme_id, nav_date, nav) VALUES ($1, CURRENT_DATE, $2)
         ON CONFLICT (scheme_id, nav_date) DO UPDATE SET nav = EXCLUDED.nav`,
        [s.id, newNav]);
    }
  });

  await invalidate('schemes:list:*', 'scheme:*', 'nav:*', 'amcs:list', 'portfolio:*', 'stats:*');
  console.log(`[nav] daily NAV load applied to ${schemes.length} schemes`);
}

async function processNavBatch(batch) {
  // Multiple queued triggers collapse into one run.
  if (batch.length) await runNavLoad();
}

export function startNavWorker() {
  queue.consume(TOPICS.NAV, { batchSize: 10, batchWaitMs: 2000, handler: processNavBatch });
}
