import { config } from '../config.js';

// ─── Layer 5: the shock absorber ─────────────────────────────────────────────
// Accept fast & durably → acknowledge instantly → workers write at the DB's
// pace. Redis Streams in production, durable file queue in dev.
export const TOPICS = {
  ORDERS: 'orders',
  KYC: 'kyc',
  NAV: 'nav-load',
};

let queue;
if (config.redisUrl) {
  const { RedisStreamsQueue } = await import('./redisStreams.js');
  queue = new RedisStreamsQueue(config.redisUrl);
  console.log('[queue] using Redis Streams');
} else {
  const { FileQueue } = await import('./fileQueue.js');
  queue = new FileQueue(config.queueDir);
  console.log('[queue] REDIS_URL not set — using durable file queue at', config.queueDir);
}

export { queue };
