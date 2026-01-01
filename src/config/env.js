import 'dotenv/config';
import { z } from 'zod';

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

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,https://okpupsbackend-7gv3.onrender.com,https://okpups.vercel.app')
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

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
