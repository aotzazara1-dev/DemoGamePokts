import { describe, it, expect } from 'vitest';
import {
  RoamingBeastManager,
  MAP_DATABASE,
  Element,
  type RoamingBeastEntity
} from '../src/index.js';

describe('RoamingBeastManager', () => {
  const mapConfig = MAP_DATABASE['novice_town_and_meadow'];

  it('generates roaming beasts for wild zones in map', () => {
    const beasts = RoamingBeastManager.generateMapRoamingBeasts(mapConfig, 2);
    expect(beasts.length).toBeGreaterThan(0);
    beasts.forEach(beast => {
      expect(beast.mapId).toBe(mapConfig.id);
      expect(beast.inCombat).toBe(false);
      expect(beast.respawnAt).toBe(0);
      expect(beast.level).toBeGreaterThanOrEqual(1);

      // Verify beast is within wild zone bounds
      const wildZone = mapConfig.zones.find(z => z.id === beast.zoneId)!;
      expect(beast.x).toBeGreaterThanOrEqual(wildZone.bounds.minX);
      expect(beast.x).toBeLessThanOrEqual(wildZone.bounds.maxX);
      expect(beast.y).toBeGreaterThanOrEqual(wildZone.bounds.minY);
      expect(beast.y).toBeLessThanOrEqual(wildZone.bounds.maxY);

      // Verify not on obstacle
      const onObstacle = mapConfig.obstacles.some(o => o.x === beast.x && o.y === beast.y);
      expect(onObstacle).toBe(false);
    });
  });

  it('converts a roaming beast into an active Combatant for battle', () => {
    const beast: RoamingBeastEntity = {
      id: 'roam_test_1',
      templateId: 'rock_boar',
      name: 'Rock Boar',
      element: Element.Earth,
      level: 4,
      mapId: 'novice_town_and_meadow',
      zoneId: 'whispering_meadow',
      x: 25,
      y: 10,
      inCombat: false,
      respawnAt: 0,
      baseAtk: 16,
      baseDef: 14,
      baseAgi: 8,
      baseHp: 50,
      baseSp: 10
    };

    const combatant = RoamingBeastManager.convertRoamingBeastToCombatant(beast);
    expect(combatant.id).toBe(beast.id);
    expect(combatant.name).toBe('Rock Boar');
    expect(combatant.level).toBe(4);
    expect(combatant.element).toBe(Element.Earth);
    expect(combatant.isHero).toBe(false);
    expect(combatant.hp).toBe(combatant.maxHp);
    expect(combatant.sp).toBe(combatant.maxSp);
  });

  describe('AI Step Logic', () => {
    const mockBeast: RoamingBeastEntity = {
      id: 'roam_ai_1',
      templateId: 'leaf_sprite',
      name: 'Leaf Sprite',
      element: Element.Wind,
      level: 3,
      mapId: 'novice_town_and_meadow',
      zoneId: 'whispering_meadow',
      x: 25,
      y: 15,
      inCombat: false,
      respawnAt: 0,
      baseAtk: 12,
      baseDef: 8,
      baseAgi: 14,
      baseHp: 35,
      baseSp: 15
    };

    it('pursues nearest player when within aggro range (<= 3 tiles)', () => {
      // Player is at (25, 17) -> distance is 2 tiles
      const players = [
        { id: 'player_1', x: 25, y: 17, inBattle: false, mapId: 'novice_town_and_meadow' }
      ];

      const step = RoamingBeastManager.stepRoamingBeastAI(mockBeast, players, mapConfig);
      expect(step.x).toBe(25);
      expect(step.y).toBe(16); // Took 1 step down towards player
    });

    it('collides with player when player is on adjacent tile moving onto player', () => {
      // Player is at (25, 16) -> distance 1 step away
      const players = [
        { id: 'player_1', x: 25, y: 16, inBattle: false, mapId: 'novice_town_and_meadow' }
      ];

      const step = RoamingBeastManager.stepRoamingBeastAI(mockBeast, players, mapConfig);
      expect(step.x).toBe(25);
      expect(step.y).toBe(16);
      expect(step.triggeredPlayerId).toBe('player_1');
    });

    it('ignores player if player is in battle', () => {
      const players = [
        { id: 'player_1', x: 25, y: 16, inBattle: true, mapId: 'novice_town_and_meadow' }
      ];

      // Since player is in battle, beast does not aggro; wander instead
      const step = RoamingBeastManager.stepRoamingBeastAI(mockBeast, players, mapConfig, () => 0.5);
      expect(step.triggeredPlayerId).toBeUndefined();
    });

    it('wanders within zone bounds when no player is nearby', () => {
      const players = [
        { id: 'player_far', x: 5, y: 5, inBattle: false, mapId: 'novice_town_and_meadow' }
      ];

      const step = RoamingBeastManager.stepRoamingBeastAI(mockBeast, players, mapConfig, () => 0.2);
      expect(step.triggeredPlayerId).toBeUndefined();
      expect(Math.abs(step.x - mockBeast.x) + Math.abs(step.y - mockBeast.y)).toBeLessThanOrEqual(1);
    });
  });
});
