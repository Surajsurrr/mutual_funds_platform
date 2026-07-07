import { Redis } from 'ioredis';

// Layer 5 (production): Redis Streams with consumer groups.
// XADD is O(1) and durable (AOF) — the stream absorbs NFO/SIP bursts while
// workers XREADGROUP at the database's pace. Same contract as FileQueue.
export class RedisStreamsQueue {
  constructor(url) {
    this.redis = new Redis(url, { maxRetriesPerRequest: null });
    this.blocking = new Redis(url, { maxRetriesPerRequest: null }); // dedicated conn for XREADGROUP BLOCK
    this.group = 'workers';
    this.consumer = `worker-${process.pid}`;
  }

  async add(topic, data) {
    return this.redis.xadd(topic, '*', 'data', JSON.stringify(data));
  }

  async ensureGroup(topic) {
    try {
      await this.redis.xgroup('CREATE', topic, this.group, '0', 'MKSTREAM');
    } catch (err) {
      if (!String(err.message).includes('BUSYGROUP')) throw err;
    }
  }

  parse(entries) {
    return entries.map(([id, fields]) => ({ id, data: JSON.parse(fields[1]) }));
  }

  async consume(topic, { batchSize, batchWaitMs, handler }) {
    await this.ensureGroup(topic);
    for (;;) {
      try {
        // Reclaim messages a crashed worker left pending for >60s.
        const [, claimed] = await this.redis.xautoclaim(topic, this.group, this.consumer, 60_000, '0', 'COUNT', batchSize);
        let batch = this.parse(claimed ?? []);
        if (batch.length === 0) {
          const res = await this.blocking.xreadgroup(
            'GROUP', this.group, this.consumer,
            'COUNT', batchSize, 'BLOCK', batchWaitMs,
            'STREAMS', topic, '>'
          );
          if (!res) continue;
          batch = this.parse(res[0][1]);
        }
        if (batch.length === 0) continue;
        await handler(batch);
        await this.redis.xack(topic, this.group, ...batch.map((m) => m.id));
      } catch (err) {
        console.error(`[queue:${topic}] consume error:`, err.message);
        await new Promise((r) => setTimeout(r, batchWaitMs));
      }
    }
  }

  async deadLetter(topic, message, error) {
    await this.redis.xadd(
      `${topic}:dlq`, '*',
      'data', JSON.stringify({ ...message, error: String(error), deadAt: new Date().toISOString() })
    );
  }

  async readDLQ(topic, limit = 100) {
    const entries = await this.redis.xrange(`${topic}:dlq`, '-', '+', 'COUNT', limit);
    return entries.map(([id, fields]) => ({ ...JSON.parse(fields[1]), id }));
  }

  async replayDLQ(topic, ids = null) {
    const dead = await this.readDLQ(topic, 10_000);
    const toReplay = ids ? dead.filter((m) => ids.includes(m.id)) : dead;
    for (const msg of toReplay) {
      await this.add(topic, msg.data);
      await this.redis.xdel(`${topic}:dlq`, msg.id);
    }
    return toReplay.length;
  }

  async depth(topic) {
    return this.redis.xlen(topic);
  }
}
