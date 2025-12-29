import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Admin } from '../models/Admin.model.js';
import { sanitizeObject } from '../utils/sanitizeInput.js';
import { env } from '../config/env.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function cookieOptions() {
  const rawSecure = process.env.COOKIE_SECURE;
  const secure = rawSecure === 'true' || rawSecure === '1' || rawSecure === true || process.env.NODE_ENV === 'test';
  const sameSite = process.env.COOKIE_SAMESITE || 'strict';
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 2 * 60 * 60 * 1000
  };
}

// Simple in-memory failed login counter used for tests to simulate rate limiting
const failedAttempts = new Map();

export function clearFailedAttempts() {
  failedAttempts.clear();
}

export async function login(req, res, next) {
  try {
    const body = sanitizeObject(req.body);
    const { email, password } = loginSchema.parse(body);
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const limit = Number(process.env.LOGIN_RATE_LIMIT || 50);

    if (!admin) {
      const cur = (failedAttempts.get(ip) || 0) + 1;
      failedAttempts.set(ip, cur);
      if (cur > limit) return res.status(429).json({ message: 'Too many attempts' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await admin.verifyPassword(password);
    if (!ok) {
      const cur = (failedAttempts.get(ip) || 0) + 1;
      failedAttempts.set(ip, cur);
      if (cur > limit) return res.status(429).json({ message: 'Too many attempts' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: admin.role }, env.JWT_SECRET, {
      subject: String(admin._id),
      expiresIn: env.JWT_EXPIRES_IN
    });

    // reset failed attempts on success
    failedAttempts.delete(ip);
    const cookieName = process.env.COOKIE_NAME || 'okpups_admin_token';
    res.cookie(cookieName, token, cookieOptions());
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE
  });
  return res.json({ ok: true });
}

export async function me(req, res) {
  return res.json({ admin: { id: req.admin._id, email: req.admin.email, role: req.admin.role, avatarUrl: req.admin.avatarUrl || '' } });
}
