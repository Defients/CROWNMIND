import type { EntityId } from './Entity';

export type ComponentType =
  | 'Position'
  | 'Health'
  | 'Combat'
  | 'HeroAI'
  | 'MonsterAI'
  | 'Building'
  | 'Lair'
  | 'ResourceProducer'
  | 'ResourceConsumer'
  | 'ResourceStorage'
  | 'SpellCaster'
  | 'BountyTarget'
  | 'FogRevealer'
  | 'Selectable'
  | 'SquadMember'
  | 'Faction'
  | 'TechResearcher'
  | 'Sprite'
  | 'Name'
  | 'Death'
  | 'Movement'
  | 'Diplomacy'
  | 'Quest'
  | 'Dungeon'
  | 'DungeonEntrance'
  | 'Expedition'
  | 'SkillTree'
  | 'Equipment'
  | 'Inventory'
  | 'RivalSovereign'
  | 'Scenario';

export interface Component {
  readonly type: ComponentType;
  entityId: EntityId;
}

export interface PositionComponent extends Component {
  type: 'Position';
  x: number;
  y: number;
}

export interface HealthComponent extends Component {
  type: 'Health';
  hp: number;
  maxHp: number;
}

export interface CombatComponent extends Component {
  type: 'Combat';
  attack: number;
  defense: number;
  speed: number;
  range: number;
}

export interface MovementComponent extends Component {
  type: 'Movement';
  targetX: number | null;
  targetY: number | null;
  path: { x: number; y: number }[] | null;
  baseSpeed: number;
}

export interface HeroAIComponent extends Component {
  type: 'HeroAI';
  heroClass: string;
  specialization: string | null;
  level: number;
  xp: number;
  xpNeeded: number;
  courage: number;
  greed: number;
  caution: number;
  loyalty: number;
  status: string;
  targetEntityId: EntityId | null;
  targetType: string | null;
  personalGold: number;
  inventoryTier: number;
  kynmarked: boolean;
  deathReason?: string;
}

export interface MonsterAIComponent extends Component {
  type: 'MonsterAI';
  monsterType: string;
  level: number;
  status: string;
  homeLairId: EntityId | null;
  targetEntityId: EntityId | null;
}

export interface BuildingComponent extends Component {
  type: 'Building';
  buildingType: string;
  isBuilt: boolean;
  cost: { gold: number; wood: number; stone: number };
}

export interface LairComponent extends Component {
  type: 'Lair';
  lairName: string;
  threatLevel: string;
  isDiscovered: boolean;
  isDestroyed: boolean;
  spawnCooldown: number;
  phase: string | null;
  discoveredDay: number | null;
}

export interface ResourceProducerComponent extends Component {
  type: 'ResourceProducer';
  resource: string;
  rate: number;
  requiresSeason: string | null;
  requiresTerrain: string | null;
}

export interface ResourceConsumerComponent extends Component {
  type: 'ResourceConsumer';
  resource: string;
  rate: number;
}

export interface ResourceStorageComponent extends Component {
  type: 'ResourceStorage';
  resource: string;
  amount: number;
  capacity: number;
}

export interface SpellCasterComponent extends Component {
  type: 'SpellCaster';
  spells: Record<string, { cost: number; cooldown: number; maxCooldown: number }>;
}

export interface BountyTargetComponent extends Component {
  type: 'BountyTarget';
  bountyType: string;
  targetEntityId: EntityId | null;
  targetX: number;
  targetY: number;
  rewardGold: number;
  bountyName: string;
  bountyStatus: string;
  placedBy: string;
}

export interface FogRevealerComponent extends Component {
  type: 'FogRevealer';
  viewRadius: number;
}

export interface SelectableComponent extends Component {
  type: 'Selectable';
  selectionType: string;
}

export interface SquadMemberComponent extends Component {
  type: 'SquadMember';
  squadId: EntityId | null;
  isLeader: boolean;
}

export interface FactionComponent extends Component {
  type: 'Faction';
  factionType: string;
  factionName: string;
  disposition: string;
  tradeResource: string | null;
  tradeAmount: number;
}

export interface TechResearcherComponent extends Component {
  type: 'TechResearcher';
  currentResearch: string | null;
  researchProgress: number;
  researchCost: number;
  unlockedTechs: string[];
}

export interface SpriteComponent extends Component {
  type: 'Sprite';
  spriteType: string;
  animationState: string;
  animationFrame: number;
  color: number;
  size: number;
}

export interface NameComponent extends Component {
  type: 'Name';
  name: string;
}

export interface DeathComponent extends Component {
  type: 'Death';
  reason: string;
  day: number;
}

export interface DiplomacyComponent extends Component {
  type: 'Diplomacy';
  standing: number;
  atWar: boolean;
  treatyType: string | null;
  treatyDuration: number;
  lastInteractionDay: number;
}

export interface QuestComponent extends Component {
  type: 'Quest';
  factionId: EntityId;
  questType: string;
  description: string;
  objective: string;
  rewardGold: number;
  rewardMana: number;
  rewardStanding: number;
  status: string;
  dayIssued: number;
  dayExpires: number;
}

export interface DungeonComponent extends Component {
  type: 'Dungeon';
  dungeonId: string;
  level: number;
  status: string;
  currentRoomIndex: number;
  seed: number;
}

export interface DungeonEntranceComponent extends Component {
  type: 'DungeonEntrance';
  dungeonId: string;
  isRevealed: boolean;
}

export interface ExpeditionComponent extends Component {
  type: 'Expedition';
  dungeonId: string;
  heroIds: EntityId[];
  progress: number;
  isActive: boolean;
  startedDay: number;
}

export interface SkillTreeComponent extends Component {
  type: 'SkillTree';
  classId: string;
  allocatedNodes: string[];
  skillPoints: number;
  ultimateChoice: string | null;
  ultimateCooldown: number;
}

export interface EquipmentComponent extends Component {
  type: 'Equipment';
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

export interface InventoryComponent extends Component {
  type: 'Inventory';
  items: string[];
}

export interface RivalSovereignComponent extends Component {
  type: 'RivalSovereign';
  name: string;
  personality: string;
  resources: { gold: number; wood: number; stone: number; food: number; mana: number };
  heroCount: number;
  townHallEntityId: EntityId | null;
  isAlive: boolean;
}

export interface ScenarioComponent extends Component {
  type: 'Scenario';
  scenarioId: string;
  objectivesMet: string[];
  modifiers: string[];
}

export type AnyComponent =
  | PositionComponent
  | HealthComponent
  | CombatComponent
  | MovementComponent
  | HeroAIComponent
  | MonsterAIComponent
  | BuildingComponent
  | LairComponent
  | ResourceProducerComponent
  | ResourceConsumerComponent
  | ResourceStorageComponent
  | SpellCasterComponent
  | BountyTargetComponent
  | FogRevealerComponent
  | SelectableComponent
  | SquadMemberComponent
  | FactionComponent
  | TechResearcherComponent
  | SpriteComponent
  | NameComponent
  | DeathComponent
  | DiplomacyComponent
  | QuestComponent
  | DungeonComponent
  | DungeonEntranceComponent
  | ExpeditionComponent
  | SkillTreeComponent
  | EquipmentComponent
  | InventoryComponent
  | RivalSovereignComponent
  | ScenarioComponent;
