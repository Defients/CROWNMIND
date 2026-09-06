import type { GameConfig } from '../types/game';
import type { Biome } from '../types/world';
import type { MapSize, Difficulty, GameMode } from '../types/game';

export function encodeSeed(config: GameConfig): string {
  const params = new URLSearchParams();
  params.set('seed', config.seedString);
  params.set('diff', config.difficulty);
  params.set('mode', config.gameMode);
  params.set('biome', config.biome);
  params.set('size', config.mapSize);
  params.set('time', String(config.timeLimit));
  if (config.scenarioId) params.set('scenario', config.scenarioId);
  return params.toString();
}

export function decodeSeed(hash: string): GameConfig | null {
  try {
    const params = new URLSearchParams(hash);
    const seedString = params.get('seed');
    if (!seedString) return null;

    const difficulty = (params.get('diff') as Difficulty) || 'standard';
    const gameMode = (params.get('mode') as GameMode) || 'observer';
    const biome = (params.get('biome') as Biome) || 'temperate';
    const mapSize = (params.get('size') as MapSize) || 'standard';
    const timeLimit = Number(params.get('time')) || 60;

    return {
      seed: hashSeedString(seedString),
      seedString,
      difficulty,
      gameMode,
      biome,
      mapSize,
      timeLimit,
      scenarioId: params.get('scenario') ?? null,
    };
  } catch {
    return null;
  }
}

function hashSeedString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 ^ (h1 >>> 0)) >>> 0;
}
