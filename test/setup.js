import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Admin } from '../src/models/Admin.model.js';

let mongo;

export default async function setup() {
  process.env.NODE_ENV = 'test';
  // Make cookies hardened for tests
  process.env.COOKIE_SECURE = 'true';
  process.env.COOKIE_SAMESITE = 'strict';
  // Lower login rate limit so tests can trigger 429
  process.env.LOGIN_RATE_LIMIT = '5';

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { dbName: 'okpups_test' });

  // create test admin
  const password = 'password';
  const passwordHash = await Admin.hashPassword(password);
  await Admin.create({ email: 'admin@test.com', passwordHash });

  return async function teardown() {
    await mongoose.disconnect();
    await mongo.stop();
  };
}
