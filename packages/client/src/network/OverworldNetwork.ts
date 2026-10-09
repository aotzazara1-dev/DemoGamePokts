import { Client, Room } from 'colyseus.js';
import { type PortalTransitionPayload, type MoveMessagePayload, type HeroFullSaveState, type SyncHeroStatePayload } from '@poktsonline/shared';

export interface PlayerNetData {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: string;
  mapId?: string;
  inBattle: boolean;
  onChange?: (changes?: any) => void;
}

export type PlayerCallback = (sessionId: string, player: PlayerNetData) => void;
export type PlayerRemoveCallback = (sessionId: string) => void;
export type EncounterCallback = (payload: { encounter: any; playerPosition: { x: number; y: number } }) => void;
export type PortalTransitionCallback = (payload: PortalTransitionPayload) => void;
export type HeroStateLoadedCallback = (payload: HeroFullSaveState) => void;

export class OverworldNetwork {
  private client?: Client;
  private room?: Room;
  private encounterListeners: EncounterCallback[] = [];
  private portalTransitionListeners: PortalTransitionCallback[] = [];
  private heroStateLoadedListeners: HeroStateLoadedCallback[] = [];
  private lastHeroStateLoaded?: HeroFullSaveState;

  public async connect(
    serverUrl: string = 'ws://localhost:2567',
    options: {
      name?: string;
      spawnTile?: { x: number; y: number };
      sessionToken?: string;
      heroId?: string;
    } = {}
  ): Promise<Room> {
    this.client = new Client(serverUrl);
    this.room = await this.client.joinOrCreate('overworld', options);
    this.setupRoomListeners(this.room);
    return this.room;
  }

  public setRoom(room: Room) {
    this.room = room;
    this.setupRoomListeners(room);
  }

  public onHeroStateLoaded(cb: HeroStateLoadedCallback) {
    this.heroStateLoadedListeners.push(cb);
    if (this.lastHeroStateLoaded) {
      cb(this.lastHeroStateLoaded);
    }
  }

  private setupRoomListeners(room: Room) {
    room.onMessage('encounter', (payload: any) => {
      this.encounterListeners.forEach(cb => cb(payload));
    });
    room.onMessage('portalTransition', (payload: any) => {
      this.portalTransitionListeners.forEach(cb => cb(payload));
    });
    room.onMessage('heroStateLoaded', (payload: any) => {
      this.lastHeroStateLoaded = payload;
      this.heroStateLoadedListeners.forEach(cb => cb(payload));
    });
  }

  public sendMove(targetX: number, targetY: number, mapId?: string) {
    if (!this.room) return;
    this.room.send('move', { targetX, targetY, mapId });
  }

  public sendBattleConcluded() {
    if (!this.room) return;
    this.room.send('battleConcluded');
  }

  public sendWarpTown() {
    if (!this.room) return;
    this.room.send('warpTown');
  }

  public sendWarpPortal(targetMapId: string, targetPosition: { x: number; y: number }, portalName?: string) {
    if (!this.room) return;
    this.room.send('warpPortal', { targetMapId, targetPosition, portalName });
  }

  public sendSyncHeroState(payload: Partial<SyncHeroStatePayload>) {
    if (!this.room) return;
    this.room.send('syncHeroState', payload);
  }

  public onEncounter(callback: EncounterCallback) {
    this.encounterListeners.push(callback);
  }

  public onPortalTransition(callback: PortalTransitionCallback) {
    this.portalTransitionListeners.push(callback);
  }

  public getSessionId(): string | undefined {
    return this.room?.sessionId;
  }

  public getRoom(): Room | undefined {
    return this.room;
  }

  public disconnect() {
    if (this.room) {
      this.room.leave();
    }
  }
}
