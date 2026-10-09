import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OverworldRoom } from '../src/rooms/OverworldRoom.js';
import { Element, type MapConfig } from '@poktsonline/shared';

describe('OverworldRoom', () => {
  let room: OverworldRoom;

  const testMapConfig: MapConfig = {
    width: 20,
    height: 20,
    obstacles: [{ x: 5, y: 4 }],
    zones: [
      {
        id: 'town',
        name: 'Novice Town',
        type: 'safe',
        bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
        encounterRatePerStep: 0,
        encounterPool: []
      },
      {
        id: 'wild_forest',
        name: 'Wild Forest',
        type: 'wild',
        bounds: { minX: 11, maxX: 19, minY: 0, maxY: 19 },
        encounterRatePerStep: 0.5,
        encounterPool: [
          {
            beastTemplateId: 'leaf_sprite',
            name: 'Leaf Sprite',
            element: Element.Wind,
            baseLevel: 3,
            levelVariance: 0,
            weight: 1,
            baseHp: 30,
            baseSp: 15,
            baseAtk: 12,
            baseDef: 8,
            baseAgi: 14
          }
        ]
      }
    ]
  };

  const createMockClient = (sessionId: string) => {
    const messages: { type: string; payload: any }[] = [];
    return {
      sessionId,
      messages,
      send: (type: string, payload: any) => {
        messages.push({ type, payload });
      }
    };
  };

  beforeEach(() => {
    room = new OverworldRoom();
    room.onCreate({ mapConfig: testMapConfig });
  });

  afterEach(() => {
    room.clock?.stop();
    clearTimeout((room as any)['_autoDisposeTimeout']);
    clearInterval((room as any)['_patchInterval']);
  });

  it('adds player to state on join with initial coordinates and direction', () => {
    const client = createMockClient('client_1');
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 5, y: 5 } });

    const player = room.state.players.get('client_1');
    expect(player).toBeDefined();
    expect(player?.name).toBe('HeroTrainer');
    expect(player?.x).toBe(5);
    expect(player?.y).toBe(5);
    expect(player?.direction).toBe('down');
    expect(player?.inBattle).toBe(false);
  });

  it('updates player position and facing direction on valid movement', () => {
    const client = createMockClient('client_1');
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 5, y: 5 } });

    // Move right to (6, 5)
    (room as any).onMessageHandlers['move'](client, { targetX: 6, targetY: 5 });

    const player = room.state.players.get('client_1')!;
    expect(player.x).toBe(6);
    expect(player.y).toBe(5);
    expect(player.direction).toBe('right');
  });

  it('rejects movement into obstacles or out-of-bounds tiles', () => {
    const client = createMockClient('client_1');
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 5, y: 5 } });

    // Obstacle is at (5, 4). Try to move up into obstacle:
    (room as any).onMessageHandlers['move'](client, { targetX: 5, targetY: 4 });

    const player = room.state.players.get('client_1')!;
    expect(player.x).toBe(5);
    expect(player.y).toBe(5);

    // Try to move invalid distance (> 1 tile)
    (room as any).onMessageHandlers['move'](client, { targetX: 10, targetY: 10 });
    expect(player.x).toBe(5);
    expect(player.y).toBe(5);
  });

  it('triggers encounter when moving into wild zone and marks player inBattle', () => {
    // Force RNG to trigger encounter (roll 0.0 < 0.5)
    room.rng = () => 0.0;

    const client = createMockClient('client_1');
    // Start at edge of safe zone (10, 5)
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 10, y: 5 } });

    // Move into wild zone at (11, 5)
    (room as any).onMessageHandlers['move'](client, { targetX: 11, targetY: 5 });

    const player = room.state.players.get('client_1')!;
    expect(player.x).toBe(11);
    expect(player.y).toBe(5);
    expect(player.inBattle).toBe(true);

    // Verify encounter message sent to client
    const encounterMsg = client.messages.find(m => m.type === 'encounter');
    expect(encounterMsg).toBeDefined();
    expect(encounterMsg?.payload.encounter.zoneId).toBe('wild_forest');
    expect(encounterMsg?.payload.encounter.wildEnemies.length).toBeGreaterThan(0);
  });

  it('removes player from state on leave', () => {
    const client = createMockClient('client_1');
    room.onJoin(client as any, { name: 'HeroTrainer' });
    expect(room.state.players.has('client_1')).toBe(true);

    room.onLeave(client as any, false);
    expect(room.state.players.has('client_1')).toBe(false);
  });
});
