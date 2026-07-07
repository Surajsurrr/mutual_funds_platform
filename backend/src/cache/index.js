import { config } from '../config.js';
import { MemoryCache } from './memoryCache.js';

// ─── Layer 2: the biggest win ────────────────────────────────────────────────
// NAV, fund lists and stats change rarely — serve 90-95% of reads from memory.
// Redis when REDIS_URL is set; in-process TTL cache otherwise (dev).
let cache;
if (config.redisUrl) {
  const { RedisCache } = await import('./redisCache.js');
  cache = new RedisCache(config.redisUrl);
  console.log('[cache] using Redis at', config.redisUrl);
} else {
  cache = new MemoryCache();
  console.log('[cache] REDIS_URL not set — using in-process TTL cache');
}

export { cache };

/**
 * Cache-aside: return the cached value, or compute it, store it and return it.
 * A cache failure must never take reads down — fall through to the DB.
 */
export async function withCache(key, ttlSeconds, compute) {
  try {
    const hit = await cache.get(key);
    if (hit !== null) return hit;
  } catch (err) {
    console.error('[cache] get failed, falling through to DB:', err.message);
  }
  const value = await compute();
  try {
    await cache.set(key, value, ttlSeconds);
  } catch (err) {
    console.error('[cache] set failed (non-fatal):', err.message);
  }
  return value;
}

/** Invalidate keys/patterns (e.g. after a write settles). Never throws. */
export async function invalidate(...keys) {
  try {
    await cache.del(...keys);
  } catch (err) {
    console.error('[cache] invalidate failed (non-fatal):', err.message);
  }
}
