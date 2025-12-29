import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

export async function setup() {
  mongod = await MongoMemoryServer.create();

  process.env.NODE_ENV = 'test';
  process.env.PORT = '0';
  process.env.MONGODB_URI = mongod.getUri('okpups_test');
  process.env.JWT_SECRET = 'test_secret_test_secret_test_secret';
  process.env.JWT_EXPIRES_IN = '2h';
  process.env.COOKIE_NAME = 'okpups_admin_token';
  process.env.COOKIE_SECURE = 'true';
  process.env.COOKIE_SAMESITE = 'strict';
  process.env.CORS_ORIGINS = 'http://localhost:3000,https://okpups.store,https://www.okpups.store';

  // Avoid Cloudinary usage in tests
  process.env.CLOUDINARY_CLOUD_NAME = 'test';
  process.env.CLOUDINARY_API_KEY = 'test';
  process.env.CLOUDINARY_API_SECRET = 'test';
  process.env.CLOUDINARY_FOLDER = 'okpups_test';

  await mongoose.connect(process.env.MONGODB_URI);

  const { Admin } = await import('../src/models/Admin.model.js');
  const email = 'admin@test.com';
  const existing = await Admin.findOne({ email });
  if (!existing) {
    const passwordHash = await Admin.hashPassword('password');
    await Admin.create({ email, passwordHash });
  }
}

export async function teardown() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

// Jest hooks
beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});
