import { describe, it, expect } from 'vitest';
import {
  OverworldEngine,
  Element,
  type MapConfig,
  type PlayerOverworldState,
  type ZoneDefinition
} from '../src/index.js';

describe('OverworldEngine Navigation and Encounters (Ticket 03)', () => {
  const sampleWildZone: ZoneDefinition = {
    id: 'forest_zone',
    name: 'Verdant Wilds',
    type: 'wild',
    bounds: { minX: 5, maxX: 10, minY: 5, maxY: 10 },
    encounterRatePerStep: 0.3,
    encounterPool: [
      {
        beastTemplateId: 'wild_golem',
        name: 'Wild Earth Golem',
        element: Element.Earth,
        baseLevel: 12,
        levelVariance: 2,
        weight: 10,
        baseAtk: 25,
        baseDef: 20,
        baseAgi: 15,
        baseHp: 180,
        baseSp: 40
      }
    ]
  };

  const sampleSafeZone: ZoneDefinition = {
    id: 'town_zone',
    name: 'Starter Village',
    type: 'safe',
    bounds: { minX: 0, maxX: 4, minY: 0, maxY: 4 },
    encounterRatePerStep: 0,
    encounterPool: []
  };

  const sampleMapConfig: MapConfig = {
    width: 15,
    height: 15,
    obstacles: [
      { x: 2, y: 1 }, // A rock blocking tile [2, 1]
      { x: 2, y: 2 }  // A tree blocking tile [2, 2]
    ],
    zones: [sampleSafeZone, sampleWildZone]
  };

  function createPlayerState(x: number, y: number, stepsInZone: number = 0): PlayerOverworldState {
    return {
      playerId: 'hero_1',
      position: { x, y },
      facingDirection: 'down',
      stepsInCurrentZone: stepsInZone
    };
  }

  describe('Grid Movement & Boundary Constraints', () => {
    it('allows valid movement to an adjacent unoccupied tile within bounds', () => {
      const state = createPlayerState(1, 1);
      const result = OverworldEngine.movePlayer(state, { x: 1, y: 2 }, sampleMapConfig);

      expect(result.success).toBe(true);
      expect(result.newPosition).toEqual({ x: 1, y: 2 });
      expect(result.previousPosition).toEqual({ x: 1, y: 1 });
    });

    it('rejects movement outside the map boundaries', () => {
      const state = createPlayerState(0, 0);
      const result = OverworldEngine.movePlayer(state, { x: -1, y: 0 }, sampleMapConfig);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
      expect(result.newPosition).toEqual({ x: 0, y: 0 });
    });

    it('rejects movement onto an obstacle tile and preserves position', () => {
      const state = createPlayerState(2, 0);
      // Attempt to move to [2, 1] which is an obstacle
      const result = OverworldEngine.movePlayer(state, { x: 2, y: 1 }, sampleMapConfig);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('obstacle_blocked');
      expect(result.newPosition).toEqual({ x: 2, y: 0 });
    });

    it('rejects teleporting or jumping more than 1 tile at a time', () => {
      const state = createPlayerState(1, 1);
      const result = OverworldEngine.movePlayer(state, { x: 4, y: 4 }, sampleMapConfig);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_distance');
      expect(result.newPosition).toEqual({ x: 1, y: 1 });
    });
  });

  describe('Zone Detection & Encounter Triggering', () => {
    it('does not trigger encounters when walking in a safe zone', () => {
      const state = createPlayerState(1, 1, 5);
      // Force RNG to 0.0 (which would trigger any wild encounter)
      const result = OverworldEngine.movePlayer(state, { x: 1, y: 2 }, sampleMapConfig, () => 0.0);

      expect(result.success).toBe(true);
      expect(result.encounterTriggered).toBe(false);
      expect(result.encounter).toBeUndefined();
    });

    it('increments step counter when moving inside a zone', () => {
      const state = createPlayerState(6, 6, 2);
      const result = OverworldEngine.movePlayer(state, { x: 6, y: 7 }, sampleMapConfig, () => 0.9);

      expect(result.success).toBe(true);
      expect(result.stepsInZone).toBe(3);
    });

    it('triggers a wild encounter when stepping into a wild zone and RNG roll beats encounter rate', () => {
      const state = createPlayerState(5, 5, 0);
      // Wild zone encounter rate is 0.3. RNG roll 0.1 < 0.3 -> encounter triggers!
      const result = OverworldEngine.movePlayer(state, { x: 5, y: 6 }, sampleMapConfig, () => 0.1);

      expect(result.success).toBe(true);
      expect(result.encounterTriggered).toBe(true);
      expect(result.encounter).toBeDefined();
      expect(result.encounter?.zoneId).toBe('forest_zone');
      expect(result.encounter?.wildEnemies).toHaveLength(1);

      const wildMob = result.encounter!.wildEnemies[0];
      expect(wildMob.name).toBe('Wild Earth Golem');
      expect(wildMob.element).toBe(Element.Earth);
      expect(wildMob.level).toBeGreaterThanOrEqual(10);
      expect(wildMob.level).toBeLessThanOrEqual(14);
    });

    it('does not trigger an encounter when RNG roll is higher than encounter rate', () => {
      const state = createPlayerState(5, 5, 0);
      // Wild zone rate is 0.3. RNG roll 0.7 >= 0.3 -> no encounter!
      const result = OverworldEngine.movePlayer(state, { x: 5, y: 6 }, sampleMapConfig, () => 0.7);

      expect(result.success).toBe(true);
      expect(result.encounterTriggered).toBe(false);
      expect(result.encounter).toBeUndefined();
    });
  });
});
