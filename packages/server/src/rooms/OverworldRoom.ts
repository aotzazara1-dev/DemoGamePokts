import { Room, Client } from '@colyseus/core';
import { OverworldState, PlayerNetworkState, RoamingBeastNetworkState } from '../schema/OverworldState.js';
import {
  OverworldEngine,
  DEFAULT_OVERWORLD_MAP,
  MAP_DATABASE,
  getMapConfig,
  RoamingBeastManager,
  type MapConfig,
  type Direction,
  type TileCoord,
  type MoveMessagePayload,
  type PortalTransitionPayload,
  Element
} from '@poktsonline/shared';

export { DEFAULT_OVERWORLD_MAP };

function determineDirection(from: TileCoord, to: TileCoord): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx > 0 && dy > 0) return 'down-right';
  if (dx > 0 && dy < 0) return 'up-right';
  if (dx < 0 && dy > 0) return 'down-left';
  if (dx < 0 && dy < 0) return 'up-left';
  if (dx > 0) return 'right';
  if (dx < 0) return 'left';
  if (dy > 0) return 'down';
  return 'up';
}

export class OverworldRoom extends Room<OverworldState> {
  public mapConfig: MapConfig = DEFAULT_OVERWORLD_MAP;
  public rng: () => number = Math.random;
  private playerStepCounters: Map<string, number> = new Map();
  private connectedClients: Map<string, Client> = new Map();

  onCreate(options: { mapConfig?: MapConfig } = {}) {
    if (options.mapConfig) {
      this.mapConfig = options.mapConfig;
    }
    this.setState(new OverworldState());

    this.initRoamingBeasts(options.mapConfig);

    // Run simulation tick for roaming beasts every 1500ms
    this.setSimulationInterval(() => this.tickRoamingBeasts(), 1500);

    this.onMessage('move', (client: Client, message: MoveMessagePayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (player.inBattle) {
        return;
      }

      // 1. Resynchronize mapId if client declared its active map and it differs from server state
      if (message.mapId && player.mapId !== message.mapId) {
        player.mapId = message.mapId;
        player.x = message.targetX;
        player.y = message.targetY;
        this.playerStepCounters.set(client.sessionId, 0);
        return;
      }

      const currentPos: TileCoord = { x: player.x, y: player.y };
      const targetTile: TileCoord = { x: message.targetX, y: message.targetY };
      const stepsInZone = this.playerStepCounters.get(client.sessionId) || 0;

      const playerState = {
        playerId: client.sessionId,
        position: currentPos,
        facingDirection: player.direction as Direction,
        stepsInCurrentZone: stepsInZone
      };

      const currentMapConfig = (this.mapConfig && this.mapConfig.id === player.mapId)
        ? this.mapConfig
        : getMapConfig(player.mapId);
      const result = OverworldEngine.movePlayer(playerState, targetTile, currentMapConfig, this.rng);

      if (result.success) {
        if (result.portalTriggered && result.portal) {
          player.mapId = result.portal.targetMapId;
          player.x = result.portal.targetPosition.x;
          player.y = result.portal.targetPosition.y;
          player.direction = 'down';
          this.playerStepCounters.set(client.sessionId, 0);

          client.send('portalTransition', {
            targetMapId: result.portal.targetMapId,
            targetPosition: result.portal.targetPosition,
            portalName: result.portal.name
          });
          return;
        }

        player.x = result.newPosition.x;
        player.y = result.newPosition.y;
        player.direction = determineDirection(currentPos, result.newPosition);
        this.playerStepCounters.set(client.sessionId, result.stepsInZone);

        // A. Step-based random wild encounter
        if (result.encounterTriggered && result.encounter) {
          player.inBattle = true;
          client.send('encounter', {
            encounter: result.encounter,
            playerPosition: { x: player.x, y: player.y }
          });
          return;
        }

        // B. Collision with Roaming Beast
        const collidedBeast = Array.from(this.state.roamingBeasts.values()).find(
          b => b.mapId === player.mapId && !b.inCombat && (
            (b.x === player.x && b.y === player.y) ||
            (b.x === message.targetX && b.y === message.targetY)
          )
        );

        if (collidedBeast) {
          player.inBattle = true;
          collidedBeast.inCombat = true;
          collidedBeast.respawnAt = Date.now() + 20000;
          const combatant = RoamingBeastManager.convertRoamingBeastToCombatant(collidedBeast as any);
          client.send('encounter', {
            encounter: {
              zoneId: collidedBeast.zoneId,
              wildEnemies: [combatant]
            },
            playerPosition: { x: player.x, y: player.y }
          });
        }
      }
    });

    this.onMessage('warpTown', (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (player.inBattle) return;

      player.mapId = 'novice_town_and_meadow';
      player.x = 10;
      player.y = 10;
      player.direction = 'down';
      this.playerStepCounters.set(client.sessionId, 0);

      client.send('portalTransition', {
        targetMapId: 'novice_town_and_meadow',
        targetPosition: { x: 10, y: 10 },
        portalName: 'Town Teleport'
      });
    });

    this.onMessage('warpPortal', (client: Client, message: PortalTransitionPayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (player.inBattle) return;

      // Authoritative portal proximity and destination validation
      const currentMapConfig = (this.mapConfig && this.mapConfig.id === player.mapId)
        ? this.mapConfig
        : getMapConfig(player.mapId);

      const validPortal = currentMapConfig.portals?.find(p =>
        p.targetMapId === message.targetMapId &&
        p.targetPosition.x === message.targetPosition.x &&
        p.targetPosition.y === message.targetPosition.y &&
        (Math.abs(p.position.x - player.x) <= 1 && Math.abs(p.position.y - player.y) <= 1)
      );

      if (validPortal) {
        player.mapId = validPortal.targetMapId;
        player.x = validPortal.targetPosition.x;
        player.y = validPortal.targetPosition.y;
        player.direction = 'down';
        this.playerStepCounters.set(client.sessionId, 0);

        client.send('portalTransition', {
          targetMapId: validPortal.targetMapId,
          targetPosition: validPortal.targetPosition,
          portalName: validPortal.name
        });
      }
    });

    this.onMessage('battleConcluded', (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.inBattle = false;
      }
    });
  }

  public initRoamingBeasts(overrideMap?: MapConfig) {
    const mapList = Object.values(MAP_DATABASE);
    const mapsToPopulate = overrideMap
      ? [overrideMap, ...mapList.filter(m => m.id !== overrideMap.id)]
      : mapList;

    mapsToPopulate.forEach(map => {
      const beasts = RoamingBeastManager.generateMapRoamingBeasts(map, 6);
      beasts.forEach(b => {
        this.state.roamingBeasts.set(
          b.id,
          new RoamingBeastNetworkState({
            id: b.id,
            templateId: b.templateId,
            name: b.name,
            element: b.element,
            level: b.level,
            mapId: b.mapId,
            zoneId: b.zoneId,
            x: b.x,
            y: b.y,
            direction: b.direction || 'down',
            inCombat: false,
            respawnAt: 0,
            baseAtk: b.baseAtk,
            baseDef: b.baseDef,
            baseAgi: b.baseAgi,
            baseHp: b.baseHp,
            baseSp: b.baseSp
          })
        );
      });
    });
  }

  public tickRoamingBeasts() {
    const playersList = Array.from(this.state.players.values()).map(p => ({
      id: p.id,
      x: p.x,
      y: p.y,
      inBattle: p.inBattle,
      mapId: p.mapId
    }));

    const now = Date.now();

    this.state.roamingBeasts.forEach(beast => {
      const mapConfig = (this.mapConfig && this.mapConfig.id === beast.mapId)
        ? this.mapConfig
        : getMapConfig(beast.mapId);

      // 1. Check respawn cooldown
      if (beast.inCombat || beast.respawnAt > 0) {
        if (now >= beast.respawnAt) {
          const zone = mapConfig.zones.find(z => z.id === beast.zoneId);
          if (zone) {
            const newPos = RoamingBeastManager.findValidSpawnTile(zone, mapConfig);
            if (newPos) {
              beast.x = newPos.x;
              beast.y = newPos.y;
            }
          }
          beast.inCombat = false;
          beast.respawnAt = 0;
        }
        return;
      }

      // 2. AI Stepping & Aggro
      const step = RoamingBeastManager.stepRoamingBeastAI(
        beast as any,
        playersList,
        mapConfig,
        this.rng
      );

      beast.x = step.x;
      beast.y = step.y;
      beast.direction = step.direction;

      // 3. Collision Trigger from Beast AI
      if (step.triggeredPlayerId) {
        const client = this.connectedClients.get(step.triggeredPlayerId) || this.clients.find(c => c.sessionId === step.triggeredPlayerId);
        const player = this.state.players.get(step.triggeredPlayerId);

        if (client && player && !player.inBattle) {
          player.inBattle = true;
          beast.inCombat = true;
          beast.respawnAt = now + 20000;

          const combatant = RoamingBeastManager.convertRoamingBeastToCombatant(beast as any);
          client.send('encounter', {
            encounter: {
              zoneId: beast.zoneId,
              wildEnemies: [combatant]
            },
            playerPosition: { x: player.x, y: player.y }
          });
        }
      }
    });
  }

  onJoin(client: Client, options: { name?: string; spawnTile?: TileCoord; mapId?: string } = {}) {
    this.connectedClients.set(client.sessionId, client);
    const spawnX = options.spawnTile?.x ?? 10;
    const spawnY = options.spawnTile?.y ?? 10;
    const playerName = options.name ?? `Player_${client.sessionId.slice(0, 4)}`;
    const spawnMapId = options.mapId ?? 'novice_town_and_meadow';

    const player = new PlayerNetworkState(client.sessionId, playerName, spawnX, spawnY, 'down', spawnMapId);
    this.state.players.set(client.sessionId, player);
    this.playerStepCounters.set(client.sessionId, 0);
  }

  onLeave(client: Client, _consented?: boolean) {
    this.connectedClients.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.playerStepCounters.delete(client.sessionId);
  }
}
