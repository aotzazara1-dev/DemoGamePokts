import http from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { OverworldRoom, DEFAULT_OVERWORLD_MAP } from './rooms/OverworldRoom.js';
import { BattleRoom } from './rooms/BattleRoom.js';

export * from './schema/OverworldState.js';
export * from './schema/BattleState.js';
export * from './rooms/OverworldRoom.js';
export * from './rooms/BattleRoom.js';

const port = Number(process.env.PORT) || 2567;

export function createServer() {
  const httpServer = http.createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer
    })
  });

  gameServer.define('overworld', OverworldRoom, {
    mapConfig: DEFAULT_OVERWORLD_MAP
  });

  gameServer.define('battle', BattleRoom);

  return { httpServer, gameServer };
}

// Auto-start if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const { httpServer } = createServer();
  httpServer.listen(port, () => {
    console.log(`[Poktsonline Server] Authoritative Colyseus server listening on ws://localhost:${port}`);
  });
}
