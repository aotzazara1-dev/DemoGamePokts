import { describe, it, expect } from 'vitest';
import { findPath } from '../src/overworld/pathfinding.js';
import { type MapConfig } from '../src/types.js';

describe('A* Pathfinding (findPath)', () => {
  const testMap: MapConfig = {
    width: 20,
    height: 20,
    obstacles: [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 5, y: 8 }
    ],
    zones: []
  };

  it('returns [start] when start and goal are the same tile', () => {
    const path = findPath({ x: 2, y: 2 }, { x: 2, y: 2 }, testMap);
    expect(path).toEqual([{ x: 2, y: 2 }]);
  });

  it('returns empty array when goal is out of bounds', () => {
    const path = findPath({ x: 2, y: 2 }, { x: 25, y: 25 }, testMap);
    expect(path).toEqual([]);
  });

  it('returns empty array when goal is an obstacle', () => {
    const path = findPath({ x: 2, y: 2 }, { x: 5, y: 6 }, testMap);
    expect(path).toEqual([]);
  });

  it('finds a direct straight line path with no obstacles', () => {
    const path = findPath({ x: 0, y: 0 }, { x: 0, y: 3 }, testMap);
    expect(path.length).toBe(4);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 0, y: 3 });
  });

  it('finds a path navigating around an obstacle wall', () => {
    // Start at (4, 6), Goal at (6, 6) with wall at x=5 from y=5..8
    const path = findPath({ x: 4, y: 6 }, { x: 6, y: 6 }, testMap);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual({ x: 4, y: 6 });
    expect(path[path.length - 1]).toEqual({ x: 6, y: 6 });

    // None of the path nodes should be in the obstacle wall
    path.forEach(step => {
      const isObstacle = testMap.obstacles.some(o => o.x === step.x && o.y === step.y);
      expect(isObstacle).toBe(false);
    });
  });

  it('supports non-diagonal pathfinding when allowDiagonal is false', () => {
    const path = findPath({ x: 0, y: 0 }, { x: 2, y: 2 }, testMap, { allowDiagonal: false });
    expect(path.length).toBe(5); // 0,0 -> 1,0 -> 2,0 -> 2,1 -> 2,2 (4 steps, 5 nodes)
    // Check that every step is cardinal (dx + dy == 1)
    for (let i = 1; i < path.length; i++) {
      const dist = Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y);
      expect(dist).toBe(1);
    }
  });
});
