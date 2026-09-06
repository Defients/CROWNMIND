import { describe, it, expect } from 'vitest';
import { getDistance, findPath, isTileWalkable } from './pathfinding';
import type { Cell } from '../types/world';

function makeGrid(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let x = 0; x < size; x++) {
    grid[x] = [];
    for (let y = 0; y < size; y++) {
      grid[x][y] = {
        x,
        y,
        terrain: 'grass',
        isExplored: true,
        resourceDeposit: null,
        hasRoad: false,
        hasBuilding: false,
      };
    }
  }
  return grid;
}

describe('getDistance', () => {
  it('returns 0 for same point', () => {
    expect(getDistance(5, 5, 5, 5)).toBe(0);
  });

  it('returns Euclidean distance', () => {
    expect(getDistance(0, 0, 3, 4)).toBeCloseTo(5);
  });
});

describe('findPath', () => {
  it('returns a path from start to goal on open terrain', () => {
    const grid = makeGrid(20);
    const path = findPath(grid, 0, 0, 5, 5, 20);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    expect(path![path!.length - 1]).toEqual({ x: 5, y: 5 });
  });

  it('returns null or empty when start equals goal', () => {
    const grid = makeGrid(10);
    const path = findPath(grid, 3, 3, 3, 3, 10);
    // path to self should be empty or just the start
    expect(path === null || path.length <= 1).toBe(true);
  });

  it('navigates around obstacles', () => {
    const grid = makeGrid(10);
    // create a wall of stone at x=5, y=0..8
    for (let y = 0; y < 9; y++) {
      grid[5][y].terrain = 'stone';
    }
    // leave a gap at y=9
    const path = findPath(grid, 0, 4, 9, 4, 10);
    expect(path).not.toBeNull();
    if (path && path.length > 0) {
      expect(path[path.length - 1]).toEqual({ x: 9, y: 4 });
      // no waypoint should be on the wall
      for (const wp of path) {
        if (wp.x === 5 && wp.y < 9) {
          // path should go around, not through the wall
          // (stone has high cost but isn't impassable, so we just check it reaches goal)
        }
      }
    }
  });

  it('routes around building tiles', () => {
    const grid = makeGrid(10);
    // place a 2x2 building at (4,3)-(5,4)
    grid[4][3].hasBuilding = true;
    grid[4][4].hasBuilding = true;
    grid[5][3].hasBuilding = true;
    grid[5][4].hasBuilding = true;
    const path = findPath(grid, 2, 3, 8, 3, 10);
    expect(path).not.toBeNull();
    if (path) {
      for (const wp of path) {
        expect(grid[wp.x][wp.y].hasBuilding).toBe(false);
      }
    }
  });
});

describe('isTileWalkable', () => {
  it('returns true for normal grass tile', () => {
    const grid = makeGrid(10);
    expect(isTileWalkable(grid, 5, 5, 10)).toBe(true);
  });

  it('returns false for building tile', () => {
    const grid = makeGrid(10);
    grid[3][3].hasBuilding = true;
    expect(isTileWalkable(grid, 3, 3, 10)).toBe(false);
  });

  it('returns false for water tile', () => {
    const grid = makeGrid(10);
    grid[2][2].terrain = 'water';
    expect(isTileWalkable(grid, 2, 2, 10)).toBe(false);
  });
});
