import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const loginLimit = Number(env.LOGIN_RATE_LIMIT ?? 50);
const adminLimit = Number(process.env.ADMIN_RATE_LIMIT || 300);

// Keep rate limiting enabled in tests so security tests can verify it.
// Opt-out explicitly via DISABLE_RATE_LIMIT=true.
const disableRateLimit = Boolean(env.DISABLE_RATE_LIMIT);

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: loginLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => disableRateLimit
});

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: adminLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => disableRateLimit
});
