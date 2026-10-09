import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OverworldRoom } from '../src/rooms/OverworldRoom.js';
import { Element, type MapConfig } from '@poktsonline/shared';

describe('OverworldRoom', () => {
  let room: OverworldRoom;

  const testMapConfig: MapConfig = {
    id: 'novice_town_and_meadow',
    name: 'Test Novice Meadow',
    theme: 'meadow',
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
    ],
    portals: [
      {
        id: 'portal_test_to_cave',
        position: { x: 5, y: 6 },
        targetMapId: 'pebble_cave',
        targetPosition: { x: 2, y: 15 },
        name: 'Test Portal to Cave'
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

  it('triggers portalTransition and teleports player to target map when stepping on portal tile', () => {
    const client = createMockClient('client_1');
    // Start adjacent to portal: portal is at (5, 6)
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 5, y: 5 } });

    // Step onto portal tile (5, 6)
    (room as any).onMessageHandlers['move'](client, { targetX: 5, targetY: 6 });

    const player = room.state.players.get('client_1')!;
    // Player should now be on target map 'pebble_cave' at (2, 15)
    expect(player.mapId).toBe('pebble_cave');
    expect(player.x).toBe(2);
    expect(player.y).toBe(15);
    expect(player.inBattle).toBe(false);

    // Verify portalTransition message sent
    const portalMsg = client.messages.find(m => m.type === 'portalTransition');
    expect(portalMsg).toBeDefined();
    expect(portalMsg?.payload.targetMapId).toBe('pebble_cave');
    expect(portalMsg?.payload.targetPosition).toEqual({ x: 2, y: 15 });
  });

  it('teleports player back to Novice Town on warpTown message', () => {
    const client = createMockClient('client_1');
    // Start somewhere far in a cave
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 18, y: 18 }, mapId: 'pebble_cave' });

    const player = room.state.players.get('client_1')!;
    expect(player.mapId).toBe('pebble_cave');

    // Trigger warpTown
    (room as any).onMessageHandlers['warpTown'](client);

    expect(player.mapId).toBe('novice_town_and_meadow');
    expect(player.x).toBe(10);
    expect(player.y).toBe(10);

    const warpMsg = client.messages.find(m => m.type === 'portalTransition');
    expect(warpMsg).toBeDefined();
    expect(warpMsg?.payload.targetMapId).toBe('novice_town_and_meadow');
    expect(warpMsg?.payload.targetPosition).toEqual({ x: 10, y: 10 });
  });

  it('supports full two-way round-trip portal transitions (meadow -> cave -> meadow)', () => {
    const client = createMockClient('client_1');
    // Start adjacent to portal in meadow: portal is at (5, 6) which leads to pebble_cave (2, 15)
    room.onJoin(client as any, { name: 'HeroTrainer', spawnTile: { x: 5, y: 5 } });

    // 1. Warp into Pebble Cave by stepping on (5, 6)
    (room as any).onMessageHandlers['move'](client, { targetX: 5, targetY: 6 });

    const player = room.state.players.get('client_1')!;
    expect(player.mapId).toBe('pebble_cave');
    expect(player.x).toBe(2);
    expect(player.y).toBe(15);

    // 2. In Pebble Cave, step onto the return portal at (1, 15)
    (room as any).onMessageHandlers['move'](client, { targetX: 1, targetY: 15 });

    // Should warp back to novice_town_and_meadow at (35, 3)
    expect(player.mapId).toBe('novice_town_and_meadow');
    expect(player.x).toBe(35);
    expect(player.y).toBe(3);

    const transitions = client.messages.filter(m => m.type === 'portalTransition');
    expect(transitions).toHaveLength(2);
    expect(transitions[1].payload.targetMapId).toBe('novice_town_and_meadow');
    expect(transitions[1].payload.targetPosition).toEqual({ x: 35, y: 3 });
  });
});
