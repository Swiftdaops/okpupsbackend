import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

// test env before importing app
process.env.NODE_ENV = 'test';
process.env.COOKIE_SECURE = 'true';
process.env.COOKIE_SAMESITE = 'strict';
process.env.LOGIN_RATE_LIMIT = '1000';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';

import app from '../src/app.js';
import { Admin } from '../src/models/Admin.model.js';

let mongod;
let adminCookie;
let resCategoryId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'okpups_test' });

  const pw = 'password';
  const hash = await Admin.hashPassword(pw);
  await Admin.create({ email: 'admin@test.com', passwordHash: hash });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('API Functional Tests', () => {
  test('Admin login works', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });

    expect(res.statusCode).toBe(200);
    adminCookie = res.headers['set-cookie'];
  });

  test('Create category (authorized)', async () => {
    const res = await request(app)
      .post('/admin/categories')
      .set('Cookie', adminCookie)
      .send({
        name: 'Puppies',
        species: 'dog',
        type: 'pet',
        slug: `puppies-${Date.now()}`
      });

    expect(res.statusCode).toBe(201);
    // store created category id for later
    expect(res.body.category).toBeDefined();
    resCategoryId = res.body.category._id;
  });

  test('Fail product creation without required fields', async () => {
    const res = await request(app)
      .post('/admin/products')
      .set('Cookie', adminCookie)
      .send({ name: 'Incomplete Product' });

    expect(res.statusCode).toBe(400);
  });

  test('Create animal baby successfully', async () => {
    const res = await request(app)
      .post('/admin/animals')
      .set('Cookie', adminCookie)
      .send({
        categoryId: resCategoryId,
        species: 'dog',
        breed: 'German Shepherd',
        ageWeeks: 8,
        price: 350000,
        quantityAvailable: 1,
        nameOrTag: 'Buddy'
      });

    expect(res.statusCode).toBe(201);
  });

  test('Public cannot access admin routes', async () => {
    const res = await request(app).get('/admin/animals');
    expect(res.statusCode).toBe(401);
  });
});
