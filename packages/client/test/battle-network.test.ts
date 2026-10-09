import { describe, it, expect, vi } from 'vitest';
import { BattleNetwork } from '../src/network/BattleNetwork.js';

describe('BattleNetwork', () => {
  it('sends selectAction message to room', () => {
    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn()
    };

    const net = new BattleNetwork();
    net.setRoom(mockRoom);

    net.sendSelectAction('hero_1', { type: 'attack', targetId: 'enemy_1' });
    expect(mockRoom.send).toHaveBeenCalledWith('selectAction', {
      combatantId: 'hero_1',
      action: { type: 'attack', targetId: 'enemy_1' }
    });
  });

  it('receives turnResolution and battleEnd broadcasts', () => {
    const messageHandlers: Record<string, (payload: any) => void> = {};

    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn((type: string, cb: any) => {
        messageHandlers[type] = cb;
      })
    };

    const net = new BattleNetwork();
    net.setRoom(mockRoom);

    const onResMock = vi.fn();
    const onEndMock = vi.fn();

    net.onTurnResolution(onResMock);
    net.onBattleEnd(onEndMock);

    expect(messageHandlers['turnResolution']).toBeDefined();
    expect(messageHandlers['battleEnd']).toBeDefined();

    messageHandlers['turnResolution']({ events: [], outcome: 'ongoing' });
    expect(onResMock).toHaveBeenCalled();

    messageHandlers['battleEnd']({ outcome: 'victory', capturedBeastIds: [] });
    expect(onEndMock).toHaveBeenCalledWith({ outcome: 'victory', capturedBeastIds: [] });
  });
});
