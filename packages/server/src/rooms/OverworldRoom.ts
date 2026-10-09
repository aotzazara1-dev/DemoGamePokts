import { Room, Client } from '@colyseus/core';
import { OverworldState, PlayerNetworkState } from '../schema/OverworldState.js';
import {
  OverworldEngine,
  DEFAULT_OVERWORLD_MAP,
  getMapConfig,
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

  onCreate(options: { mapConfig?: MapConfig } = {}) {
    if (options.mapConfig) {
      this.mapConfig = options.mapConfig;
    }
    this.setState(new OverworldState());

    this.onMessage('move', (client: Client, message: MoveMessagePayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (player.inBattle) {
        player.inBattle = false;
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

        if (result.encounterTriggered && result.encounter) {
          player.inBattle = true;
          client.send('encounter', {
            encounter: result.encounter,
            playerPosition: { x: player.x, y: player.y }
          });
        }
      }
    });

    this.onMessage('warpTown', (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (player.inBattle) return; // Cannot teleport during active combat

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
      player.inBattle = false;

      // Authoritative portal proximity and destination validation
      const currentMapConfig = (this.mapConfig && this.mapConfig.id === player.mapId)
        ? this.mapConfig
        : getMapConfig(player.mapId);

      const validPortal = currentMapConfig.portals?.find(p =>
        p.targetMapId === message.targetMapId &&
        p.targetPosition.x === message.targetPosition.x &&
        p.targetPosition.y === message.targetPosition.y &&
        (Math.abs(p.position.x - player.x) <= 2 && Math.abs(p.position.y - player.y) <= 2)
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
      } else if (player.mapId === message.targetMapId) {
        // Player already transitioned via move step resolution, sync target coordinates
        player.x = message.targetPosition.x;
        player.y = message.targetPosition.y;
        this.playerStepCounters.set(client.sessionId, 0);
      }
    });

    this.onMessage('battleConcluded', (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.inBattle = false;
      }
    });
  }

  onJoin(client: Client, options: { name?: string; spawnTile?: TileCoord; mapId?: string } = {}) {
    const spawnX = options.spawnTile?.x ?? 10;
    const spawnY = options.spawnTile?.y ?? 10;
    const playerName = options.name ?? `Player_${client.sessionId.slice(0, 4)}`;
    const spawnMapId = options.mapId ?? 'novice_town_and_meadow';

    const player = new PlayerNetworkState(client.sessionId, playerName, spawnX, spawnY, 'down', spawnMapId);
    this.state.players.set(client.sessionId, player);
    this.playerStepCounters.set(client.sessionId, 0);
  }

  onLeave(client: Client, _consented?: boolean) {
    this.state.players.delete(client.sessionId);
    this.playerStepCounters.delete(client.sessionId);
  }
}
