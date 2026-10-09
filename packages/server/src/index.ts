import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { OverworldRoom, DEFAULT_OVERWORLD_MAP } from './rooms/OverworldRoom.js';
import { BattleRoom } from './rooms/BattleRoom.js';
import { DatabaseEngine, AccountRepository, HeroRepository } from './db/index.js';
import { createAuthRouter } from './api/auth-routes.js';
import { createHeroRouter } from './api/hero-routes.js';

export * from './schema/OverworldState.js';
export * from './schema/BattleState.js';
export * from './rooms/OverworldRoom.js';
export * from './rooms/BattleRoom.js';
export * from './db/index.js';
export * from './auth/PasswordUtils.js';
export * from './api/auth-routes.js';
export * from './api/hero-routes.js';

const port = Number(process.env.PORT) || 2567;

export async function createServer(options: { dbEngine?: DatabaseEngine; dbPath?: string } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let dbEngine = options.dbEngine;
  if (!dbEngine) {
    const dataDir = path.resolve(process.cwd(), 'packages/server/data');
    dbEngine = new DatabaseEngine(options.dbPath || path.join(dataDir, 'game.db'));
    await dbEngine.init();
  }

  const accountRepo = new AccountRepository(dbEngine);
  const heroRepo = new HeroRepository(dbEngine);

  app.use('/api/auth', createAuthRouter(accountRepo));
  app.use('/api/heroes', createHeroRouter(accountRepo, heroRepo));

  const httpServer = http.createServer(app);
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer
    })
  });

  gameServer.define('overworld', OverworldRoom, {
    mapConfig: DEFAULT_OVERWORLD_MAP,
    accountRepo,
    heroRepo
  });

  gameServer.define('battle', BattleRoom);

  return { httpServer, gameServer, app, dbEngine, accountRepo, heroRepo };
}

// Auto-start if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  createServer().then(({ httpServer }) => {
    httpServer.listen(port, () => {
      console.log(`[Poktsonline Server] Authoritative Colyseus server listening on ws://localhost:${port}`);
      console.log(`[Poktsonline Server] HTTP REST Auth API active at http://localhost:${port}/api/auth`);
    });
  }).catch(err => {
    console.error('[Poktsonline Server] Failed to start server:', err);
    process.exit(1);
  });
}
