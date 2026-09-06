import type { Cell, TerrainType } from '../types/world';

export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

const terrainCost: Record<TerrainType, number> = {
  grass: 1,
  fertile: 1,
  forest: 1.5,
  stone: 2,
  corruption: 3,
  desert: 1.5,
  snow: 2,
  water: 99,
};

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export function findPath(
  grid: Cell[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  mapSize: number
): { x: number; y: number }[] | null {
  startX = Math.floor(startX);
  startY = Math.floor(startY);
  endX = Math.round(endX);
  endY = Math.round(endY);

  if (startX === endX && startY === endY) return [];
  if (endX < 0 || endX >= mapSize || endY < 0 || endY >= mapSize) return null;

  const openList: PathNode[] = [];
  const closedSet = new Set<string>();
  const openMap = new Map<string, PathNode>();

  const key = (x: number, y: number) => `${x},${y}`;

  const startNode: PathNode = {
    x: startX, y: startY, g: 0,
    h: getDistance(startX, startY, endX, endY),
    f: 0, parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openList.push(startNode);
  openMap.set(key(startX, startY), startNode);

  const maxIterations = mapSize * mapSize * 2;
  let iterations = 0;

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;

    let currentIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIdx].f) currentIdx = i;
    }
    const current = openList[currentIdx];

    if (current.x === endX && current.y === endY) {
      const path: { x: number; y: number }[] = [];
      let node: PathNode | null = current;
      while (node && node.parent) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    openList.splice(currentIdx, 1);
    openMap.delete(key(current.x, current.y));
    closedSet.add(key(current.x, current.y));

    const neighbors = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
    ];

    for (const { dx, dy } of neighbors) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (nx < 0 || nx >= mapSize || ny < 0 || ny >= mapSize) continue;
      const nKey = key(nx, ny);
      if (closedSet.has(nKey)) continue;

      const cell = grid[nx]?.[ny];
      if (!cell) continue;

      const cost = terrainCost[cell.terrain] ?? 1;
      if (cost >= 99) continue;
      if (cell.hasBuilding && !(nx === endX && ny === endY)) continue;

      const diagonal = dx !== 0 && dy !== 0;
      const moveCost = diagonal ? cost * 1.41 : cost;
      const g = current.g + moveCost;

      const existing = openMap.get(nKey);
      if (existing && g >= existing.g) continue;

      const h = getDistance(nx, ny, endX, endY);
      const node: PathNode = { x: nx, y: ny, g, h, f: g + h, parent: current };

      if (existing) {
        const idx = openList.indexOf(existing);
        if (idx >= 0) openList.splice(idx, 1);
      }
      openList.push(node);
      openMap.set(nKey, node);
    }
  }

  return null;
}

export function getTerrainCost(terrain: TerrainType): number {
  return terrainCost[terrain] ?? 1;
}

export function isTileWalkable(grid: Cell[][], x: number, y: number, mapSize: number): boolean {
  if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) return false;
  const cell = grid[x]?.[y];
  if (!cell) return false;
  if ((terrainCost[cell.terrain] ?? 1) >= 99) return false;
  if (cell.hasBuilding) return false;
  return true;
}
