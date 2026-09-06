import type { Biome } from './world';
import type { MapSize } from './game';
import type { ResourceState } from './resources';
import type { GameState } from './game';

export type ExtendedGameMode = 'observer' | 'coSovereign' | 'sandbox' | 'endless' | 'dailyChallenge' | 'rivalSovereigns' | 'campaign';

export type ScenarioObjectiveType =
  | 'destroySpire' | 'clearDungeons' | 'surviveDays'
  | 'eliminateRivals' | 'reachPopulation' | 'allyWithFaction';

export interface ScenarioObjective {
  id: string;
  type: ScenarioObjectiveType;
  target: number;
  description: string;
}

export type RivalPersonality = 'aggressive' | 'defensive' | 'economic' | 'balanced';

export interface RivalConfig {
  name: string;
  personality: RivalPersonality;
  startResources: Partial<ResourceState>;
  startHeroes: number;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'standard' | 'hard' | 'brutal';
  mapSize: MapSize;
  biome: Biome;
  timeLimit: number | null;
  startingConditions: Partial<GameState>;
  objectives: ScenarioObjective[];
  modifiers: string[];
  rivals: RivalConfig[];
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'fallen_crown',
    name: 'The Fallen Crown',
    description: 'Start with no buildings, limited gold, 80-day limit. Rebuild from nothing.',
    difficulty: 'hard',
    mapSize: 'standard',
    biome: 'temperate',
    timeLimit: 80,
    startingConditions: {},
    objectives: [
      { id: 'obj_destroy_spire', type: 'destroySpire', target: 1, description: 'Destroy the Veylthyr Spire' },
    ],
    modifiers: ['limited_gold'],
    rivals: [],
  },
  {
    id: 'two_thrones',
    name: 'Two Thrones',
    description: 'A rival sovereign is present. Diplomatic victory is possible.',
    difficulty: 'standard',
    mapSize: 'large',
    biome: 'temperate',
    timeLimit: 100,
    startingConditions: {},
    objectives: [
      { id: 'obj_destroy_spire', type: 'destroySpire', target: 1, description: 'Destroy the Veylthyr Spire or ally with the rival' },
      { id: 'obj_ally_rival', type: 'allyWithFaction', target: 1, description: 'Form alliance with the rival sovereign' },
    ],
    modifiers: ['rival_sovereign'],
    rivals: [
      { name: 'Kingdom of Veylmar', personality: 'balanced', startResources: { gold: 400, wood: 60, stone: 50, food: 60, mana: 20 }, startHeroes: 2 },
    ],
  },
  {
    id: 'the_deep',
    name: 'The Deep',
    description: '3 dungeons must be cleared to unlock the Spire.',
    difficulty: 'hard',
    mapSize: 'standard',
    biome: 'arid',
    timeLimit: 120,
    startingConditions: {},
    objectives: [
      { id: 'obj_clear_dungeons', type: 'clearDungeons', target: 3, description: 'Clear 3 dungeons to unlock the Spire' },
      { id: 'obj_destroy_spire', type: 'destroySpire', target: 1, description: 'Destroy the Veylthyr Spire' },
    ],
    modifiers: ['dungeon_gated_spire'],
    rivals: [],
  },
  {
    id: 'eternal_winter',
    name: 'Eternal Winter',
    description: 'Permanent winter, reduced food, stronger monsters. Survive and conquer.',
    difficulty: 'brutal',
    mapSize: 'standard',
    biome: 'tundra',
    timeLimit: 100,
    startingConditions: {},
    objectives: [
      { id: 'obj_destroy_spire', type: 'destroySpire', target: 1, description: 'Destroy the Veylthyr Spire' },
    ],
    modifiers: ['eternal_winter', 'stronger_monsters'],
    rivals: [],
  },
  {
    id: 'last_stand',
    name: 'Last Stand',
    description: 'Town Hall at 50% HP, no construction allowed. Survive 20 days.',
    difficulty: 'brutal',
    mapSize: 'small',
    biome: 'temperate',
    timeLimit: 20,
    startingConditions: {},
    objectives: [
      { id: 'obj_survive', type: 'surviveDays', target: 20, description: 'Survive for 20 days' },
    ],
    modifiers: ['no_construction', 'damaged_townhall'],
    rivals: [],
  },
];

export interface SovereignPersonality {
  aggression: number;
  diplomacy: number;
  economy: number;
  risk: number;
  adaptability: number;
}

export const RIVAL_PERSONALITIES: Record<RivalPersonality, SovereignPersonality> = {
  aggressive: { aggression: 0.8, diplomacy: 0.2, economy: 0.4, risk: 0.7, adaptability: 0.5 },
  defensive: { aggression: 0.3, diplomacy: 0.5, economy: 0.6, risk: 0.3, adaptability: 0.5 },
  economic: { aggression: 0.2, diplomacy: 0.6, economy: 0.9, risk: 0.2, adaptability: 0.6 },
  balanced: { aggression: 0.5, diplomacy: 0.5, economy: 0.5, risk: 0.5, adaptability: 0.6 },
};
