import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.model.js';

export async function requireAdmin(req, res, next) {
  try {
    const cookieToken = req.cookies?.[env.COOKIE_NAME];
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    const bearerToken =
      typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null;

    const token = cookieToken || bearerToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub).select('_id email role');
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });
    req.admin = admin;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
