export interface ScreenCoord {
  x: number;
  y: number;
}

export interface IsoTileCoord {
  tileX: number;
  tileY: number;
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
): ScreenCoord {
  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;

  const x = (tileX - tileY) * halfWidth + originX;
  const y = (tileX + tileY) * halfHeight + originY;

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
): IsoTileCoord {
  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;

  const relX = screenX - originX;
  const relY = screenY - originY;

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
