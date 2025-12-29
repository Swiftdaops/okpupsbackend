import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function notFoundMiddleware(req, res) {
  res.status(404).json({ message: 'Not found' });
}

export function errorMiddleware(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      issues: err.issues
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key' });
  }

  const message = env.NODE_ENV === 'production' ? 'Server error' : err?.message || 'Server error';
  return res.status(status).json({ message });
}
