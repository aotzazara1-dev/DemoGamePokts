import { describe, it, expect, vi } from 'vitest';
import { OverworldNetwork } from '../src/network/OverworldNetwork.js';

describe('OverworldNetwork', () => {
  it('sends move message to room with target coordinates', () => {
    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn(),
      state: {
        players: {
          onAdd: vi.fn(),
          onRemove: vi.fn()
        }
      }
    };

    const network = new OverworldNetwork();
    network.setRoom(mockRoom);

    network.sendMove(15, 20);
    expect(mockRoom.send).toHaveBeenCalledWith('move', { targetX: 15, targetY: 20 });
  });

  it('notifies encounter listener when server dispatches encounter message', () => {
    let encounterCallback: ((payload: any) => void) | null = null;

    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn((type: string, cb: any) => {
        if (type === 'encounter') {
          encounterCallback = cb;
        }
      }),
      state: {
        players: {
          onAdd: vi.fn(),
          onRemove: vi.fn()
        }
      }
    };

    const network = new OverworldNetwork();
    network.setRoom(mockRoom);

    const onEncounterMock = vi.fn();
    network.onEncounter(onEncounterMock);

    expect(encounterCallback).toBeDefined();

    const sampleEncounter = { zoneId: 'forest', wildEnemies: [{ id: 'w1', name: 'Boar' }] };
    encounterCallback!(sampleEncounter);

    expect(onEncounterMock).toHaveBeenCalledWith(sampleEncounter);
  });

  it('sends warpTown message to room', () => {
    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn(),
      state: {
        players: {
          onAdd: vi.fn(),
          onRemove: vi.fn()
        }
      }
    };

    const network = new OverworldNetwork();
    network.setRoom(mockRoom);

    network.sendWarpTown();
    expect(mockRoom.send).toHaveBeenCalledWith('warpTown');
  });

  it('notifies portal transition listener when server dispatches portalTransition message', () => {
    let portalCallback: ((payload: any) => void) | null = null;

    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn((type: string, cb: any) => {
        if (type === 'portalTransition') {
          portalCallback = cb;
        }
      }),
      state: {
        players: {
          onAdd: vi.fn(),
          onRemove: vi.fn()
        }
      }
    };

    const network = new OverworldNetwork();
    network.setRoom(mockRoom);

    const onPortalMock = vi.fn();
    network.onPortalTransition(onPortalMock);

    expect(portalCallback).toBeDefined();

    const sampleTransition = {
      targetMapId: 'pebble_cave',
      targetPosition: { x: 2, y: 15 },
      portalName: 'Entrance to Pebble Cave'
    };
    portalCallback!(sampleTransition);

    expect(onPortalMock).toHaveBeenCalledWith(sampleTransition);
  });

  it('sends warpPortal message to room with targetMapId and targetPosition', () => {
    const mockRoom: any = {
      send: vi.fn(),
      onMessage: vi.fn(),
      state: {
        players: {
          onAdd: vi.fn(),
          onRemove: vi.fn()
        }
      }
    };

    const network = new OverworldNetwork();
    network.setRoom(mockRoom);

    network.sendWarpPortal('bamboo_forest', { x: 2, y: 15 }, 'Bamboo Forest');
    expect(mockRoom.send).toHaveBeenCalledWith('warpPortal', {
      targetMapId: 'bamboo_forest',
      targetPosition: { x: 2, y: 15 },
      portalName: 'Bamboo Forest'
    });
  });
});
