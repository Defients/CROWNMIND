import { describe, it, expect } from 'vitest';
import { generateHeroName, generateMonsterName } from './nameGenerator';
import { SeededRNG } from './rng';
import type { HeroClass } from '../types/heroes';

const ALL_CLASSES: HeroClass[] = [
  'Kiox-Bound Fighter',
  'Ymzo-Touched Scout',
  'Zeeya-Warded Acolyte',
  'Astryx Mage',
  'Kael Archer',
  'Vael Paladin',
  'Faeling Druid',
  'Dwarven Runesmith',
];

describe('generateHeroName', () => {
  it('returns a non-empty string for every hero class', () => {
    const rng = new SeededRNG(42);
    for (const cls of ALL_CLASSES) {
      const name = generateHeroName(cls, rng);
      expect(name.length).toBeGreaterThan(0);
      expect(name).toContain(' ');
    }
  });

  it('is deterministic for the same seed and class', () => {
    const a = new SeededRNG(99);
    const b = new SeededRNG(99);
    for (const cls of ALL_CLASSES) {
      expect(generateHeroName(cls, a)).toBe(generateHeroName(cls, b));
    }
  });

  it('uses class-appropriate surnames (not fighter fallback) for Faeling Druid', () => {
    const rng = new SeededRNG(7);
    const fighterSurnames = [
      'of the Kiox-Bound', 'the Iron-Handed', 'the Red-Scythe', 'of Pyahhold',
      'the Unbroken', 'the Boulder', 'the Scarred', 'of the Rift',
    ];
    for (let i = 0; i < 20; i++) {
      const name = generateHeroName('Faeling Druid', rng);
      const surname = name.split(' ').slice(1).join(' ');
      expect(fighterSurnames).not.toContain(surname);
    }
  });

  it('uses class-appropriate surnames (not fighter fallback) for Dwarven Runesmith', () => {
    const rng = new SeededRNG(7);
    const fighterSurnames = [
      'of the Kiox-Bound', 'the Iron-Handed', 'the Red-Scythe', 'of Pyahhold',
      'the Unbroken', 'the Boulder', 'the Scarred', 'of the Rift',
    ];
    for (let i = 0; i < 20; i++) {
      const name = generateHeroName('Dwarven Runesmith', rng);
      const surname = name.split(' ').slice(1).join(' ');
      expect(fighterSurnames).not.toContain(surname);
    }
  });
});

describe('generateMonsterName', () => {
  it('produces a name with the monster type prefix', () => {
    const rng = new SeededRNG(1);
    const name = generateMonsterName('Goblin Scout', rng);
    expect(name).toContain('-');
    expect(name).toContain('Goblin');
  });
});
