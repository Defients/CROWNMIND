export type LairType = 'Gnarlroot Den' | 'Hollow Fang Nest' | 'Dalyze Pit' | 'Dragon Roost' | 'Crypt of the Fallen' | 'Goblin Warren' | 'The Veylthyr Spire';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'clear' | 'rain' | 'storm' | 'fog' | 'snow';
export type Biome = 'temperate' | 'arid' | 'tundra';
export type FactionType = 'village' | 'banditCamp' | 'ancientRuin' | 'wanderingTrader' | 'mercenaryCamp' | 'embassy' | 'dragonLair';
export type FactionDisposition = 'friendly' | 'neutral' | 'hostile';

export type TerrainType = 'grass' | 'forest' | 'stone' | 'corruption' | 'desert' | 'snow' | 'water' | 'fertile';

export interface Cell {
  x: number;
  y: number;
  terrain: TerrainType;
  isExplored: boolean;
  hasRoad: boolean;
  hasBuilding: boolean;
  resourceDeposit: ResourceType | null;
}

export interface SeasonInfo {
  name: Season;
  label: string;
  description: string;
  foodModifier: number;
  movementModifier: number;
  monsterAggressionModifier: number;
  goldBountyModifier: number;
}

export const SEASONS: Record<Season, SeasonInfo> = {
  spring: { name: 'spring', label: 'Spring', description: '+50% food production. Hidden areas revealed by blooming flora.', foodModifier: 1.5, movementModifier: 1.0, monsterAggressionModifier: 1.0, goldBountyModifier: 1.0 },
  summer: { name: 'summer', label: 'Summer', description: '+20% movement speed. Monsters more aggressive.', foodModifier: 1.0, movementModifier: 1.2, monsterAggressionModifier: 1.3, goldBountyModifier: 1.0 },
  autumn: { name: 'autumn', label: 'Autumn', description: '+30% gold from bounties. Resource deposits yield bonus.', foodModifier: 1.0, movementModifier: 1.0, monsterAggressionModifier: 1.0, goldBountyModifier: 1.3 },
  winter: { name: 'winter', label: 'Winter', description: '-50% food, -30% movement. Monsters stronger, raids more frequent.', foodModifier: 0.5, movementModifier: 0.7, monsterAggressionModifier: 1.5, goldBountyModifier: 1.0 },
};

export const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];
export const SEASON_LENGTH = 15;

export interface WeatherInfo {
  name: Weather;
  label: string;
  movementModifier: number;
  spellDamageModifier: number;
  monsterSpawnModifier: number;
  visionModifier: number;
  foodBonusNextDay: number;
}

export const WEATHER_TYPES: Record<Weather, WeatherInfo> = {
  clear: { name: 'clear', label: 'Clear', movementModifier: 1.0, spellDamageModifier: 1.0, monsterSpawnModifier: 1.0, visionModifier: 1.0, foodBonusNextDay: 0 },
  rain: { name: 'rain', label: 'Rain', movementModifier: 0.8, spellDamageModifier: 1.0, monsterSpawnModifier: 1.0, visionModifier: 0.9, foodBonusNextDay: 10 },
  storm: { name: 'storm', label: 'Storm', movementModifier: 0.6, spellDamageModifier: 0.7, monsterSpawnModifier: 1.5, visionModifier: 0.7, foodBonusNextDay: 0 },
  fog: { name: 'fog', label: 'Fog', movementModifier: 1.0, spellDamageModifier: 1.0, monsterSpawnModifier: 1.0, visionModifier: 0.5, foodBonusNextDay: 0 },
  snow: { name: 'snow', label: 'Snow', movementModifier: 0.5, spellDamageModifier: 1.0, monsterSpawnModifier: 0.8, visionModifier: 0.6, foodBonusNextDay: 0 },
};

export interface BiomeInfo {
  name: Biome;
  label: string;
  description: string;
  terrainDistribution: Record<TerrainType, number>;
  baseColor: number;
  accentColor: number;
}

export const BIOMES: Record<Biome, BiomeInfo> = {
  temperate: {
    name: 'temperate', label: 'Temperate', description: 'Balanced forests and grasslands.',
    terrainDistribution: { grass: 0.6, forest: 0.25, stone: 0.1, fertile: 0.05, corruption: 0, desert: 0, snow: 0, water: 0 },
    baseColor: 0x1a1520, accentColor: 0x2a4a2a,
  },
  arid: {
    name: 'arid', label: 'Arid', description: 'Desert landscape with scarce resources.',
    terrainDistribution: { grass: 0.3, forest: 0.05, stone: 0.2, fertile: 0.05, corruption: 0, desert: 0.4, snow: 0, water: 0 },
    baseColor: 0x2a2010, accentColor: 0x4a3a20,
  },
  tundra: {
    name: 'tundra', label: 'Tundra', description: 'Frozen plains with harsh conditions.',
    terrainDistribution: { grass: 0.2, forest: 0.1, stone: 0.15, fertile: 0.05, corruption: 0, desert: 0, snow: 0.5, water: 0 },
    baseColor: 0x1a1a30, accentColor: 0x3a3a5a,
  },
};

export const BIOME_LIST = Object.keys(BIOMES) as Biome[];

export interface FactionInfo {
  type: FactionType;
  label: string;
  description: string;
  defaultDisposition: FactionDisposition;
}

export const FACTION_TYPES: Record<FactionType, FactionInfo> = {
  village: { type: 'village', label: 'Village', description: 'Peaceful settlement that produces food if allied.', defaultDisposition: 'friendly' },
  banditCamp: { type: 'banditCamp', label: 'Bandit Camp', description: 'Hostile raiders that attack like monsters.', defaultDisposition: 'hostile' },
  ancientRuin: { type: 'ancientRuin', label: 'Ancient Ruin', description: 'Neutral ruins containing valuable loot.', defaultDisposition: 'neutral' },
  wanderingTrader: { type: 'wanderingTrader', label: 'Wandering Trader', description: 'Roaming merchant selling resources for gold.', defaultDisposition: 'neutral' },
  mercenaryCamp: { type: 'mercenaryCamp', label: 'Mercenary Camp', description: 'Offers temporary heroes for hire.', defaultDisposition: 'neutral' },
  embassy: { type: 'embassy', label: 'Embassy', description: 'NPC kingdom. Full diplomacy available — rival or ally.', defaultDisposition: 'neutral' },
  dragonLair: { type: 'dragonLair', label: 'Dragon Lair', description: 'Neutral apex creature. Ally for devastating air support.', defaultDisposition: 'neutral' },
};

export type GameEvent = 'HybriX Surge' | 'Dalyze Bloom' | 'Astryx Rupture' | 'Golden Caravan' | 'Plague' | 'Harvest Festival' | 'Mana Storm' | 'Refugee Crisis' | 'Ancient Awakening' | 'Dragon Hoard' | 'Faction War' | 'Ancient Library' | 'Hero Funeral' | 'Coronation';

export interface ActiveEvent {
  type: GameEvent;
  duration: number;
  title: string;
  description: string;
}

export interface WeatherState {
  current: Weather;
  ticksRemaining: number;
}

export interface SeasonState {
  current: Season;
  dayInSeason: number;
}

import type { ResourceType } from './resources';
