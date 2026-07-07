// In-process TTL cache — dev fallback with the exact same interface as the
// Redis adapter. Fine for one process; use Redis the moment there are two.
export class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const hit = this.store.get(key);
    if (!hit) return null;
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return hit.value;
  }

  async set(key, value, ttlSeconds) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(...keys) {
    for (const key of keys) {
      if (key.endsWith('*')) {
        const prefix = key.slice(0, -1);
        for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k);
      } else {
        this.store.delete(key);
      }
    }
  }

  async incrWithTtl(key, ttlSeconds) {
    const hit = this.store.get(key);
    if (!hit || hit.expiresAt < Date.now()) {
      this.store.set(key, { value: 1, expiresAt: Date.now() + ttlSeconds * 1000 });
      return 1;
    }
    hit.value += 1;
    return hit.value;
  }
}
