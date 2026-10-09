import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MinimapController } from '../src/ui/MinimapController.js';
import type { MapConfig } from '@poktsonline/shared';

describe('MinimapController', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockMapNameEl: HTMLElement;
  let mockCoordsEl: HTMLElement;
  let mockContainerEl: HTMLElement;
  let onNavigateSpy: any;

  const testMapConfig: MapConfig = {
    id: 'test_map',
    name: 'Test Realm',
    theme: 'meadow',
    width: 50,
    height: 50,
    obstacles: [{ x: 10, y: 10 }, { x: 11, y: 10 }],
    zones: [
      {
        id: 'safe_town',
        name: 'Town',
        type: 'safe',
        bounds: { minX: 0, maxX: 20, minY: 0, maxY: 20 },
        encounterRatePerStep: 0,
        encounterPool: []
      }
    ],
    portals: [
      {
        id: 'portal_1',
        name: 'Gate 1',
        position: { x: 5, y: 5 },
        targetMapId: 'target_map',
        targetPosition: { x: 1, y: 1 }
      }
    ]
  };

  beforeEach(() => {
    mockCanvas = {
      width: 140,
      height: 140,
      getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1
      })),
      addEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 140,
        height: 140
      }))
    } as any;

    mockMapNameEl = { textContent: '' } as any;
    mockCoordsEl = { textContent: '' } as any;
    mockContainerEl = { style: { display: 'block' } } as any;
    onNavigateSpy = vi.fn();
  });

  it('accurately converts pixel clicks to tile coordinates and clamps to map bounds', () => {
    const controller = new MinimapController({
      canvas: mockCanvas,
      mapNameEl: mockMapNameEl,
      coordsEl: mockCoordsEl,
      onNavigate: onNavigateSpy
    });
    controller.setMapConfig(testMapConfig);

    // Center pixel (70, 70) on 140x140 canvas with 50x50 map -> tile (25, 25)
    const centerTile = controller.screenToTile(70, 70);
    expect(centerTile.x).toBe(25);
    expect(centerTile.y).toBe(25);

    // Origin (0, 0)
    const originTile = controller.screenToTile(0, 0);
    expect(originTile.x).toBe(0);
    expect(originTile.y).toBe(0);

    // Out of bounds negative -> clamped to 0
    const negTile = controller.screenToTile(-20, -50);
    expect(negTile.x).toBe(0);
    expect(negTile.y).toBe(0);

    // Out of bounds excess -> clamped to width-1, height-1 (49, 49)
    const excessTile = controller.screenToTile(200, 300);
    expect(excessTile.x).toBe(49);
    expect(excessTile.y).toBe(49);
  });

  it('converts tile coordinates to screen pixel positions', () => {
    const controller = new MinimapController({
      canvas: mockCanvas,
      mapNameEl: mockMapNameEl,
      coordsEl: mockCoordsEl
    });
    controller.setMapConfig(testMapConfig);

    // Tile (0, 0) center: stepX = 140/50 = 2.8, center = 0.5 * 2.8 = 1.4
    const screenCoord = controller.tileToScreen(0, 0);
    expect(screenCoord.x).toBeCloseTo(1.4, 2);
    expect(screenCoord.y).toBeCloseTo(1.4, 2);
  });

  it('updates map name and player coordinates display', () => {
    const controller = new MinimapController({
      canvas: mockCanvas,
      mapNameEl: mockMapNameEl,
      coordsEl: mockCoordsEl
    });

    controller.setMapConfig(testMapConfig);
    expect(mockMapNameEl.textContent).toBe('Test Realm');

    controller.updatePlayer({ x: 12.3, y: 18.7 }, 'up-right');
    expect(mockCoordsEl.textContent).toBe('(12, 19)');
  });

  it('toggles visibility of container element', () => {
    const controller = new MinimapController({
      canvas: mockCanvas,
      containerEl: mockContainerEl
    });

    controller.setVisible(false);
    expect(mockContainerEl.style.display).toBe('none');

    controller.setVisible(true);
    expect(mockContainerEl.style.display).toBe('block');
  });

  it('renders entities without throwing exceptions', () => {
    const controller = new MinimapController({
      canvas: mockCanvas,
      mapNameEl: mockMapNameEl,
      coordsEl: mockCoordsEl
    });
    controller.setMapConfig(testMapConfig);
    controller.updatePlayer({ x: 10, y: 10 }, 'down');

    expect(() => {
      controller.render({
        portals: [{ x: 5, y: 5 }],
        npcs: [{ x: 8, y: 8 }],
        beasts: [{ x: 30, y: 30 }],
        otherPlayers: [{ x: 12, y: 12 }]
      });
    }).not.toThrow();
  });
});
