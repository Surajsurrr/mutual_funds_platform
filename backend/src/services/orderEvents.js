import { EventEmitter } from 'node:events';
import { config } from '../config.js';

// ─── Order-event bus for SSE push ────────────────────────────────────────────
// Workers publish "order settled/failed" here; the read API's SSE endpoint
// subscribes and pushes to the browser. Redis pub/sub when REDIS_URL is set
// (workers may live in a different process than the read service); an
// in-process EventEmitter otherwise (dev 'all' / demo 'web' run everything
// in one process anyway).

const CHANNEL = 'order-events';
const emitter = new EventEmitter();
emitter.setMaxListeners(0); // one listener per open SSE connection

let pub = null;
if (config.redisUrl) {
  const { Redis } = await import('ioredis');
  pub = new Redis(config.redisUrl, { maxRetriesPerRequest: 2, enableOfflineQueue: false });
  pub.on('error', (err) => console.error('[events] redis pub error:', err.message));

  const sub = new Redis(config.redisUrl, { maxRetriesPerRequest: 2 });
  sub.on('error', (err) => console.error('[events] redis sub error:', err.message));
  sub.subscribe(CHANNEL);
  sub.on('message', (channel, raw) => {
    if (channel !== CHANNEL) return;
    try {
      emitter.emit(CHANNEL, JSON.parse(raw));
    } catch { /* malformed message — drop */ }
  });
  console.log('[events] order events over Redis pub/sub');
}

/** Publish an order status change. Never throws — SSE is best-effort;
 *  the DB row is the source of truth and the stream re-checks it anyway. */
export async function publishOrderEvent(event) {
  try {
    if (pub) await pub.publish(CHANNEL, JSON.stringify(event));
    else emitter.emit(CHANNEL, event);
  } catch (err) {
    console.error('[events] publish failed (non-fatal):', err.message);
  }
}

/** Subscribe to all order events. Returns an unsubscribe function. */
export function subscribeOrderEvents(listener) {
  emitter.on(CHANNEL, listener);
  return () => emitter.off(CHANNEL, listener);
}
