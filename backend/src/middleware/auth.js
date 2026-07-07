import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Stateless JWT auth — no session lookup on the request path, so the app tier
// scales horizontally without sticky sessions.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, config.jwtSecret); // { sub, role, name, email }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name, email: user.email, amcId: user.amcId ?? null },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );
}
