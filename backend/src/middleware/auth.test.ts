import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, describe, expect, test } from '@jest/globals';
import { protect } from './auth.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const secret = 'test-secret-with-more-than-thirty-two-characters';
const app = express();
app.get('/private', protect, (req, res) => {
  res.json({ userId: (req as AuthenticatedRequest).userId });
});

const originalSecret = process.env.JWT_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});

describe('protect middleware', () => {
  test('rejects a request without a bearer token', async () => {
    process.env.JWT_SECRET = secret;

    const response = await request(app).get('/private');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/not authorized/i);
  });

  test('accepts a valid HS256 token and exposes its user id', async () => {
    process.env.JWT_SECRET = secret;
    const token = jwt.sign({ id: 'user-1' }, secret, { algorithm: 'HS256' });

    const response = await request(app)
      .get('/private')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: 'user-1' });
  });

  test('rejects tokens signed with another algorithm', async () => {
    process.env.JWT_SECRET = secret;
    const token = jwt.sign({ id: 'user-1' }, secret, { algorithm: 'HS384' });

    const response = await request(app)
      .get('/private')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token is not valid');
  });

  test('reports missing authentication configuration', async () => {
    delete process.env.JWT_SECRET;

    const response = await request(app)
      .get('/private')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Authentication is not configured');
  });
});
