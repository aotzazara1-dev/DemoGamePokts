import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import { DatabaseEngine } from '../src/db/DatabaseEngine.js';
import { AccountRepository } from '../src/db/AccountRepository.js';
import { HeroRepository } from '../src/db/HeroRepository.js';
import { createAuthRouter } from '../src/api/auth-routes.js';

describe('HTTP Authentication Endpoints (Ticket 02)', () => {
  let app: Express;
  let dbEngine: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;

  beforeEach(async () => {
    dbEngine = new DatabaseEngine();
    await dbEngine.init();
    accountRepo = new AccountRepository(dbEngine);
    heroRepo = new HeroRepository(dbEngine);

    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', createAuthRouter(accountRepo));
  });

  afterEach(() => {
    dbEngine.close();
  });

  describe('POST /api/auth/guest', () => {
    it('creates a new guest session if no token provided', async () => {
      const res = await request(app)
        .post('/api/auth/guest')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.account.isGuest).toBe(true);
      expect(res.body.account.id).toBeDefined();
      expect(res.body.guestToken).toBeDefined();
    });

    it('reuses existing guest account if valid guestToken is supplied', async () => {
      const res1 = await request(app)
        .post('/api/auth/guest')
        .send({ guestToken: 'my_guest_device_1' });

      const res2 = await request(app)
        .post('/api/auth/guest')
        .send({ guestToken: 'my_guest_device_1' });

      expect(res1.body.account.id).toBe(res2.body.account.id);
    });
  });

  describe('POST /api/auth/register', () => {
    it('registers a new account and returns session token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'PlayerOne', password: 'secretpassword123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.account.username).toBe('PlayerOne');
      expect(res.body.account.isGuest).toBe(false);
    });

    it('rejects registration with duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'DuplicateUser', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'DuplicateUser', password: 'anotherpassword' });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('rejects short passwords or short usernames', async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', password: 'password123' });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ username: 'validuser', password: '123' });
      expect(res2.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in successfully with correct credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'LoginTest', password: 'correctPassword' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'LoginTest', password: 'correctPassword' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.account.username).toBe('LoginTest');
    });

    it('rejects login with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'LoginTest2', password: 'correctPassword' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'LoginTest2', password: 'wrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid.*password/i);
    });

    it('rejects login with nonexistent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'GhostUser', password: 'anyPassword' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/link-account', () => {
    it('upgrades a guest account to permanent username/password', async () => {
      // 1. Create Guest
      const guestRes = await request(app)
        .post('/api/auth/guest')
        .send({ guestToken: 'link_test_guest' });

      const guestToken = guestRes.body.token;

      // 2. Link Account
      const linkRes = await request(app)
        .post('/api/auth/link-account')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ username: 'PromotedPlayer', password: 'newPassword123' });

      expect(linkRes.status).toBe(200);
      expect(linkRes.body.account.isGuest).toBe(false);
      expect(linkRes.body.account.username).toBe('PromotedPlayer');

      // 3. Login with newly linked credentials
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'PromotedPlayer', password: 'newPassword123' });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.account.id).toBe(guestRes.body.account.id);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the authenticated account details', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'WhoAmI', password: 'password123' });

      const token = reg.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.account.username).toBe('WhoAmI');
    });

    it('rejects request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
    });
  });
});
