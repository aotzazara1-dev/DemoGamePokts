import {
  type MapConfig,
  type PlayerOverworldState,
  type TileCoord,
  type MovementResult,
  type ZoneDefinition,
  type Combatant,
  Element
} from '../types.js';

import { DEFAULT_OVERWORLD_MAP, MAP_DATABASE, getMapConfig } from './map-database.js';

export { DEFAULT_OVERWORLD_MAP, MAP_DATABASE, getMapConfig };

export class OverworldEngine {
  /**
   * Deterministically validates and executes a player movement on the Overworld grid,
   * calculating collisions, boundary limits, and zone-based encounter chances.
   */
  public static movePlayer(
    state: PlayerOverworldState,
    targetTile: TileCoord,
    mapConfig: MapConfig,
    rng: () => number = Math.random
  ): MovementResult {
    const prevPos = { ...state.position };

    // 1. Validate step distance (max 1 tile in cardinal/diagonal directions)
    const dx = Math.abs(targetTile.x - state.position.x);
    const dy = Math.abs(targetTile.y - state.position.y);
    if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) {
      return {
        success: false,
        reason: 'invalid_distance',
        newPosition: prevPos,
        previousPosition: prevPos,
        stepsInZone: state.stepsInCurrentZone,
        encounterTriggered: false
      };
    }

    // 2. Validate map boundary constraints
    if (
      targetTile.x < 0 ||
      targetTile.x >= mapConfig.width ||
      targetTile.y < 0 ||
      targetTile.y >= mapConfig.height
    ) {
      return {
        success: false,
        reason: 'out_of_bounds',
        newPosition: prevPos,
        previousPosition: prevPos,
        stepsInZone: state.stepsInCurrentZone,
        encounterTriggered: false
      };
    }

    // 3. Validate obstacle collisions
    const isBlocked = mapConfig.obstacles.some(
      obs => obs.x === targetTile.x && obs.y === targetTile.y
    );
    if (isBlocked) {
      return {
        success: false,
        reason: 'obstacle_blocked',
        newPosition: prevPos,
        previousPosition: prevPos,
        stepsInZone: state.stepsInCurrentZone,
        encounterTriggered: false
      };
    }

    // 4. Identify destination zone
    const targetZone: ZoneDefinition | undefined = mapConfig.zones.find(
      z =>
        targetTile.x >= z.bounds.minX &&
        targetTile.x <= z.bounds.maxX &&
        targetTile.y >= z.bounds.minY &&
        targetTile.y <= z.bounds.maxY
    );

    const stepsInZone = state.stepsInCurrentZone + 1;

    // 5. Evaluate portal trigger
    const portal = mapConfig.portals?.find(
      p => p.position.x === targetTile.x && p.position.y === targetTile.y
    );
    if (portal) {
      return {
        success: true,
        newPosition: { ...targetTile },
        previousPosition: prevPos,
        stepsInZone,
        encounterTriggered: false,
        portalTriggered: true,
        portal
      };
    }

    // 6. Evaluate wild encounter roll
    if (targetZone && targetZone.type === 'wild' && targetZone.encounterPool.length > 0) {
      const roll = rng();
      if (roll < targetZone.encounterRatePerStep) {
        // Encounter triggered! Select wild combatant from pool
        const poolIndex = Math.floor(rng() * targetZone.encounterPool.length);
        const template = targetZone.encounterPool[poolIndex];

        // Calculate level with variance
        const varianceOffset = Math.round((rng() - 0.5) * 2 * template.levelVariance);
        const level = Math.max(1, template.baseLevel + varianceOffset);

        const wildEnemy: Combatant = {
          id: `wild_${template.beastTemplateId}_${level}`,
          name: template.name,
          isHero: false,
          level: level,
          element: template.element,
          hp: template.baseHp + level * 5,
          maxHp: template.baseHp + level * 5,
          sp: template.baseSp + level * 2,
          maxSp: template.baseSp + level * 2,
          atk: template.baseAtk + level * 2,
          def: template.baseDef + Math.round(level * 1.5),
          int: 10 + level,
          agi: template.baseAgi + level,
          action: { type: 'attack' }
        };

        return {
          success: true,
          newPosition: { ...targetTile },
          previousPosition: prevPos,
          stepsInZone,
          encounterTriggered: true,
          encounter: {
            zoneId: targetZone.id,
            wildEnemies: [wildEnemy]
          }
        };
      }
    }

    // Valid movement with no encounter
    return {
      success: true,
      newPosition: { ...targetTile },
      previousPosition: prevPos,
      stepsInZone,
      encounterTriggered: false
    };
  }
}
