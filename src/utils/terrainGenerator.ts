import type { Cell, TerrainType, Biome } from '../types/world';
import type { ResourceType } from '../types/resources';
import type { SeededRNG } from './rng';
import { getDistance } from './pathfinding';
import { BIOMES } from '../types/world';

export function generateTerrain(
  mapSize: number,
  biome: Biome,
  rng: SeededRNG
): Cell[][] {
  const grid: Cell[][] = [];
  const biomeInfo = BIOMES[biome];
  const dist = biomeInfo.terrainDistribution;

  for (let x = 0; x < mapSize; x++) {
    grid[x] = [];
    for (let y = 0; y < mapSize; y++) {
      let terrain: TerrainType = 'grass';

      const forestNoise = Math.sin(x * 0.15) * Math.cos(y * 0.15);
      const stoneNoise = Math.cos(x * 0.3) * Math.sin(y * 0.3);
      const noise = forestNoise + rng.float(-0.1, 0.1);

      if (biome === 'temperate') {
        if (noise > 0.45) terrain = 'forest';
        if (stoneNoise + rng.float(-0.05, 0.05) > 0.75) terrain = 'stone';
        if (rng.chance(0.05)) terrain = 'fertile';
      } else if (biome === 'arid') {
        if (rng.chance(dist.desert)) terrain = 'desert';
        else if (rng.chance(0.08)) terrain = 'stone';
        else if (rng.chance(0.05)) terrain = 'forest';
        else if (rng.chance(0.05)) terrain = 'fertile';
        else terrain = 'grass';
      } else if (biome === 'tundra') {
        if (rng.chance(dist.snow)) terrain = 'snow';
        else if (rng.chance(0.1)) terrain = 'stone';
        else if (rng.chance(0.08)) terrain = 'forest';
        else terrain = 'grass';
      }

      grid[x][y] = {
        x, y, terrain,
        isExplored: false,
        hasRoad: false,
        hasBuilding: false,
        resourceDeposit: null,
      };
    }
  }

  placeResourceDeposits(grid, mapSize, biome, rng);
  return grid;
}

function placeResourceDeposits(
  grid: Cell[][],
  mapSize: number,
  biome: Biome,
  rng: SeededRNG
): void {
  const depositDensity = biome === 'arid' ? 0.015 : biome === 'tundra' ? 0.012 : 0.02;
  const totalDeposits = Math.floor(mapSize * mapSize * depositDensity);

  for (let i = 0; i < totalDeposits; i++) {
    const x = rng.int(0, mapSize - 1);
    const y = rng.int(0, mapSize - 1);
    const cell = grid[x][y];

    if (cell.terrain === 'forest') {
      cell.resourceDeposit = 'wood';
    } else if (cell.terrain === 'stone') {
      cell.resourceDeposit = 'stone';
    } else if (cell.terrain === 'fertile' || cell.terrain === 'grass') {
      cell.resourceDeposit = rng.chance(0.5) ? 'food' : null;
    } else if (cell.terrain === 'desert') {
      cell.resourceDeposit = rng.chance(0.3) ? 'stone' : null;
    } else if (cell.terrain === 'snow') {
      cell.resourceDeposit = rng.chance(0.15) ? 'mana' : null;
    }
  }

  const manaDeposits = Math.floor(mapSize * 0.3);
  for (let i = 0; i < manaDeposits; i++) {
    const x = rng.int(0, mapSize - 1);
    const y = rng.int(0, mapSize - 1);
    if (grid[x][y].resourceDeposit === null && grid[x][y].terrain !== 'corruption' && grid[x][y].terrain !== 'water') {
      grid[x][y].resourceDeposit = 'mana';
    }
  }
}

export function setCorruption(grid: Cell[][], mapSize: number, cx: number, cy: number, radius: number): void {
  for (let x = 0; x < mapSize; x++) {
    for (let y = 0; y < mapSize; y++) {
      if (getDistance(x, y, cx, cy) < radius) {
        grid[x][y].terrain = 'corruption';
      }
    }
  }
}

export function revealArea(grid: Cell[][], mapSize: number, cx: number, cy: number, radius: number): void {
  for (let x = 0; x < mapSize; x++) {
    for (let y = 0; y < mapSize; y++) {
      if (getDistance(x, y, cx, cy) < radius) {
        grid[x][y].isExplored = true;
      }
    }
  }
}

export function exploreAround(grid: Cell[][], mapSize: number, cx: number, cy: number, radius: number): void {
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const ex = cx + i;
      const ey = cy + j;
      if (ex >= 0 && ex < mapSize && ey >= 0 && ey < mapSize) {
        if (getDistance(cx, cy, ex, ey) <= radius) {
          grid[ex][ey].isExplored = true;
        }
      }
    }
  }
}
