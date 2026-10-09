import {
  RoamingBeastEntity,
  MapConfig,
  ZoneDefinition,
  TileCoord,
  Combatant,
  Direction,
  EncounterPoolEntry
} from '../types.js';
import { findPath } from './pathfinding.js';

export class RoamingBeastManager {
  /**
   * Spawns roaming beasts for all wild zones in a map.
   */
  static generateMapRoamingBeasts(mapConfig: MapConfig, beastsPerZone: number = 6): RoamingBeastEntity[] {
    const beasts: RoamingBeastEntity[] = [];
    const wildZones = mapConfig.zones.filter(z => z.type === 'wild' && z.encounterPool.length > 0);

    wildZones.forEach((zone) => {
      for (let i = 0; i < beastsPerZone; i++) {
        const poolEntry = zone.encounterPool[i % zone.encounterPool.length];

        let pos: TileCoord | null = null;
        if (i < 2) {
          // Dynamically place early beasts near the zone boundary edge (scaled to zone bounds)
          const centerY = Math.floor((zone.bounds.minY + zone.bounds.maxY) / 2);
          const nearY = Math.min(zone.bounds.maxY, Math.max(zone.bounds.minY, centerY + (i === 0 ? -1 : 1)));
          const nearX = Math.min(zone.bounds.maxX, zone.bounds.minX + 1 + i);
          if (this.isTileWalkable(nearX, nearY, mapConfig, zone.id)) {
            pos = { x: nearX, y: nearY };
          }
        }

        if (!pos) {
          pos = this.findValidSpawnTile(zone, mapConfig, beasts);
        }
        if (!pos) continue;

        const id = `roam_${mapConfig.id}_${zone.id}_${i + 1}`;
        beasts.push(this.createRoamingBeast(poolEntry, mapConfig.id, zone.id, pos, id));
      }
    });

    return beasts;
  }

  /**
   * Finds a valid, unoccupied tile inside the zone bounds that is not blocked by obstacles or existing beasts.
   */
  static findValidSpawnTile(
    zone: ZoneDefinition,
    mapConfig: MapConfig,
    existingBeasts: { x: number; y: number }[] = []
  ): TileCoord | null {
    const width = zone.bounds.maxX - zone.bounds.minX + 1;
    const height = zone.bounds.maxY - zone.bounds.minY + 1;

    for (let attempts = 0; attempts < 50; attempts++) {
      const rx = zone.bounds.minX + Math.floor(Math.random() * width);
      const ry = zone.bounds.minY + Math.floor(Math.random() * height);

      const isBeast = existingBeasts.some(b => b.x === rx && b.y === ry);
      if (!isBeast && this.isTileWalkable(rx, ry, mapConfig, zone.id)) {
        return { x: rx, y: ry };
      }
    }

    return { x: zone.bounds.minX + 1, y: zone.bounds.minY + 1 };
  }

  /**
   * Creates a single RoamingBeastEntity instance from an encounter pool entry.
   */
  static createRoamingBeast(
    template: EncounterPoolEntry,
    mapId: string,
    zoneId: string,
    position: TileCoord,
    customId?: string
  ): RoamingBeastEntity {
    return {
      id: customId || `roam_${mapId}_${Math.random().toString(36).substring(2, 9)}`,
      templateId: template.beastTemplateId,
      name: template.name,
      element: template.element,
      level: template.baseLevel,
      mapId,
      zoneId,
      x: position.x,
      y: position.y,
      direction: 'down',
      inCombat: false,
      respawnAt: 0,
      baseAtk: template.baseAtk,
      baseDef: template.baseDef,
      baseAgi: template.baseAgi,
      baseHp: template.baseHp,
      baseSp: template.baseSp
    };
  }

  /**
   * Converts a RoamingBeastEntity into a combatant ready for BattleEngine.
   */
  static convertRoamingBeastToCombatant(beast: RoamingBeastEntity): Combatant {
    const hp = beast.baseHp + (beast.level - 1) * 8;
    const sp = beast.baseSp + (beast.level - 1) * 4;

    return {
      id: beast.id,
      name: beast.name,
      isHero: false,
      level: beast.level,
      element: beast.element,
      hp: hp,
      maxHp: hp,
      sp: sp,
      maxSp: sp,
      atk: beast.baseAtk + (beast.level - 1) * 3,
      def: beast.baseDef + (beast.level - 1) * 2,
      int: 10 + beast.level,
      agi: beast.baseAgi + (beast.level - 1) * 2,
      action: { type: 'attack' }
    };
  }

  /**
   * Simulates one AI tick for a roaming beast.
   * - Aggro: If any eligible player on the same map is within 3 tiles, moves towards the nearest player with obstacle avoidance.
   * - Collision: If the step lands on the player, triggers combat.
   * - Wander: If no player is nearby, randomly moves 1 tile within zone bounds or stays idle.
   */
  static stepRoamingBeastAI(
    beast: RoamingBeastEntity,
    players: { id: string; x: number; y: number; inBattle: boolean; mapId: string }[],
    mapConfig: MapConfig,
    rng: () => number = Math.random
  ): { x: number; y: number; direction: Direction; triggeredPlayerId?: string } {
    if (beast.inCombat || beast.respawnAt > 0) {
      return { x: beast.x, y: beast.y, direction: beast.direction || 'down' };
    }

    const eligiblePlayers = players.filter(
      p => p.mapId === beast.mapId && !p.inBattle
    );

    // Find nearest player
    let nearestPlayer: (typeof players)[0] | null = null;
    let minDistance = Infinity;

    for (const player of eligiblePlayers) {
      const dist = Math.abs(player.x - beast.x) + Math.abs(player.y - beast.y);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPlayer = player;
      }
    }

    // 1. Aggro Pursuit (within 3 Manhattan distance) with Obstacle Avoidance
    if (nearestPlayer && minDistance <= 3) {
      const dx = nearestPlayer.x - beast.x;
      const dy = nearestPlayer.y - beast.y;

      // Immediate collision check if already adjacent
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        return {
          x: nearestPlayer.x,
          y: nearestPlayer.y,
          direction: this.calcDirection(dx, dy),
          triggeredPlayerId: nearestPlayer.id
        };
      }

      // Calculate path with obstacle avoidance
      const path = findPath(
        { x: beast.x, y: beast.y },
        { x: nearestPlayer.x, y: nearestPlayer.y },
        mapConfig,
        { allowDiagonal: false, maxIterations: 60 }
      );

      if (path && path.length > 1) {
        const next = path[1];
        const stepX = next.x - beast.x;
        const stepY = next.y - beast.y;

        if (next.x === nearestPlayer.x && next.y === nearestPlayer.y) {
          return {
            x: next.x,
            y: next.y,
            direction: this.calcDirection(stepX, stepY),
            triggeredPlayerId: nearestPlayer.id
          };
        }

        if (this.isTileWalkable(next.x, next.y, mapConfig, beast.zoneId)) {
          return {
            x: next.x,
            y: next.y,
            direction: this.calcDirection(stepX, stepY)
          };
        }
      }
    }

    // 2. Passive Wander (70% chance to roam, 30% chance to idle)
    const roll = rng();
    if (roll < 0.70) {
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ];
      const dirIndex = Math.floor(rng() * directions.length);
      const chosen = directions[dirIndex];
      const nextX = beast.x + chosen.dx;
      const nextY = beast.y + chosen.dy;

      // Check if wandering step collides with an eligible player
      const collidedPlayer = eligiblePlayers.find(p => p.x === nextX && p.y === nextY);
      if (collidedPlayer) {
        return {
          x: nextX,
          y: nextY,
          direction: this.calcDirection(chosen.dx, chosen.dy),
          triggeredPlayerId: collidedPlayer.id
        };
      }

      if (this.isTileWalkable(nextX, nextY, mapConfig, beast.zoneId)) {
        return {
          x: nextX,
          y: nextY,
          direction: this.calcDirection(chosen.dx, chosen.dy)
        };
      }
    }

    // Remain idle
    return {
      x: beast.x,
      y: beast.y,
      direction: beast.direction || 'down'
    };
  }

  static isTileWalkable(x: number, y: number, mapConfig: MapConfig, zoneId?: string): boolean {
    if (x < 0 || x >= mapConfig.width || y < 0 || y >= mapConfig.height) {
      return false;
    }

    // Check obstacles
    if (mapConfig.obstacles.some(o => o.x === x && o.y === y)) {
      return false;
    }

    // Check portals
    if (mapConfig.portals?.some(p => p.position.x === x && p.position.y === y)) {
      return false;
    }

    // Check NPCs
    if (mapConfig.npcs?.some(n => n.position.x === x && n.position.y === y)) {
      return false;
    }

    // Stay within zone if zoneId provided
    if (zoneId) {
      const zone = mapConfig.zones.find(z => z.id === zoneId);
      if (zone) {
        if (x < zone.bounds.minX || x > zone.bounds.maxX || y < zone.bounds.minY || y > zone.bounds.maxY) {
          return false;
        }
      }
    }

    return true;
  }

  private static calcDirection(dx: number, dy: number): Direction {
    if (dx > 0) return 'right';
    if (dx < 0) return 'left';
    if (dy > 0) return 'down';
    return 'up';
  }
}
