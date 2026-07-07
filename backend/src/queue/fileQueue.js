import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';

// Durable file-backed queue — the dev fallback for Redis Streams / Kafka.
// Same contract: append-only log, consumer offset, separate DLQ log. Survives
// process restarts; messages are only lost if you delete data/queue/.
export class FileQueue {
  constructor(dir) {
    this.dir = dir;
    this.nudger = new EventEmitter();
    fs.mkdirSync(dir, { recursive: true });
  }

  file(topic) { return path.join(this.dir, `${topic}.jsonl`); }
  offsetFile(topic) { return path.join(this.dir, `${topic}.offset`); }
  dlqFile(topic) { return path.join(this.dir, `${topic}.dlq.jsonl`); }

  async add(topic, data) {
    const msg = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ts: Date.now(), data };
    fs.appendFileSync(this.file(topic), JSON.stringify(msg) + '\n');
    this.nudger.emit(topic);
    return msg.id;
  }

  readOffset(topic) {
    try { return parseInt(fs.readFileSync(this.offsetFile(topic), 'utf8'), 10) || 0; }
    catch { return 0; }
  }

  readAll(topic, file = this.file(topic)) {
    try {
      return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    } catch { return []; }
  }

  /**
   * Consume messages in batches, forever. `handler(batch)` gets an array of
   * {id, data}; the offset only advances after it returns, so a crash mid-batch
   * redelivers (idempotency downstream makes redelivery safe).
   */
  async consume(topic, { batchSize, batchWaitMs, handler }) {
    for (;;) {
      const offset = this.readOffset(topic);
      const all = this.readAll(topic);
      const batch = all.slice(offset, offset + batchSize);
      if (batch.length === 0) {
        await new Promise((resolve) => {
          const onNudge = () => { clearTimeout(t); resolve(); };
          const t = setTimeout(() => { this.nudger.off(topic, onNudge); resolve(); }, batchWaitMs);
          this.nudger.once(topic, onNudge);
        });
        continue;
      }
      try {
        await handler(batch);
        fs.writeFileSync(this.offsetFile(topic), String(offset + batch.length));
      } catch (err) {
        console.error(`[queue:${topic}] batch failed, will redeliver:`, err.message);
        await new Promise((r) => setTimeout(r, batchWaitMs));
      }
    }
  }

  async deadLetter(topic, message, error) {
    fs.appendFileSync(
      this.dlqFile(topic),
      JSON.stringify({ ...message, error: String(error), deadAt: new Date().toISOString() }) + '\n'
    );
  }

  async readDLQ(topic, limit = 100) {
    return this.readAll(topic, this.dlqFile(topic)).slice(-limit);
  }

  /** Replay dead letters back onto the main queue (idempotent via client_ref). */
  async replayDLQ(topic, ids = null) {
    const dead = this.readAll(topic, this.dlqFile(topic));
    const toReplay = ids ? dead.filter((m) => ids.includes(m.id)) : dead;
    const keep = ids ? dead.filter((m) => !ids.includes(m.id)) : [];
    for (const msg of toReplay) await this.add(topic, msg.data);
    fs.writeFileSync(this.dlqFile(topic), keep.map((m) => JSON.stringify(m) + '\n').join(''));
    return toReplay.length;
  }

  async depth(topic) {
    return Math.max(0, this.readAll(topic).length - this.readOffset(topic));
  }
}
