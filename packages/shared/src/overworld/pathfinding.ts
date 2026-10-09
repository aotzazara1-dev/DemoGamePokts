import { type TileCoord, type MapConfig } from '../types.js';

export interface PathfindingOptions {
  allowDiagonal?: boolean;
  maxIterations?: number;
}

/**
 * A* Pathfinding implementation for 2D/Isometric tile grids with obstacle avoidance.
 * Returns an array of TileCoords from start to goal inclusive: [start, step1, step2, ..., goal]
 * If no path exists, returns empty array [].
 */
export function findPath(
  start: TileCoord,
  goal: TileCoord,
  mapConfig: MapConfig,
  options: PathfindingOptions = {}
): TileCoord[] {
  const { allowDiagonal = true, maxIterations = 2000 } = options;

  // 1. Trivial case: already at goal
  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  // 2. Validate boundaries
  if (
    goal.x < 0 || goal.x >= mapConfig.width ||
    goal.y < 0 || goal.y >= mapConfig.height
  ) {
    return [];
  }

  // Set of obstacles for O(1) lookup
  const obstacleSet = new Set<string>();
  mapConfig.obstacles.forEach(o => obstacleSet.add(`${o.x},${o.y}`));

  // If goal is obstacle, cannot reach
  if (obstacleSet.has(`${goal.x},${goal.y}`)) {
    return [];
  }

  const keyOf = (c: TileCoord) => `${c.x},${c.y}`;

  // Heuristic: Octile distance for 8-direction grid
  function heuristic(a: TileCoord, b: TileCoord): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    if (!allowDiagonal) {
      return dx + dy;
    }
    return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
  }

  // Open set and closed set
  const openSet: TileCoord[] = [{ ...start }];
  const closedSet = new Set<string>();

  const cameFrom = new Map<string, TileCoord>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const startKey = keyOf(start);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, goal));

  let iterations = 0;

  const directions = allowDiagonal
    ? [
        { dx: 0, dy: -1, cost: 1.0 },
        { dx: 0, dy: 1, cost: 1.0 },
        { dx: -1, dy: 0, cost: 1.0 },
        { dx: 1, dy: 0, cost: 1.0 },
        { dx: -1, dy: -1, cost: Math.SQRT2 },
        { dx: 1, dy: -1, cost: Math.SQRT2 },
        { dx: -1, dy: 1, cost: Math.SQRT2 },
        { dx: 1, dy: 1, cost: Math.SQRT2 }
      ]
    : [
        { dx: 0, dy: -1, cost: 1.0 },
        { dx: 0, dy: 1, cost: 1.0 },
        { dx: -1, dy: 0, cost: 1.0 },
        { dx: 1, dy: 0, cost: 1.0 }
      ];

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node in openSet with lowest fScore
    let lowestIdx = 0;
    let lowestF = fScore.get(keyOf(openSet[0])) ?? Infinity;
    for (let i = 1; i < openSet.length; i++) {
      const f = fScore.get(keyOf(openSet[i])) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        lowestIdx = i;
      }
    }

    const current = openSet.splice(lowestIdx, 1)[0];
    const currentKey = keyOf(current);

    // Goal reached!
    if (current.x === goal.x && current.y === goal.y) {
      // Reconstruct path
      const path: TileCoord[] = [current];
      let curr = current;
      while (cameFrom.has(keyOf(curr))) {
        curr = cameFrom.get(keyOf(curr))!;
        path.unshift(curr);
      }
      return path;
    }

    closedSet.add(currentKey);

    // Explore neighbors
    for (const dir of directions) {
      const neighbor: TileCoord = {
        x: current.x + dir.dx,
        y: current.y + dir.dy
      };
      const neighborKey = keyOf(neighbor);

      if (closedSet.has(neighborKey)) continue;

      // Bounds check
      if (
        neighbor.x < 0 || neighbor.x >= mapConfig.width ||
        neighbor.y < 0 || neighbor.y >= mapConfig.height
      ) {
        continue;
      }

      // Obstacle check
      if (obstacleSet.has(neighborKey)) {
        continue;
      }

      // Diagonal corner cutting prevention:
      // If moving diagonally (dx != 0 && dy != 0), ensure we don't squeeze between two orthogonal obstacles
      if (dir.dx !== 0 && dir.dy !== 0) {
        const sideA = obstacleSet.has(`${current.x + dir.dx},${current.y}`);
        const sideB = obstacleSet.has(`${current.x},${current.y + dir.dy}`);
        if (sideA && sideB) {
          // Blocked diagonal squeeze
          continue;
        }
      }

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + dir.cost;
      const neighborG = gScore.get(neighborKey) ?? Infinity;

      if (tentativeG < neighborG) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));

        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  // No path found or iteration limit reached
  return [];
}
