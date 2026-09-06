export type HeroClass =
  | 'Kiox-Bound Fighter'
  | 'Ymzo-Touched Scout'
  | 'Zeeya-Warded Acolyte'
  | 'Astryx Mage'
  | 'Kael Archer'
  | 'Vael Paladin'
  | 'Faeling Druid'
  | 'Dwarven Runesmith';

export type HeroSpecialization =
  | 'Berserker' | 'Guardian'
  | 'Ranger' | 'Assassin'
  | 'Priest' | 'Druid'
  | 'Pyromancer' | 'Cryomancer'
  | 'Sniper' | 'VolleyArcher'
  | 'Templar' | 'Avenger'
  | 'Warden' | 'Stormcaller'
  | 'Runesmith' | 'Battlehammer'
  | null;

export type HeroStatus =
  | 'Searching' | 'Patrolling' | 'Fighting' | 'Fleeing'
  | 'Resting' | 'Exploring' | 'Supporting' | 'ChasingBounty'
  | 'DefendingTown' | 'SquadMarching' | 'Upgrading';

export interface HeroClassStats {
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseCourage: number;
  baseGreed: number;
  baseCaution: number;
  range: number;
  viewRadius: number;
  hireCost: { gold: number; wood?: number; stone?: number; food?: number; mana?: number };
  description: string;
}

export const HERO_CLASSES: Record<HeroClass, HeroClassStats> = {
  'Kiox-Bound Fighter': {
    baseHp: 150, baseAttack: 22, baseDefense: 10, baseSpeed: 1.0,
    baseCourage: 60, baseGreed: 50, baseCaution: 30,
    range: 1.8, viewRadius: 4,
    hireCost: { gold: 90, food: 10 },
    description: 'Melee tank. High attack and defense, engages monsters directly.',
  },
  'Ymzo-Touched Scout': {
    baseHp: 120, baseAttack: 16, baseDefense: 6, baseSpeed: 1.5,
    baseCourage: 45, baseGreed: 70, baseCaution: 55,
    range: 4, viewRadius: 7,
    hireCost: { gold: 80, food: 8 },
    description: 'Explorer. Reveals fog of war, discovers lairs, ranged attacks.',
  },
  'Zeeya-Warded Acolyte': {
    baseHp: 110, baseAttack: 8, baseDefense: 8, baseSpeed: 1.1,
    baseCourage: 30, baseGreed: 25, baseCaution: 65,
    range: 2.2, viewRadius: 4,
    hireCost: { gold: 100, mana: 15 },
    description: 'Healer. Follows and mends injured allies.',
  },
  'Astryx Mage': {
    baseHp: 100, baseAttack: 30, baseDefense: 5, baseSpeed: 1.0,
    baseCourage: 40, baseGreed: 60, baseCaution: 50,
    range: 5, viewRadius: 5,
    hireCost: { gold: 120, mana: 20 },
    description: 'Ranged spellcaster. High damage, low survivability.',
  },
  'Kael Archer': {
    baseHp: 120, baseAttack: 24, baseDefense: 7, baseSpeed: 1.2,
    baseCourage: 50, baseGreed: 55, baseCaution: 45,
    range: 5, viewRadius: 5,
    hireCost: { gold: 100, wood: 15 },
    description: 'Ranged DPS. Long-range physical attacks, versatile.',
  },
  'Vael Paladin': {
    baseHp: 160, baseAttack: 18, baseDefense: 12, baseSpeed: 0.9,
    baseCourage: 65, baseGreed: 30, baseCaution: 35,
    range: 1.8, viewRadius: 4,
    hireCost: { gold: 130, mana: 10, food: 10 },
    description: 'Hybrid tank-healer. High HP, minor heal ability.',
  },
  'Faeling Druid': {
    baseHp: 105, baseAttack: 20, baseDefense: 7, baseSpeed: 1.1,
    baseCourage: 45, baseGreed: 40, baseCaution: 55,
    range: 4, viewRadius: 5,
    hireCost: { gold: 110, mana: 15, food: 5 },
    description: 'Nature caster. AoE buffs, terrain manipulation, healing.',
  },
  'Dwarven Runesmith': {
    baseHp: 170, baseAttack: 20, baseDefense: 14, baseSpeed: 0.8,
    baseCourage: 60, baseGreed: 45, baseCaution: 40,
    range: 2, viewRadius: 4,
    hireCost: { gold: 120, stone: 15, food: 8 },
    description: 'Tank/DPS hybrid. Rune-based abilities, durable frontline.',
  },
};

export const SPECIALIZATIONS: Record<HeroClass, { a: HeroSpecialization; b: HeroSpecialization }> = {
  'Kiox-Bound Fighter': { a: 'Berserker', b: 'Guardian' },
  'Ymzo-Touched Scout': { a: 'Ranger', b: 'Assassin' },
  'Zeeya-Warded Acolyte': { a: 'Priest', b: 'Druid' },
  'Astryx Mage': { a: 'Pyromancer', b: 'Cryomancer' },
  'Kael Archer': { a: 'Sniper', b: 'VolleyArcher' },
  'Vael Paladin': { a: 'Templar', b: 'Avenger' },
  'Faeling Druid': { a: 'Warden', b: 'Stormcaller' },
  'Dwarven Runesmith': { a: 'Runesmith', b: 'Battlehammer' },
};

export interface SpecializationStats {
  description: string;
  attackMultiplier: number;
  defenseMultiplier: number;
  hpMultiplier: number;
  speedMultiplier: number;
  rangeBonus: number;
  specialAbility: string;
}

export const SPECIALIZATION_STATS: Record<Exclude<HeroSpecialization, null>, SpecializationStats> = {
  Berserker: {
    description: 'Rage-fueled warrior. Double attack when below 50% HP.',
    attackMultiplier: 1.3, defenseMultiplier: 0.9, hpMultiplier: 1.1, speedMultiplier: 1.1, rangeBonus: 0,
    specialAbility: 'Rage: ATK x2 when HP < 50%',
  },
  Guardian: {
    description: 'Protective shield-bearer. Taunts enemies, reduces ally damage taken.',
    attackMultiplier: 0.9, defenseMultiplier: 1.4, hpMultiplier: 1.3, speedMultiplier: 0.9, rangeBonus: 0,
    specialAbility: 'Taunt: Forces nearby monsters to target this hero',
  },
  Ranger: {
    description: 'Extended vision and trap-laying scout.',
    attackMultiplier: 1.1, defenseMultiplier: 1.0, hpMultiplier: 1.0, speedMultiplier: 1.2, rangeBonus: 2,
    specialAbility: 'Traps: Damages monsters that walk near',
  },
  Assassin: {
    description: 'Stealthy backstabber. Bonus damage from behind.',
    attackMultiplier: 1.5, defenseMultiplier: 0.8, hpMultiplier: 0.9, speedMultiplier: 1.4, rangeBonus: 1,
    specialAbility: 'Backstab: +50% damage to unaware monsters',
  },
  Priest: {
    description: 'AoE healer with cleansing power.',
    attackMultiplier: 1.0, defenseMultiplier: 1.1, hpMultiplier: 1.1, speedMultiplier: 1.0, rangeBonus: 1,
    specialAbility: 'AoE Heal: Heals all allies within 3 tiles',
  },
  Druid: {
    description: 'Nature-based regen and control.',
    attackMultiplier: 1.1, defenseMultiplier: 1.2, hpMultiplier: 1.2, speedMultiplier: 1.0, rangeBonus: 0,
    specialAbility: 'Regen Aura: Allies regenerate HP passively',
  },
  Pyromancer: {
    description: 'Fire AoE specialist.',
    attackMultiplier: 1.4, defenseMultiplier: 0.9, hpMultiplier: 0.9, speedMultiplier: 1.0, rangeBonus: 1,
    specialAbility: 'Fireball: AoE damage to all monsters within 2 tiles of target',
  },
  Cryomancer: {
    description: 'Ice controller, slows enemies.',
    attackMultiplier: 1.2, defenseMultiplier: 1.0, hpMultiplier: 1.0, speedMultiplier: 1.0, rangeBonus: 1,
    specialAbility: 'Freeze: Slows target monster by 50% for 3 ticks',
  },
  Sniper: {
    description: 'Extreme range, high crit chance.',
    attackMultiplier: 1.3, defenseMultiplier: 0.9, hpMultiplier: 0.9, speedMultiplier: 1.1, rangeBonus: 4,
    specialAbility: 'Critical: 25% chance for double damage',
  },
  VolleyArcher: {
    description: 'Multi-target ranged attacker.',
    attackMultiplier: 1.1, defenseMultiplier: 1.0, hpMultiplier: 1.0, speedMultiplier: 1.1, rangeBonus: 1,
    specialAbility: 'Volley: Attacks up to 3 adjacent monsters',
  },
  Templar: {
    description: 'Aura-buffer, strengthens nearby allies.',
    attackMultiplier: 1.1, defenseMultiplier: 1.3, hpMultiplier: 1.2, speedMultiplier: 0.9, rangeBonus: 0,
    specialAbility: 'Aura: +10% ATK and DEF to squad members within 5 tiles',
  },
  Avenger: {
    description: 'Retaliation damage specialist.',
    attackMultiplier: 1.2, defenseMultiplier: 1.2, hpMultiplier: 1.1, speedMultiplier: 1.0, rangeBonus: 0,
    specialAbility: 'Retaliate: Reflects 30% of damage taken back to attacker',
  },
  Warden: {
    description: 'Nature guardian. Strong buffs and terrain control.',
    attackMultiplier: 1.1, defenseMultiplier: 1.3, hpMultiplier: 1.2, speedMultiplier: 1.0, rangeBonus: 1,
    specialAbility: 'Briar Shield: Allies gain +30% DEF for 5 ticks',
  },
  Stormcaller: {
    description: 'Weather manipulator. Lightning AoE strikes.',
    attackMultiplier: 1.4, defenseMultiplier: 0.9, hpMultiplier: 1.0, speedMultiplier: 1.1, rangeBonus: 2,
    specialAbility: 'Storm Call: Lightning hits all monsters in 4 tiles',
  },
  Runesmith: {
    description: 'Rune forger. Defensive runes and weapon enhancements.',
    attackMultiplier: 1.1, defenseMultiplier: 1.4, hpMultiplier: 1.3, speedMultiplier: 0.9, rangeBonus: 0,
    specialAbility: 'Rune Ward: Absorbs next incoming hit',
  },
  Battlehammer: {
    description: 'Berserk hammerer. Devastating melee AoE.',
    attackMultiplier: 1.5, defenseMultiplier: 1.0, hpMultiplier: 1.1, speedMultiplier: 1.0, rangeBonus: 1,
    specialAbility: 'Hammer Slam: AoE damage to all adjacent enemies',
  },
};

export const HERO_CLASS_LIST = Object.keys(HERO_CLASSES) as HeroClass[];
