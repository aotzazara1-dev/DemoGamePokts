import { describe, it, expect } from 'vitest';
import { isoToScreen, screenToIso, getIsometricDepth } from '../src/utils/isometric.js';

describe('Isometric Coordinate Math', () => {
  const TILE_WIDTH = 64;
  const TILE_HEIGHT = 32;
  const ORIGIN_X = 512;
  const ORIGIN_Y = 100;

  it('correctly maps origin tile (0, 0) to screen origin', () => {
    const screen = isoToScreen(0, 0, TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y);
    expect(screen.x).toBe(ORIGIN_X);
    expect(screen.y).toBe(ORIGIN_Y);
  });

  it('correctly maps cardinal grid steps to standard 2:1 isometric diamond projection', () => {
    // Step (1, 0) moves down-right (+X/2, +Y/2)
    const pos10 = isoToScreen(1, 0, TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y);
    expect(pos10.x).toBe(ORIGIN_X + 32);
    expect(pos10.y).toBe(ORIGIN_Y + 16);

    // Step (0, 1) moves down-left (-X/2, +Y/2)
    const pos01 = isoToScreen(0, 1, TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y);
    expect(pos01.x).toBe(ORIGIN_X - 32);
    expect(pos01.y).toBe(ORIGIN_Y + 16);

    // Step (1, 1) moves directly down (0, +Y)
    const pos11 = isoToScreen(1, 1, TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y);
    expect(pos11.x).toBe(ORIGIN_X);
    expect(pos11.y).toBe(ORIGIN_Y + 32);
  });

  it('inverts screen coordinates back to tile coordinates round-trip', () => {
    const testTiles = [
      { x: 0, y: 0 },
      { x: 5, y: 3 },
      { x: 12, y: 18 },
      { x: 25, y: 10 }
    ];

    testTiles.forEach(tile => {
      const screen = isoToScreen(tile.x, tile.y, TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y);
      const inverted = screenToIso(screen.x, screen.y, TILE_WIDTH, TILE_HEIGHT, ORIGIN_X, ORIGIN_Y);
      expect(Math.round(inverted.tileX)).toBe(tile.x);
      expect(Math.round(inverted.tileY)).toBe(tile.y);
    });
  });

  it('calculates depth order monotonically increasing along (x + y)', () => {
    const depthOrigin = getIsometricDepth(0, 0);
    const depthNear = getIsometricDepth(1, 1);
    const depthFar = getIsometricDepth(10, 10);

    expect(depthOrigin).toBeLessThan(depthNear);
    expect(depthNear).toBeLessThan(depthFar);
  });

  it('supports passing bundled IsometricConfig object', () => {
    const config = {
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
      originX: ORIGIN_X,
      originY: ORIGIN_Y
    };

    const screen = isoToScreen(3, 4, config);
    const inverted = screenToIso(screen.x, screen.y, config);

    expect(Math.round(inverted.tileX)).toBe(3);
    expect(Math.round(inverted.tileY)).toBe(4);
  });

  it('guarantees UI modal depth (1,000,000) exceeds maximum overworld tile depths', () => {
    const UI_MODAL_DEPTH = 1_000_000;
    // Map with 100x100 tiles at maximum corner plus foreground entity sublayer
    const maxTileDepth = getIsometricDepth(100, 100, 100);
    expect(UI_MODAL_DEPTH).toBeGreaterThan(maxTileDepth);
  });
});

