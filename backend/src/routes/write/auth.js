import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { queryPrimary } from '../../db/pools.js';
import { queue, TOPICS } from '../../queue/index.js';
import { signToken } from '../../middleware/auth.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { asyncHandler, HttpError } from '../../middleware/errors.js';
import { config } from '../../config.js';
import { mapUser } from '../../services/mappers.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'cb', 'amc', 'admin']).optional(),
});

authRouter.post('/login', rateLimit(config.rateLimit.writePerMin, 'login'), asyncHandler(async (req, res) => {
  const { email, password, role } = loginSchema.parse(req.body);

  const { rows } = await queryPrimary('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new HttpError(401, 'Invalid email or password');
  }
  if (role && user.role !== role) {
    throw new HttpError(403, `This account is registered as '${user.role}', not '${role}'`);
  }
  if (user.status === 'Blocked' || user.status === 'Suspended') {
    throw new HttpError(403, `Account is ${user.status.toLowerCase()} — contact support`);
  }

  // Fire-and-forget activity stamp; never blocks the login response.
  queryPrimary('UPDATE users SET last_active = now() WHERE id = $1', [user.id]).catch(() => {});

  res.json({
    user: mapUser(user),
    token: signToken({ id: user.id, role: user.role, name: user.name, email: user.email, amcId: user.amc_id }),
  });
}));

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  dob: z.string().min(1),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/),
  aadhaar: z.string().regex(/^\d{12}$/),
  bankAccount: z.string().min(9),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
});

// ─── Thin signup (PDF write-spike rule #2) ───────────────────────────────────
// Registration inserts ONLY the user row — KYC, penny-drop and every external
// API call go to async workers, never inline. A registration burst costs the
// primary one small indexed insert per user.
authRouter.post('/register', rateLimit(config.rateLimit.writePerMin, 'register'), asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const { rows } = await queryPrimary(
    `INSERT INTO users (id, email, password_hash, name, phone, dob, pan, aadhaar_last4, bank_account, ifsc)
     VALUES ('USR' || lpad(nextval('usr_seq')::text, 3, '0'), $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (email) DO NOTHING
     RETURNING *`,
    [data.email.toLowerCase(), bcrypt.hashSync(data.password, 10), data.name, `+91 ${data.phone}`,
     data.dob, data.pan, data.aadhaar.slice(-4), data.bankAccount, data.ifsc]);
  if (!rows[0]) throw new HttpError(409, 'An account with this email already exists');
  const user = rows[0];

  // KYC verification happens off the request path.
  await queue.add(TOPICS.KYC, { userId: user.id, pan: data.pan });

  res.status(201).json({
    user: mapUser(user),
    token: signToken({ id: user.id, role: user.role, name: user.name, email: user.email }),
  });
}));
