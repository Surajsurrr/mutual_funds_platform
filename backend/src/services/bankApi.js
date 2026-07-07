import { config } from '../config.js';

// Simulated external bank / payment API. Called ONLY from async workers —
// never inline on the request path (PDF resilience rule #1): one slow bank
// must not freeze the site.
//
// Deterministic test hooks (amount's last 3 digits):
//   xx13 → fails every attempt      → exercises the Dead Letter Queue
//   xx07 → fails twice, then works  → exercises backoff + jitter retries
// Anything else fails transiently at BANK_FAILURE_RATE (default 5%).
const attemptsByRef = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function debitBankAccount({ clientRef, amount }) {
  await sleep(config.bank.latencyMs * (0.5 + Math.random()));

  const marker = Math.round(amount) % 1000;
  const attempt = (attemptsByRef.get(clientRef) || 0) + 1;
  attemptsByRef.set(clientRef, attempt);

  if (marker === 13) {
    throw new Error('BANK_TIMEOUT: gateway did not respond');
  }
  if (marker === 7 && attempt <= 2) {
    throw new Error(`BANK_TIMEOUT: transient outage (attempt ${attempt})`);
  }
  if (marker !== 7 && Math.random() < config.bank.failureRate) {
    throw new Error('BANK_TIMEOUT: intermittent network failure');
  }

  attemptsByRef.delete(clientRef);
  return { utr: `UTR${Date.now()}${Math.floor(Math.random() * 1000)}`, debitedAt: new Date().toISOString() };
}

/** Simulated penny-drop / KYC verification, also worker-only. */
export async function verifyKycExternal({ pan }) {
  await sleep(1500 + Math.random() * 1500);
  return { verified: true, pan, verifiedAt: new Date().toISOString() };
}
