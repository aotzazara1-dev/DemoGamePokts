// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OverworldEntityManager } from '../src/entities/OverworldEntityManager.js';

describe('OverworldEntityManager Deep Module', () => {
  let mockScene: any;
  let entityManager: OverworldEntityManager;

  beforeEach(() => {
    mockScene = {
      textures: {
        exists: vi.fn(() => true)
      },
      add: {
        container: vi.fn((x: number, y: number) => {
          const children: any[] = [];
          const c: any = {
            x,
            y,
            visible: true,
            active: true,
            depth: 0,
            width: 0,
            height: 0,
            input: { cursor: '' },
            children,
            add: vi.fn((items: any[]) => {
              if (Array.isArray(items)) children.push(...items);
              else children.push(items);
            }),
            getByName: vi.fn((name: string) => children.find(item => item?.name === name)),
            setPosition: vi.fn((nx: number, ny: number) => { c.x = nx; c.y = ny; }),
            setDepth: vi.fn((d: number) => { c.depth = d; }),
            setVisible: vi.fn((v: boolean) => { c.visible = v; }),
            setSize: vi.fn((w: number, h: number) => { c.width = w; c.height = h; }),
            setScale: vi.fn(),
            setInteractive: vi.fn(),
            on: vi.fn(),
            destroy: vi.fn()
          };
          return c;
        }),
        image: vi.fn(() => {
          const img: any = {
            setOrigin: vi.fn(() => img),
            setTexture: vi.fn(() => img),
            setFlipX: vi.fn(() => img),
            setScale: vi.fn(() => img),
            setName: vi.fn((n: string) => { img.name = n; return img; })
          };
          return img;
        }),
        ellipse: vi.fn(() => ({})),
        circle: vi.fn(() => {
          const circ: any = {
            setStrokeStyle: vi.fn(() => circ)
          };
          return circ;
        }),
        text: vi.fn(() => {
          const t: any = {
            setOrigin: vi.fn(() => t),
            setColor: vi.fn(() => t),
            setScale: vi.fn(() => t),
            setInteractive: vi.fn(() => t),
            on: vi.fn(() => t),
            width: 50,
            height: 12
          };
          return t;
        }),
        graphics: vi.fn(() => ({
          fillStyle: vi.fn(),
          lineStyle: vi.fn(),
          fillRoundedRect: vi.fn(),
          strokeRoundedRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fillPath: vi.fn(),
          strokePath: vi.fn()
        }))
      },
      tweens: {
        killTweensOf: vi.fn(),
        add: vi.fn()
      },
      time: {
        delayedCall: vi.fn((_ms, cb) => ({ remove: vi.fn() }))
      }
    };

    entityManager = new OverworldEntityManager(mockScene, {
      tileWidth: 64,
      tileHeight: 32,
      originX: 1600,
      originY: 200
    });
  });

  it('manages remote players (add, update, remove)', () => {
    entityManager.addOtherPlayer('sess_1', { x: 5, y: 5, direction: 'down', mapId: 'novice_town_and_meadow', name: 'Alice' }, 'novice_town_and_meadow');
    expect(entityManager.getOtherPlayer('sess_1')).toBeDefined();

    entityManager.updateOtherPlayer('sess_1', { x: 6, y: 5, direction: 'right', mapId: 'novice_town_and_meadow', name: 'Alice' }, 'novice_town_and_meadow');
    expect(mockScene.tweens.add).toHaveBeenCalled();

    entityManager.removeOtherPlayer('sess_1');
    expect(entityManager.getOtherPlayer('sess_1')).toBeUndefined();
  });

  it('manages roaming beasts (add, update, remove)', () => {
    const beastData = {
      templateId: 'rock_boar',
      name: 'Rock Boar',
      element: 'earth',
      level: 3,
      x: 12,
      y: 14,
      mapId: 'novice_town_and_meadow',
      inCombat: false
    };

    entityManager.addRoamingBeast('beast_1', beastData, 'novice_town_and_meadow');
    expect(entityManager.getRoamingBeast('beast_1')).toBeDefined();

    entityManager.updateRoamingBeast('beast_1', { ...beastData, x: 13 }, 'novice_town_and_meadow');
    expect(mockScene.tweens.add).toHaveBeenCalled();

    entityManager.removeRoamingBeast('beast_1');
    expect(entityManager.getRoamingBeast('beast_1')).toBeUndefined();
  });

  it('renders portals and NPCs with interactive handlers', () => {
    const portals: any = [
      { name: 'Forest Portal', position: { x: 28, y: 15 }, targetMapId: 'misty_forest', targetPosition: { x: 2, y: 15 } }
    ];
    const npcs: any = [
      { id: 'elder', name: 'Elder Shen', position: { x: 10, y: 8 }, avatarIcon: '📜' }
    ];

    expect(() => entityManager.renderPortals(portals)).not.toThrow();
    expect(() => entityManager.renderNPCs(npcs)).not.toThrow();

    expect(() => entityManager.clearPortals()).not.toThrow();
    expect(() => entityManager.clearNPCs()).not.toThrow();
  });

  it('aggregates minimap blips accurately', () => {
    entityManager.addOtherPlayer('sess_1', { x: 5, y: 5, direction: 'down', mapId: 'town', name: 'Alice' }, 'town');
    entityManager.addRoamingBeast('b_1', { templateId: 'panda', name: 'Panda', element: 'wind', level: 1, x: 8, y: 8, mapId: 'town', inCombat: false }, 'town');

    const mapConfig: any = {
      id: 'town',
      npcs: [{ position: { x: 1, y: 1 } }],
      portals: [{ position: { x: 9, y: 9 } }]
    };

    const blips = entityManager.getMinimapBlips(mapConfig);
    expect(blips.otherPlayers).toEqual([{ x: 5, y: 5 }]);
    expect(blips.beasts).toEqual([{ x: 8, y: 8 }]);
    expect(blips.npcs).toEqual([{ x: 1, y: 1 }]);
    expect(blips.portals).toEqual([{ x: 9, y: 9 }]);
  });

  it('displays speech bubble above target container', () => {
    const target = mockScene.add.container(100, 100);
    expect(() => entityManager.showSpeechBubble(target, 'Hello World!')).not.toThrow();
    expect(mockScene.tweens.add).toHaveBeenCalled();
  });

  it('cleans up resources on destroy', () => {
    entityManager.addOtherPlayer('sess_1', { x: 5, y: 5, direction: 'down', mapId: 'town', name: 'Alice' }, 'town');
    entityManager.destroy();
    expect(entityManager.getOtherPlayer('sess_1')).toBeUndefined();
  });
});
