import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import { loginRateLimit, adminRateLimit } from './middlewares/rateLimit.middleware.js';

import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import animalRoutes from './routes/animal.routes.js';
import productRoutes from './routes/product.routes.js';
import adminRoutes from './routes/admin.routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  // Allow Private Network preflight from public origins (for browsers enforcing PNA)
  app.use((req, res, next) => {
    try {
      if (
        req.method === 'OPTIONS' &&
        req.headers['access-control-request-private-network']
      ) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
      }
    } catch (e) {
      // ignore
    }
    return next();
  });
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        try {
          if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
          // Allow common production frontends if not explicitly configured
          const host = new URL(origin).hostname;
          if (host === 'okpups.vercel.app' || host.endsWith('.vercel.app')) return cb(null, true);
          if (host === 'okpups.store' || host.endsWith('.okpups.store')) return cb(null, true);
        } catch (e) {
          // fall through to block
        }
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.get('/force-error', (req, res, next) => next(new Error('Forced error')));

  // Test-only helpers
  if (env.NODE_ENV === 'test') {
    // import lazily to avoid circulars during normal runtime
    app.post('/test/clear-failed', async (req, res) => {
      try {
        // clear failed attempts map in auth controller
        const { clearFailedAttempts } = await import('./controllers/auth.controller.js');
        clearFailedAttempts();
        // reset express-rate-limit counters for login route (test only)
        const { loginRateLimit } = await import('./middlewares/rateLimit.middleware.js');
        try {
          const ip = req.ip || req.connection?.remoteAddress;
          if (loginRateLimit && typeof loginRateLimit.resetKey === 'function') {
            loginRateLimit.resetKey(ip);
          }
        } catch (e) {
          // ignore
        }
        return res.json({ ok: true });
      } catch (err) {
        return res.status(500).json({ message: 'failed' });
      }
    });
  }

  app.use('/auth', loginRateLimit, authRoutes);
  app.use('/categories', categoryRoutes);
  app.use('/animals', animalRoutes);
  app.use('/products', productRoutes);

  app.use('/admin', adminRateLimit, adminRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

const app = createApp();
export default app;

