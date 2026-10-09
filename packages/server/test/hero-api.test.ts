import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import { Element } from '@poktsonline/shared';
import { DatabaseEngine } from '../src/db/DatabaseEngine.js';
import { AccountRepository } from '../src/db/AccountRepository.js';
import { HeroRepository } from '../src/db/HeroRepository.js';
import { createAuthRouter } from '../src/api/auth-routes.js';
import { createHeroRouter } from '../src/api/hero-routes.js';

describe('HTTP Hero Management Endpoints (Ticket 03)', () => {
  let app: Express;
  let dbEngine: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;
  let authToken: string;
  let accountId: string;

  beforeEach(async () => {
    dbEngine = new DatabaseEngine();
    await dbEngine.init();
    accountRepo = new AccountRepository(dbEngine);
    heroRepo = new HeroRepository(dbEngine);

    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', createAuthRouter(accountRepo));
    app.use('/api/heroes', createHeroRouter(accountRepo, heroRepo));

    // Register a test account and get session token
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'HeroMaster', password: 'password123' });

    authToken = regRes.body.token;
    accountId = regRes.body.account.id;
  });

  afterEach(() => {
    dbEngine.close();
  });

  describe('GET /api/heroes', () => {
    it('returns empty list for fresh account', async () => {
      const res = await request(app)
        .get('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.heroes).toEqual([]);
    });

    it('rejects unauthorized requests without token', async () => {
      const res = await request(app).get('/api/heroes');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/heroes', () => {
    it('creates a new hero with elemental starter beast and initial inventory', async () => {
      const res = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'LingHuChong', element: Element.Wind });

      expect(res.status).toBe(201);
      expect(res.body.hero.id).toBeDefined();
      expect(res.body.hero.name).toBe('LingHuChong');
      expect(res.body.hero.element).toBe(Element.Wind);
      expect(res.body.hero.level).toBe(1);

      // Verify listing returns the created hero
      const listRes = await request(app)
        .get('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.body.heroes.length).toBe(1);
      expect(listRes.body.heroes[0].name).toBe('LingHuChong');
    });

    it('rejects hero creation with invalid name length or invalid characters', async () => {
      const resShort = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'ab', element: Element.Water });
      expect(resShort.status).toBe(400);

      const resLong = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'ThisNameIsWayTooLongForAHero', element: Element.Water });
      expect(resLong.status).toBe(400);

      const resSymbols = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hero!@#$', element: Element.Earth });
      expect(resSymbols.status).toBe(400);

      const resThai = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'กวนอู ขุนศึก', element: Element.Earth });
      expect(resThai.status).toBe(201);
      expect(resThai.body.hero.name).toBe('กวนอู ขุนศึก');
    });

    it('enforces maximum 3 heroes limit per account', async () => {
      await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'HeroOne', element: Element.Earth });

      await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'HeroTwo', element: Element.Water });

      await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'HeroThree', element: Element.Fire });

      const resFourth = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'HeroFour', element: Element.Wind });

      expect(resFourth.status).toBe(400);
      expect(resFourth.body.error).toMatch(/maximum 3 heroes/i);
    });
  });

  describe('DELETE /api/heroes/:id', () => {
    it('deletes hero when correct confirmation name is supplied', async () => {
      const createRes = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'HeroToDelete', element: Element.Water });

      const heroId = createRes.body.hero.id;

      const delRes = await request(app)
        .delete(`/api/heroes/${heroId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ confirmName: 'HeroToDelete' });

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const listRes = await request(app)
        .get('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.body.heroes.length).toBe(0);
    });

    it('rejects deletion when confirmation name does not match', async () => {
      const createRes = await request(app)
        .post('/api/heroes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'SafeHero', element: Element.Fire });

      const heroId = createRes.body.hero.id;

      const delRes = await request(app)
        .delete(`/api/heroes/${heroId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ confirmName: 'WrongName' });

      expect(delRes.status).toBe(400);
      expect(delRes.body.error).toMatch(/does not match/i);
    });
  });
});
