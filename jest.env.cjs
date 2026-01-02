// Runs BEFORE test files are evaluated (important for ESM import order).
// Keep this minimal: only env vars required for app/env validation.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_test_secret_test_secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// env schema requires a non-empty MONGODB_URI at import-time.
// Tests using mongodb-memory-server will connect to their own URI in beforeAll.
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/okpups_test';

process.env.COOKIE_NAME = process.env.COOKIE_NAME || 'okpups_admin_token';
process.env.COOKIE_SECURE = process.env.COOKIE_SECURE || 'true';
process.env.COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || 'strict';

// Keep low so security test can hit 429 reliably.
process.env.LOGIN_RATE_LIMIT = process.env.LOGIN_RATE_LIMIT || '5';

// Avoid Cloudinary usage in tests.
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test';
process.env.CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'okpups_test';

// Allow typical local + prod frontends.
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:3000,https://okpups.store,https://www.okpups.store,https://okpups.vercel.app';
