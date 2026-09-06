import { createHash } from 'node:crypto';
import { describe, it, expect, vi } from 'vitest';
import { hashSeed } from '../utils/rng';
import { PresentationEventDeriver } from './events';
import { deriveTheme, noise } from './theme';
import type { GameConfig } from '../types/game';

// Captured from untouched 16d8bdf869bd25a57c2d341db59c164e47a5680a in an isolated module graph per run.
const cases = [
  {
    seedString: 'sovereign-table',
    biome: 'temperate',
    difficulty: 'standard',
    gameMode: 'observer',
    mapSize: 'small',
    ticks: 180,
    sha256: '0a6142dc858ad31be5e61270c74ec2eef874e1fc95ffba920f6b026181282465',
  },
  {
    seedString: 'spire-resilience',
    biome: 'arid',
    difficulty: 'hard',
    gameMode: 'sandbox',
    mapSize: 'standard',
    ticks: 180,
    sha256: 'fc8592e182acd88d49ad076e19493274cac03b036160c0be90d23a6c935c9b2d',
  },
  {
    seedString: 'frozen-crown',
    biome: 'tundra',
    difficulty: 'standard',
    gameMode: 'observer',
    mapSize: 'large',
    ticks: 120,
    sha256: 'ac56280b3b98b43a7ab6bffd320b6e04a077b8645fc1ab85cb391ea06c9cabb0',
  },
] as const;
describe('exact authoritative state parity with the original revision', () => {
  for (const c of cases)
    it(`${c.seedString}: repeatable with presentation at every tick`, async () => {
      const hashes: string[] = [];
      for (let repeat = 0; repeat < 2; repeat++) {
        // Existing Sovereign log counters are module-scoped and have no public reset API.
        vi.resetModules();
        const { initializeGame } = await import('../utils/worldGenerator');
        const { simulateTick, resetCounters } = await import('../systems/simulationRunner');
        const config: GameConfig = {
          seedString: c.seedString,
          biome: c.biome,
          difficulty: c.difficulty,
          gameMode: c.gameMode,
          mapSize: c.mapSize,
          seed: hashSeed(c.seedString),
          timeLimit: 60,
        };
        resetCounters();
        let state = initializeGame(config);
        state.gameStatus = 'playing';
        const events = new PresentationEventDeriver();
        events.derive(state);
        for (let tick = 0; tick < c.ticks; tick++) {
          state = simulateTick(state);
          // Render-frequency variation must not affect authoritative output.
          for (let frame = 0; frame <= repeat; frame++) {
            events.derive(state);
            deriveTheme(state);
            noise(tick, frame);
          }
        }
        hashes.push(createHash('sha256').update(JSON.stringify(state)).digest('hex'));
      }
      expect(hashes).toEqual([c.sha256, c.sha256]);
    }, 30000);
});
