
const request = require('supertest');
const express = require('express');
const authRouter = require('../src/routes/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Clean up the database before running the tests
    await prisma.user.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should get the user profile', async () => {
    const res = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
  });

  it('should update the user profile', async () => {
    const res = await request(app)
      .put('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Updated',
        lastName: 'User',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.user.firstName).toEqual('Updated');
  });

  it('should change the user password', async () => {
    const res = await request(app)
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      });
    expect(res.statusCode).toEqual(200);
  });
});
