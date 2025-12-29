import request from 'supertest';
import app from '../src/app.js';

let securityScore = 0;
const maxScore = 10;

describe('Security Baseline Tests', () => {
  test('Admin route blocks unauthenticated access', async () => {
    const res = await request(app).post('/admin/animals');
    expect(res.statusCode).toBe(401);
    securityScore += 2;
  });

  test('JWT cookie is httpOnly, secure, and sameSite strict', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'admin@test.com', password: 'password' });

    const cookies = (res.headers['set-cookie'] || []).join('');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('Secure');
    expect(cookies).toContain('SameSite=Strict');
    securityScore += 3;
  });

  test('Rate limiting blocks repeated login attempts', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post('/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
    }

    const res = await request(app).post('/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(429);
    securityScore += 2;
  });

  test('Stack traces are hidden in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app).get('/force-error');
    expect(res.text).not.toContain('at ');
    securityScore += 1;
  });

  test('Admin audit log is created on protected action', async () => {
    const login = await request(app).post('/auth/login').send({ email: 'admin@test.com', password: 'password' });
    const cookie = login.headers['set-cookie'];

    // Create a category then an animal to generate audit logs
    const cat = await request(app)
      .post('/admin/categories')
      .set('Cookie', cookie)
      .send({ name: 'Puppies', type: 'pet', species: 'dog', slug: `puppies-${Date.now()}` });
    expect(cat.statusCode).toBe(201);

    const animal = await request(app)
      .post('/admin/animals')
      .set('Cookie', cookie)
      .send({
        categoryId: cat.body.category._id,
        nameOrTag: 'Test Puppy',
        species: 'dog',
        ageWeeks: 8,
        sex: 'male',
        price: 100,
        quantityAvailable: 1,
        availableForDelivery: false,
        isActive: true
      });
    expect(animal.statusCode).toBe(201);

    const logs = await request(app).get('/admin/audit-logs').set('Cookie', cookie);
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
