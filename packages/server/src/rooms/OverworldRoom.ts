import { Room, Client } from '@colyseus/core';
import { OverworldState, PlayerNetworkState } from '../schema/OverworldState.js';
import {
  OverworldEngine,
  DEFAULT_OVERWORLD_MAP,
  type MapConfig,
  type Direction,
  type TileCoord,
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

    this.onMessage('move', (client: Client, message: { targetX: number; targetY: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.inBattle) {
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

      const result = OverworldEngine.movePlayer(playerState, targetTile, this.mapConfig, this.rng);

      if (result.success) {
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

    this.onMessage('battleConcluded', (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.inBattle = false;
      }
    });
  }

  onJoin(client: Client, options: { name?: string; spawnTile?: TileCoord } = {}) {
    const spawnX = options.spawnTile?.x ?? 10;
    const spawnY = options.spawnTile?.y ?? 10;
    const playerName = options.name ?? `Player_${client.sessionId.slice(0, 4)}`;

    const player = new PlayerNetworkState(client.sessionId, playerName, spawnX, spawnY, 'down');
    this.state.players.set(client.sessionId, player);
    this.playerStepCounters.set(client.sessionId, 0);
  }

  onLeave(client: Client, _consented?: boolean) {
    this.state.players.delete(client.sessionId);
    this.playerStepCounters.delete(client.sessionId);
  }
}
