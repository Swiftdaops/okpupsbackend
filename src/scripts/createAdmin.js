import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.model.js';

await connectDb();

if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  // eslint-disable-next-line no-console
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  process.exit(1);
}

const email = env.ADMIN_EMAIL.toLowerCase();
const existing = await Admin.findOne({ email });
if (existing) {
  // eslint-disable-next-line no-console
  console.log('Admin already exists:', email);
  process.exit(0);
}

const passwordHash = await Admin.hashPassword(env.ADMIN_PASSWORD);
await Admin.create({ email, passwordHash });

// eslint-disable-next-line no-console
console.log('Admin created:', email);
process.exit(0);
