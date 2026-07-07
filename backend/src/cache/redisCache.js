import { Redis } from 'ioredis';

// Layer 2: Redis cache adapter. Values are JSON; wildcard deletes use SCAN so
// invalidation never blocks the server.
export class RedisCache {
  constructor(url) {
    this.redis = new Redis(url, { maxRetriesPerRequest: 2, enableOfflineQueue: false });
    this.redis.on('error', (err) => console.error('[cache] redis error:', err.message));
  }

  async get(key) {
    const raw = await this.redis.get(key);
    return raw === null ? null : JSON.parse(raw);
  }

  async set(key, value, ttlSeconds) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys) {
    const exact = keys.filter((k) => !k.endsWith('*'));
    if (exact.length) await this.redis.del(...exact);
    for (const pattern of keys.filter((k) => k.endsWith('*'))) {
      let cursor = '0';
      do {
        const [next, found] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = next;
        if (found.length) await this.redis.del(...found);
      } while (cursor !== '0');
    }
  }

  async incrWithTtl(key, ttlSeconds) {
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, ttlSeconds);
    return count;
  }
}
