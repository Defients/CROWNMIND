import type { ResourceState, ResourceCapacity, ResourceType } from './resources';
import type { HeroClass, HeroSpecialization } from './heroes';
import type { TechBranch, TechEra } from './tech';
import type { Season, Weather, Biome, TerrainType, Cell, GameEvent, ActiveEvent, WeatherState, SeasonState, FactionType } from './world';
import type { EntityId } from '../engine/Entity';
import type { SerializedWorld } from '../engine/ECSWorld';

export type GameMode = 'observer' | 'coSovereign' | 'sandbox' | 'endless' | 'dailyChallenge' | 'rivalSovereigns' | 'campaign';
export type Difficulty = 'easy' | 'standard' | 'hard' | 'brutal';
export type GameStatus = 'setup' | 'tutorial' | 'playing' | 'paused' | 'won' | 'lost';
export type MapSize = 'small' | 'standard' | 'large';

export interface GameConfig {
  seed: number;
  seedString: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  biome: Biome;
  mapSize: MapSize;
  timeLimit: number;
  scenarioId?: string | null;
}

export interface DifficultyModifiers {
  startingGold: number;
  dailyIncomeBonus: number;
  raidChanceMultiplier: number;
  monsterDamageMultiplier: number;
  heroCourageBonus: number;
  bountyCostMultiplier: number;
  lairSpawnRateMultiplier: number;
  startingWood: number;
  startingStone: number;
  startingFood: number;
  startingMana: number;
}

export interface SovereignPhase {
  phase: string;
  label: string;
}

export type SovereignPhaseType =
  | 'opening' | 'scouting' | 'stabilizing' | 'expanding'
  | 'fortifying' | 'hunting' | 'spirePreparation' | 'finalAssault' | 'emergency';

export interface SovereignDecision {
  day: number;
  tick: number;
  phase: string;
  actionType: string;
  actionLabel: string;
  reason: string;
  expectedBenefit: string;
  risk?: string;
  goldBefore: number;
  goldAfter?: number;
  confidence: number;
}

export interface SovereignMemory {
  id: string;
  day: number;
  type: 'success' | 'regret' | 'threat' | 'milestone' | 'loss' | 'intervention';
  title: string;
  description: string;
  importance: number;
}

export interface SovereignMind {
  phase: SovereignPhaseType;
  currentPlan: string;
  nextAction: string;
  reason: string;
  confidence: number;
  fearLevel: number;
  economyPriority: number;
  militaryReadiness: number;
  finalLairReadiness: number;
  lastMistake: string;
  lastSuccess: string;
  botThoughts: string[];
  savingFor: string;
  savingTarget: number;
  emergencyReserve: number;
  spireReadinessText: string;
  regret: string;
  recentDecisions: SovereignDecision[];
  strategicMemory: SovereignMemory[];
}

export interface Squad {
  id: EntityId;
  memberIds: EntityId[];
  leaderId: EntityId;
  name: string;
  bonusMultiplier: number;
}

export interface Milestone {
  id: string;
  day: number;
  type: string;
  text: string;
}

export interface GameLog {
  id: string;
  day: number;
  text: string;
  type: 'general' | 'combat' | 'sovereign' | 'bounty' | 'event' | 'death' | 'building' | 'intervention' | 'milestone' | 'raid' | 'research' | 'season' | 'weather' | 'faction' | 'economy' | 'dungeon' | 'diplomacy' | 'rival';
}

export interface RaidWarning {
  active: boolean;
  sourceLairId: EntityId;
  sourceLairName: string;
  monsterCount: number;
  day: number;
  daysUntilRaid?: number;
}

export interface CameraCaption {
  text: string;
  expires: number;
}

export interface WinReport {
  dayWon: number;
  heroesLostCount: number;
  highestHeroLevel: string;
  goldSpent: number;
  bountiesPlacedCount: number;
  finalStrategy: string;
  bestDecision: string;
  worstDecision: string;
  omenSummary: string;
  mode: GameMode;
  difficulty: Difficulty;
  biome: Biome;
  playerInterventions: number;
  sovereignStrategySummary: string;
  majorDecisions: string[];
  heroesOfTheRun: string[];
  lairsCleared: string[];
  buildingsBuilt: string[];
  upgradesPurchased: string[];
  turningPoint: string;
  finalSovereignThought: string;
}

export interface LossReport {
  dayLost: number;
  causeOfCollapse: string;
  spireHpRemaining: number;
  spireMaxHp: number;
  biggestStrategicFailure: string;
  strongestSurvivingMonster: string;
  finalBotThought: string;
  omenSummary: string;
  mode: GameMode;
  difficulty: Difficulty;
  biome: Biome;
  playerInterventions: number;
  sovereignStrategySummary: string;
  majorDecisions: string[];
  heroesOfTheRun: string[];
  lairsCleared: string[];
  buildingsBuilt: string[];
  upgradesPurchased: string[];
  turningPoint: string;
}

export interface GameStats {
  heroesLostCount: number;
  heroesHiredCount: number;
  goldSpent: number;
  goldEarned: number;
  bountiesPlacedCount: number;
  monstersKilledCount: number;
  lairsCleared: string[];
  buildingsBuilt: string[];
  upgradesPurchased: string[];
  spellsCastCount: number;
  highestHeroLevel: { name: string; level: number };
}

export interface ActiveEffect {
  id: string;
  type: 'combat' | 'build' | 'trail' | 'death' | 'spawn' | 'selection';
  x: number;
  y: number;
  value?: number;
  ttl: number;
  maxTtl: number;
  color?: number;
}

export interface GameState {
  config: GameConfig;
  day: number;
  timeOfDay: number;
  resources: ResourceState;
  resourceCapacity: ResourceCapacity;
  realmStability: number;
  threatPressure: number;
  grid: Cell[][];
  mapSize: number;
  sovereignMind: SovereignMind;
  squads: Squad[];
  logs: GameLog[];
  milestones: Milestone[];
  activeEvent: ActiveEvent | null;
  season: SeasonState;
  weather: WeatherState;
  unlockedTechs: string[];
  currentResearch: string | null;
  researchProgress: number;
  researchCost: { gold: number; mana: number };
  gameSpeed: number;
  gameStatus: GameStatus;
  winReport: WinReport | null;
  lossReport: LossReport | null;
  sovereignFavor: number;
  maxFavor: number;
  playerInterventions: number;
  raidWarning: RaidWarning | null;
  cameraCaption: CameraCaption | null;
  spellCooldowns: { rallySpark: number; zeeyaMend: number; astryxFlare: number; diplomaticEnvoy: number; dungeonReveal: number; massRally: number };
  stats: GameStats;
  world: SerializedWorld;
  townHallEntityId: EntityId | null;
  spireEntityId: EntityId | null;
  activeEffects: ActiveEffect[];
  treaties: import('./diplomacy').Treaty[];
  quests: import('./diplomacy').Quest[];
  factionStandings: Record<number, number>;
  dungeons: import('./dungeons').Dungeon[];
  expeditions: import('./dungeons').Expedition[];
  rivalKingdoms: import('./scenarios').RivalConfig[];
  scenarioObjectives: import('./scenarios').ScenarioObjective[];
  endlessScore: number;
}

export interface SaveData {
  version: number;
  timestamp: number;
  config: GameConfig;
  state: GameState;
  name: string;
}

export interface ReplayData {
  version: number;
  config: GameConfig;
  seed: number;
  inputLog: ReplayInput[];
}

export interface ReplayInput {
  tick: number;
  type: string;
  data: any;
}

export const MAP_SIZES: Record<MapSize, number> = {
  small: 48,
  standard: 64,
  large: 96,
};

export const MAP_SIZE_LABELS: Record<MapSize, string> = {
  small: 'Small (48x48)',
  standard: 'Standard (64x64)',
  large: 'Large (96x96)',
};

export const DEFAULT_TIME_LIMIT = 60;

export const DIFFICULTY_MODIFIERS: Record<Difficulty, DifficultyModifiers> = {
  easy: {
    startingGold: 500, dailyIncomeBonus: 10, raidChanceMultiplier: 0.7,
    monsterDamageMultiplier: 0.8, heroCourageBonus: 20, bountyCostMultiplier: 1.0,
    lairSpawnRateMultiplier: 0.8, startingWood: 100, startingStone: 80, startingFood: 100, startingMana: 30,
  },
  standard: {
    startingGold: 400, dailyIncomeBonus: 0, raidChanceMultiplier: 1.0,
    monsterDamageMultiplier: 1.0, heroCourageBonus: 0, bountyCostMultiplier: 1.0,
    lairSpawnRateMultiplier: 1.0, startingWood: 60, startingStone: 50, startingFood: 60, startingMana: 20,
  },
  hard: {
    startingGold: 350, dailyIncomeBonus: -5, raidChanceMultiplier: 1.3,
    monsterDamageMultiplier: 1.2, heroCourageBonus: -10, bountyCostMultiplier: 1.5,
    lairSpawnRateMultiplier: 1.3, startingWood: 30, startingStone: 25, startingFood: 30, startingMana: 10,
  },
  brutal: {
    startingGold: 300, dailyIncomeBonus: -10, raidChanceMultiplier: 1.6,
    monsterDamageMultiplier: 1.5, heroCourageBonus: -20, bountyCostMultiplier: 2.0,
    lairSpawnRateMultiplier: 1.6, startingWood: 20, startingStone: 15, startingFood: 20, startingMana: 5,
  },
};
