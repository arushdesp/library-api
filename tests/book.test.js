
const request = require('supertest');
const express = require('express');
const bookRouter = require('../src/routes/book');
const authRouter = require('../src/routes/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = express();
app.use(express.json());
app.use('/books', bookRouter);
app.use('/auth', authRouter);

describe('Book Endpoints', () => {
  let token;
  let bookId;

  beforeAll(async () => {
    // Clean up the database
    await prisma.book.deleteMany({});
    await prisma.user.deleteMany({});

    // Register and login a user to get a token
    await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Book',
        lastName: 'Tester',
        email: 'booktester@example.com',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'booktester@example.com',
        password: 'Password123!',
      });
    token = res.body.token;
  });

  it('should create a new book', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        publishedYear: 1925,
      });
    if (res.statusCode !== 201) {
      console.error(res.body);
    }
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    bookId = res.body.id;
  });

  it('should get a list of books', async () => {
    const res = await request(app)
      .get('/books')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('should get a single book by id', async () => {
    const res = await request(app)
      .get(`/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', bookId);
  });

  it('should update a book', async () => {
    const res = await request(app)
      .put(`/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'The Great Gatsby - Updated',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        publishedYear: 1925,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Book updated');
  });

  it('should delete a book', async () => {
    const res = await request(app)
      .delete(`/books/${bookId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(204);
  });
});
