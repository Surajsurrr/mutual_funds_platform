import { config } from '../config.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry with exponential backoff + FULL JITTER (PDF gotcha #4).
 * Base 2s doubles each attempt (2s → 4s → 8s), but the actual wait is a random
 * point in [0, cap] so thousands of failed orders don't retry in lockstep and
 * hammer the bank the instant it recovers (thundering herd).
 */
export async function withRetry(fn, { maxAttempts = config.retry.maxAttempts, baseDelayMs = config.retry.baseDelayMs, onRetry } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (err.permanent || attempt === maxAttempts) break;
      const cap = baseDelayMs * 2 ** (attempt - 1);
      const delay = Math.round(Math.random() * cap);
      onRetry?.(attempt, delay, err);
      await sleep(delay);
    }
  }
  throw lastError;
}
