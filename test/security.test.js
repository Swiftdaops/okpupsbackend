import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

// set test envs before importing app
process.env.NODE_ENV = 'test';
process.env.COOKIE_SECURE = 'true';
process.env.COOKIE_SAMESITE = 'strict';
process.env.LOGIN_RATE_LIMIT = '5';

import app from '../src/app.js';
import { Admin } from '../src/models/Admin.model.js';

let mongod;
let agent;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'okpups_test' });

  const password = 'password';
  const passwordHash = await Admin.hashPassword(password);
  await Admin.create({ email: 'admin@test.com', passwordHash });

  agent = request.agent(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

let securityScore = 0;
const maxScore = 10;

describe('Security Baseline Tests', () => {
  test('Admin route blocks unauthenticated access', async () => {
    const res = await agent.post('/admin/animals').send({});
    expect(res.statusCode).toBe(401);
    securityScore += 2;
  });

  test('JWT cookie is httpOnly, secure, and sameSite strict', async () => {
    const res = await agent.post('/auth/login').send({ email: 'admin@test.com', password: 'password' });
    expect(res.statusCode).toBe(200);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookies = setCookie.join(';');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('Secure');
    expect(cookies.toLowerCase()).toContain('samesite=strict');
    securityScore += 3;
  });

  test('Rate limiting blocks repeated login attempts', async () => {
    for (let i = 0; i < 6; i++) {
      await agent.post('/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
    }
    const res = await agent.post('/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(429);
    securityScore += 2;
  });

  // clear failed attempts so following tests can login
  test('clear failed login attempts (test helper)', async () => {
    const res = await agent.post('/test/clear-failed').send();
    expect(res.statusCode).toBe(200);
  });

  test('Stack traces are hidden in production', async () => {
    const res = await agent.get('/force-error');
    expect(res.text).not.toContain('at ');
    securityScore += 1;
  });

  test('Admin audit log is created on protected action', async () => {
    const login = await agent.post('/auth/login').send({ email: 'admin@test.com', password: 'password' });
    expect(login.statusCode).toBe(200);
    const cookie = login.headers['set-cookie'];

    const cat = await agent.post('/admin/categories').set('Cookie', cookie).send({ name: 'Puppies', type: 'pet', species: 'dog', slug: `puppies-${Date.now()}` });
    expect(cat.statusCode).toBe(201);

    const animal = await agent
      .post('/admin/animals')
      .set('Cookie', cookie)
      .send({ categoryId: cat.body.category._id, name: 'Fluffy', species: 'dog', ageWeeks: 8, price: 100, quantityAvailable: 1 });
    expect(animal.statusCode).toBe(201);

    const logs = await agent.get('/admin/audit-logs').set('Cookie', cookie);
    expect(logs.statusCode).toBe(200);
    expect(Array.isArray(logs.body.logs)).toBe(true);
    expect(logs.body.logs.length).toBeGreaterThan(0);
    securityScore += 2;
  });

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.log(`SECURITY SCORE: ${securityScore}/${maxScore}`);
  });
});
