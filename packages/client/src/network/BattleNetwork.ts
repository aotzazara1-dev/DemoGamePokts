import { Client, Room } from 'colyseus.js';
import { type CombatAction } from '@poktsonline/shared';

export type TurnResolutionCallback = (payload: { events: any[]; outcome: string }) => void;
export type BattleEndCallback = (payload: { outcome: string; capturedBeastIds: string[] }) => void;

export class BattleNetwork {
  private client?: Client;
  private room?: Room;
  private turnResolutionListeners: TurnResolutionCallback[] = [];
  private battleEndListeners: BattleEndCallback[] = [];

  public async connect(serverUrl: string = 'ws://localhost:2567', options: any = {}): Promise<Room> {
    this.client = new Client(serverUrl);
    this.room = await this.client.joinOrCreate('battle', options);
    this.setupRoomListeners(this.room);
    return this.room;
  }

  public setRoom(room: Room) {
    this.room = room;
    this.setupRoomListeners(room);
  }

  private setupRoomListeners(room: Room) {
    room.onMessage('turnResolution', (payload: any) => {
      this.turnResolutionListeners.forEach(cb => cb(payload));
    });

    room.onMessage('battleEnd', (payload: any) => {
      this.battleEndListeners.forEach(cb => cb(payload));
    });
  }

  public sendSelectAction(combatantId: string, action: CombatAction) {
    if (!this.room) return;
    this.room.send('selectAction', { combatantId, action });
  }

  public onTurnResolution(callback: TurnResolutionCallback) {
    this.turnResolutionListeners.push(callback);
  }

  public onBattleEnd(callback: BattleEndCallback) {
    this.battleEndListeners.push(callback);
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
