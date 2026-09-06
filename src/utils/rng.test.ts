import { describe, it, expect } from 'vitest';
import { SeededRNG, hashSeed, createRNG } from './rng';

describe('hashSeed (cyrb128)', () => {
  it('produces a deterministic numeric seed from a string', () => {
    const s1 = hashSeed('test-seed');
    const s2 = hashSeed('test-seed');
    expect(s1).toBe(s2);
  });

  it('produces different seeds for different strings', () => {
    expect(hashSeed('alpha')).not.toBe(hashSeed('beta'));
  });
});

describe('SeededRNG (Mulberry32)', () => {
  it('is deterministic — same seed produces same sequence', () => {
    const a = new SeededRNG(12345);
    const b = new SeededRNG(12345);
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('next() returns floats in [0, 1)', () => {
    const rng = new SeededRNG(999);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int(min, max) returns integers in [min, max]', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 500; i++) {
      const v = rng.int(3, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('float(min, max) returns floats in [min, max)', () => {
    const rng = new SeededRNG(7);
    for (let i = 0; i < 500; i++) {
      const v = rng.float(2, 5);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThan(5);
    }
  });

  it('chance(p) returns true with approximately probability p', () => {
    const rng = new SeededRNG(100);
    let hits = 0;
    const trials = 10000;
    for (let i = 0; i < trials; i++) {
      if (rng.chance(0.3)) hits++;
    }
    const ratio = hits / trials;
    expect(ratio).toBeGreaterThan(0.27);
    expect(ratio).toBeLessThan(0.33);
  });

  it('pick(array) returns an element from the array', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const rng = new SeededRNG(55);
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it('shuffle(array) preserves elements and changes order', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const rng = new SeededRNG(777);
    const shuffled = rng.shuffle([...original]);
    expect(shuffled.slice().sort()).toEqual(original.slice().sort());
    expect(shuffled).not.toEqual(original);
  });
});

describe('createRNG', () => {
  it('creates an RNG from a string seed', () => {
    const a = createRNG('hello');
    const b = createRNG('hello');
    expect(a.next()).toBe(b.next());
  });
});
