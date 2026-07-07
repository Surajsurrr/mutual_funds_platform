import { cache } from '../cache/index.js';

// Rate limiting per user/IP before traffic touches the DB (PDF resilience
// rule #4). Fixed one-minute window on the shared cache backend, so all app
// instances enforce one budget when Redis is configured.
export const rateLimit = (limitPerMin, bucket) => async (req, res, next) => {
  const who = req.user?.sub || req.ip;
  const windowId = Math.floor(Date.now() / 60_000);
  try {
    const count = await cache.incrWithTtl(`rl:${bucket}:${who}:${windowId}`, 60);
    res.set('X-RateLimit-Limit', String(limitPerMin));
    res.set('X-RateLimit-Remaining', String(Math.max(0, limitPerMin - count)));
    if (count > limitPerMin) {
      return res.status(429).json({ error: 'Too many requests — slow down', retryAfterSeconds: 60 });
    }
  } catch (err) {
    // A limiter outage must never take the platform down.
    console.error('[rateLimit] check failed (allowing request):', err.message);
  }
  next();
};
