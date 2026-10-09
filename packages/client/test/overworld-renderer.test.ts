// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OverworldRenderer } from '../src/renderer/OverworldRenderer.js';

describe('OverworldRenderer Deep Module', () => {
  let mockScene: any;
  let renderer: OverworldRenderer;

  beforeEach(() => {
    mockScene = {
      textures: {
        exists: vi.fn(() => false)
      },
      make: {
        graphics: vi.fn(() => ({
          fillStyle: vi.fn(),
          fillPoints: vi.fn(),
          lineStyle: vi.fn(),
          strokePoints: vi.fn(),
          fillCircle: vi.fn(),
          strokeCircle: vi.fn(),
          fillRect: vi.fn(),
          fillRoundedRect: vi.fn(),
          fillTriangle: vi.fn(),
          generateTexture: vi.fn(),
          destroy: vi.fn()
        }))
      },
      add: {
        image: vi.fn(() => ({
          setDepth: vi.fn(),
          destroy: vi.fn()
        }))
      },
      tweens: {
        killTweensOf: vi.fn(),
        add: vi.fn()
      }
    };

    renderer = new OverworldRenderer(mockScene, {
      tileWidth: 64,
      tileHeight: 32,
      originX: 1600,
      originY: 200
    });
  });

  it('initializes procedural textures without errors', () => {
    expect(() => renderer.initTextures()).not.toThrow();
    expect(mockScene.make.graphics).toHaveBeenCalled();
  });

  it('determines directional sprite facing and updates texture/flip', () => {
    const mockImage = {
      setTexture: vi.fn(),
      setFlipX: vi.fn()
    };
    const mockContainer = {
      getByName: vi.fn(() => mockImage)
    } as any;

    // Moving Up-Right (screenDy < -6, screenDx > 8)
    const dirUpRight = renderer.updateHeroDirectionalSprite(mockContainer, 12, -10);
    expect(dirUpRight).toBe('up-right');
    expect(mockImage.setTexture).toHaveBeenCalledWith('hero_back_diag');
    expect(mockImage.setFlipX).toHaveBeenCalledWith(false);

    // Moving Down-Left (screenDy > 6, screenDx < -8)
    const dirDownLeft = renderer.updateHeroDirectionalSprite(mockContainer, -12, 10);
    expect(dirDownLeft).toBe('down-left');
    expect(mockImage.setTexture).toHaveBeenCalledWith('hero_sprite');
    expect(mockImage.setFlipX).toHaveBeenCalledWith(true);

    // Moving pure horizontal right
    const dirRight = renderer.updateHeroDirectionalSprite(mockContainer, 10, 0);
    expect(dirRight).toBe('right');
    expect(mockImage.setTexture).toHaveBeenCalledWith('hero_side');
    expect(mockImage.setFlipX).toHaveBeenCalledWith(false);
  });

  it('renders tilemap and tracks tile count', () => {
    const testMap: any = {
      width: 4,
      height: 4,
      theme: 'meadow',
      zones: [{ type: 'safe', bounds: { minX: 0, maxX: 2, minY: 0, maxY: 2 } }],
      obstacles: [{ x: 1, y: 1 }]
    };

    renderer.renderTilemap(testMap);
    expect(renderer.getMapTilesCount()).toBe(16); // 4x4
    expect(mockScene.add.image).toHaveBeenCalled();

    renderer.destroy();
    expect(renderer.getMapTilesCount()).toBe(0);
  });
});
