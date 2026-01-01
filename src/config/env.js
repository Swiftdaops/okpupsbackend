import 'dotenv/config';
import { z } from 'zod';

// Helper to handle various boolean-like strings from environment variables
const boolish = z
  .string()
  .transform((v) => v.toLowerCase())
  .refine((v) => ['true', 'false', '1', '0', 'yes', 'no'].includes(v))
  .transform((v) => ['true', '1', 'yes'].includes(v));

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('2h'),

  COOKIE_NAME: z.string().default('okpups_admin_token'),
  COOKIE_SECURE: boolish.default('false'),
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('strict'),

  // Added your new URL here and removed trailing slashes for cleaner matching
  CORS_ORIGINS: z
    .string()
    .default(
      'http://localhost:3000,' +
      'https://okpupsbackend-7gv3.onrender.com,' +
      'https://okpups.store,'
      'https://okpups.vercel.app'
    )
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),

  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  DISABLE_RATE_LIMIT: boolish.default('false'),

  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  CLOUDINARY_FOLDER: z.string().default('okpups'),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional()
});

// Validate process.env against the schema
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '❌ Invalid environment variables:', 
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1);
}

// Apply production-safe defaults when not explicitly provided in the environment.
const computed = { ...parsed.data };
if (computed.NODE_ENV === 'production') {
  if (!Object.prototype.hasOwnProperty.call(process.env, 'COOKIE_SAMESITE')) {
    computed.COOKIE_SAMESITE = 'none';
  }
  if (!Object.prototype.hasOwnProperty.call(process.env, 'COOKIE_SECURE')) {
    computed.COOKIE_SECURE = true;
  }
  // Ensure CORS origins include the production frontend if not already provided
  if (!Object.prototype.hasOwnProperty.call(process.env, 'CORS_ORIGINS')) {
    computed.CORS_ORIGINS = ['https://okpups.store', 'https://www.okpups.store', 'http://localhost:3000'];
  }
}

export const env = computed;
