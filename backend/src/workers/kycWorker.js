import { queue, TOPICS } from '../queue/index.js';
import { queryPrimary } from '../db/pools.js';
import { withRetry } from '../services/retry.js';
import { verifyKycExternal } from '../services/bankApi.js';

// Thin signup's other half: the registration endpoint only inserted the user
// row; KYC / penny-drop verification happens here, off the request path.
async function processKycBatch(batch) {
  for (const { data } of batch) {
    try {
      await withRetry(() => verifyKycExternal({ pan: data.pan }));
      await queryPrimary(
        `UPDATE users SET kyc_status = 'verified' WHERE id = $1 AND kyc_status = 'pending'`,
        [data.userId]);
      console.log(`[kyc] ${data.userId} verified`);
    } catch (err) {
      await queue.deadLetter(TOPICS.KYC, { data }, err.message);
      console.error(`[kyc] ${data.userId} → DLQ:`, err.message);
    }
  }
}

export function startKycWorker() {
  queue.consume(TOPICS.KYC, { batchSize: 50, batchWaitMs: 1000, handler: processKycBatch });
}
