export interface ScreenCoord {
  x: number;
  y: number;
}

export interface IsoTileCoord {
  tileX: number;
  tileY: number;
}

export interface IsometricConfig {
  tileWidth: number;
  tileHeight: number;
  originX: number;
  originY: number;
}

/**
 * Projects a 2D grid tile coordinate to a 2.5D isometric screen position (standard 2:1 diamond projection).
 */
export function isoToScreen(
  tileX: number,
  tileY: number,
  tileWidth: number,
  tileHeight: number,
  originX: number,
  originY: number
): ScreenCoord;
export function isoToScreen(
  tileX: number,
  tileY: number,
  config: IsometricConfig
): ScreenCoord;
export function isoToScreen(
  tileX: number,
  tileY: number,
  configOrWidth: number | IsometricConfig,
  tileHeight?: number,
  originX?: number,
  originY?: number
): ScreenCoord {
  let tw: number, th: number, ox: number, oy: number;

  if (typeof configOrWidth === 'object') {
    tw = configOrWidth.tileWidth;
    th = configOrWidth.tileHeight;
    ox = configOrWidth.originX;
    oy = configOrWidth.originY;
  } else {
    tw = configOrWidth;
    th = tileHeight!;
    ox = originX!;
    oy = originY!;
  }

  const halfWidth = tw / 2;
  const halfHeight = th / 2;

  const x = (tileX - tileY) * halfWidth + ox;
  const y = (tileX + tileY) * halfHeight + oy;

  return { x, y };
}

/**
 * Inverts an isometric screen position back to 2D grid tile coordinates.
 */
export function screenToIso(
  screenX: number,
  screenY: number,
  tileWidth: number,
  tileHeight: number,
  originX: number,
  originY: number
): IsoTileCoord;
export function screenToIso(
  screenX: number,
  screenY: number,
  config: IsometricConfig
): IsoTileCoord;
export function screenToIso(
  screenX: number,
  screenY: number,
  configOrWidth: number | IsometricConfig,
  tileHeight?: number,
  originX?: number,
  originY?: number
): IsoTileCoord {
  let tw: number, th: number, ox: number, oy: number;

  if (typeof configOrWidth === 'object') {
    tw = configOrWidth.tileWidth;
    th = configOrWidth.tileHeight;
    ox = configOrWidth.originX;
    oy = configOrWidth.originY;
  } else {
    tw = configOrWidth;
    th = tileHeight!;
    ox = originX!;
    oy = originY!;
  }

  const halfWidth = tw / 2;
  const halfHeight = th / 2;

  const relX = screenX - ox;
  const relY = screenY - oy;

  const termA = relX / halfWidth;
  const termB = relY / halfHeight;

  const tileX = (termA + termB) / 2;
  const tileY = (termB - termA) / 2;

  return { tileX, tileY };
}

/**
 * Calculates rendering depth for sprite sorting along the isometric diagonal.
 */
export function getIsometricDepth(tileX: number, tileY: number, subLayer: number = 0): number {
  return (tileX + tileY) * 1000 + subLayer;
}
