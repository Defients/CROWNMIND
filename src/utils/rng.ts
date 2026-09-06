/**
 * Deterministic seeded RNG utility.
 * Uses Mulberry32 PRNG with cyrb128 string hashing for stable numeric seeds.
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Core Mulberry32 step — returns a float in [0, 1) */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Float in [min, max) */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  /** Returns true with probability `p` (0..1) */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Pick a random element from a non-empty array */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Return a shuffled copy of the array (Fisher-Yates) */
  shuffle<T>(arr: readonly T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/** cyrb128 string hash — converts a string into a stable 32-bit seed */
export function hashSeed(str: string): number {
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

/** Create a SeededRNG from either a string or numeric seed */
export function createRNG(seed: string | number): SeededRNG {
  const numericSeed = typeof seed === 'string' ? hashSeed(seed) : seed;
  return new SeededRNG(numericSeed);
}
