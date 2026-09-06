import type { Cell, Biome, TerrainType } from '../types/world';
import type { GameConfig, GameState, DifficultyModifiers, SovereignMind } from '../types/game';
import type { ResourceState, ResourceCapacity } from '../types/resources';
import type { EntityId } from '../engine/Entity';
import { ECSWorld } from '../engine/ECSWorld';
import type { SerializedWorld } from '../engine/ECSWorld';
import { createRNG, SeededRNG } from './rng';
import { generateTerrain, setCorruption, revealArea } from './terrainGenerator';
import { getDistance } from './pathfinding';
import { generateHeroName, generateMonsterName, generateFactionName } from './nameGenerator';
import { BALANCE } from './balance';
import { MAP_SIZES, DIFFICULTY_MODIFIERS } from '../types/game';
import { HERO_CLASSES } from '../types/heroes';
import { emptyResourceCapacity } from '../types/resources';
import { SEASON_ORDER, SEASON_LENGTH, FACTION_TYPES } from '../types/world';
import type { FactionType } from '../types/world';

export function getTownHallPosition(mapSize: number): { x: number; y: number } {
  return { x: Math.floor(mapSize * 0.18), y: Math.floor(mapSize * 0.5) };
}

export function getSpirePosition(mapSize: number): { x: number; y: number } {
  return { x: Math.floor(mapSize * 0.82), y: Math.floor(mapSize * 0.5) };
}

export function initializeGame(config: GameConfig): GameState {
  const mapSize = MAP_SIZES[config.mapSize];
  const rng = createRNG(config.seedString);
  const diffMods = DIFFICULTY_MODIFIERS[config.difficulty];

  const grid = generateTerrain(mapSize, config.biome, rng);

  const townHallPos = getTownHallPosition(mapSize);
  const spirePos = getSpirePosition(mapSize);

  setCorruption(grid, mapSize, spirePos.x, spirePos.y, 6.5);
  revealArea(grid, mapSize, townHallPos.x, townHallPos.y, 9);

  const world = new ECSWorld();

  const townHallId = createBuildingEntity(world, 'TownHall', 'Pyahhold Town Hall', townHallPos.x, townHallPos.y, BALANCE.townHall.hp, true, grid, mapSize);
  const spireId = createLairEntity(world, 'The Veylthyr Spire', spirePos.x, spirePos.y, BALANCE.spire.hp, 'elite', BALANCE.spire.spawnCooldown, 'Dormant');

  const lairConfigs = [
    { name: 'Gnarlroot Den', threatLevel: 'low', hp: 400, cooldown: 12, offset: { x: 0.35, y: 0.3 } },
    { name: 'Hollow Fang Nest', threatLevel: 'medium', hp: 600, cooldown: 16, offset: { x: 0.55, y: 0.7 } },
    { name: 'Dalyze Pit', threatLevel: 'high', hp: 850, cooldown: 20, offset: { x: 0.7, y: 0.23 } },
  ];

  for (const lc of lairConfigs) {
    const lx = Math.floor(mapSize * lc.offset.x) + rng.int(-2, 2);
    const ly = Math.floor(mapSize * lc.offset.y) + rng.int(-2, 2);
    createLairEntity(world, lc.name, lx, ly, lc.hp, lc.threatLevel, lc.cooldown, null);
    if (lc.name === 'Dalyze Pit') {
      setCorruption(grid, mapSize, lx, ly, 4.5);
    }
  }

  createPredefinedBuildings(world, townHallPos, grid, mapSize);

  createHeroEntity(world, 'Kiox-Bound Fighter', 'Kaelen the First', townHallPos.x + 1, townHallPos.y + 1, rng, 10);
  createHeroEntity(world, 'Ymzo-Touched Scout', 'Vex the Pathfinder', townHallPos.x - 1, townHallPos.y + 1, rng, 10);

  placeNeutralFactions(world, grid, mapSize, config.biome, rng, townHallPos, spirePos);

  const startingRes = BALANCE.startingResources[config.difficulty];
  const resources: ResourceState = { ...startingRes };
  const resourceCapacity: ResourceCapacity = { ...emptyResourceCapacity(), ...BALANCE.storageCap.base };

  const sovereignMind: SovereignMind = {
    phase: 'opening',
    currentPlan: 'Establish Pyahhold foothold. Seek the location of minor threats.',
    nextAction: 'Waiting for treasury growth to fund a Warrior Guild.',
    reason: 'Fighters are essential for early defense and minor clearing tasks.',
    confidence: 60,
    fearLevel: 10,
    economyPriority: 40,
    militaryReadiness: 10,
    finalLairReadiness: 0,
    lastMistake: 'None compiled yet.',
    lastSuccess: 'Pyahhold safehouse initialized successfully.',
    botThoughts: ['The realm stands fragile.', 'I must protect the Town Hall above all things.'],
    savingFor: 'Warrior Guild',
    savingTarget: 120,
    emergencyReserve: 100,
    spireReadinessText: 'Spire not yet discovered. Focus on survival first.',
    regret: '',
    recentDecisions: [],
    strategicMemory: [],
  };

  const seasonIdx = 0;

  const state: GameState = {
    config,
    day: 1,
    timeOfDay: 0,
    resources,
    resourceCapacity,
    realmStability: 100,
    threatPressure: 5,
    grid,
    mapSize,
    sovereignMind,
    squads: [],
    logs: [
      { id: 'log_0', day: 1, text: 'Pyahhold safehouse initialized. The sovereign mind awakens.', type: 'general' },
      { id: 'log_1', day: 1, text: `A safezone has been mapped within 8 steps of the Town Hall. Biome: ${config.biome}.`, type: 'general' },
      { id: 'log_2', day: 1, text: 'Kaelen the First, a Kiox-Bound Fighter, has joined the realm.', type: 'sovereign' },
      { id: 'log_3', day: 1, text: 'Vex the Pathfinder, a Ymzo-Touched Scout, has joined the realm.', type: 'sovereign' },
      { id: 'log_4', day: 1, text: 'All predefined buildings are operational. The realm is ready for action.', type: 'building' },
    ],
    milestones: [],
    activeEvent: null,
    season: { current: SEASON_ORDER[seasonIdx], dayInSeason: 1 },
    weather: { current: 'clear', ticksRemaining: 5 },
    unlockedTechs: [],
    currentResearch: null,
    researchProgress: 0,
    researchCost: { gold: 0, mana: 0 },
    gameSpeed: 1,
    gameStatus: 'tutorial',
    winReport: null,
    lossReport: null,
    sovereignFavor: BALANCE.sovereignFavorStart,
    maxFavor: BALANCE.sovereignFavorMax,
    playerInterventions: 0,
    raidWarning: null,
    cameraCaption: null,
    spellCooldowns: { rallySpark: 0, zeeyaMend: 0, astryxFlare: 0, diplomaticEnvoy: 0, dungeonReveal: 0, massRally: 0 },
    stats: {
      heroesLostCount: 0,
      heroesHiredCount: 0,
      goldSpent: 0,
      goldEarned: 0,
      bountiesPlacedCount: 0,
      monstersKilledCount: 0,
      lairsCleared: [],
      buildingsBuilt: [],
      upgradesPurchased: [],
      spellsCastCount: 0,
      highestHeroLevel: { name: 'None', level: 0 },
    },
    world: world.serialize(),
    townHallEntityId: townHallId,
    spireEntityId: spireId,
    activeEffects: [],
    treaties: [],
    quests: [],
    factionStandings: {},
    dungeons: [],
    expeditions: [],
    rivalKingdoms: [],
    scenarioObjectives: [],
    endlessScore: 0,
  };

  return state;
}

function markBuildingFootprint(grid: Cell[][], mapSize: number, x: number, y: number): void {
  for (let dx = 0; dx < 2; dx++) {
    for (let dy = 0; dy < 2; dy++) {
      const bx = x + dx;
      const by = y + dy;
      if (bx >= 0 && bx < mapSize && by >= 0 && by < mapSize) {
        grid[bx][by].hasBuilding = true;
      }
    }
  }
}

function createBuildingEntity(
  world: ECSWorld,
  buildingType: string,
  name: string,
  x: number,
  y: number,
  hp: number,
  isBuilt: boolean,
  grid?: Cell[][],
  mapSize?: number
): EntityId {
  const id = world.createEntity();
  const cost = BALANCE.buildings[buildingType as keyof typeof BALANCE.buildings]?.cost ?? { gold: 0, wood: 0, stone: 0 };
  world.addComponent(id, { type: 'Position', entityId: id, x, y });
  world.addComponent(id, { type: 'Health', entityId: id, hp, maxHp: hp });
  world.addComponent(id, { type: 'Building', entityId: id, buildingType, isBuilt, cost });
  world.addComponent(id, { type: 'Name', entityId: id, name });
  world.addComponent(id, { type: 'Selectable', entityId: id, selectionType: 'building' });
  world.addComponent(id, { type: 'Sprite', entityId: id, spriteType: 'building', animationState: 'idle', animationFrame: 0, color: 0x9b5cff, size: 16 });
  if (grid && mapSize) {
    markBuildingFootprint(grid, mapSize, x, y);
  }
  return id;
}

function createLairEntity(
  world: ECSWorld,
  lairName: string,
  x: number,
  y: number,
  hp: number,
  threatLevel: string,
  spawnCooldown: number,
  phase: string | null
): EntityId {
  const id = world.createEntity();
  world.addComponent(id, { type: 'Position', entityId: id, x, y });
  world.addComponent(id, { type: 'Health', entityId: id, hp, maxHp: hp });
  world.addComponent(id, { type: 'Lair', entityId: id, lairName, threatLevel, isDiscovered: false, isDestroyed: false, spawnCooldown, phase, discoveredDay: null });
  world.addComponent(id, { type: 'Name', entityId: id, name: lairName });
  world.addComponent(id, { type: 'Selectable', entityId: id, selectionType: 'lair' });
  world.addComponent(id, { type: 'Sprite', entityId: id, spriteType: 'lair', animationState: 'idle', animationFrame: 0, color: 0xff4d6d, size: 20 });
  return id;
}

function createPredefinedBuildings(world: ECSWorld, townHallPos: { x: number; y: number }, grid: Cell[][], mapSize: number): void {
  const buildingDefs = [
    { type: 'WarriorGuild', name: 'Kiox-Bound Warrior Guild', dx: -3, dy: -1 },
    { type: 'RangerLodge', name: 'Ymzo Ranger Lodge', dx: 2, dy: -3 },
    { type: 'ZeeyaShrine', name: 'Zeeya Warded Shrine', dx: -1, dy: 3 },
    { type: 'Market', name: 'Pyahhold Grand Market', dx: 3, dy: 1 },
    { type: 'Blacksmith', name: 'Ember-Forge Blacksmith', dx: 3, dy: -1 },
    { type: 'GuardTower', name: 'Pyahhold Sentry Tower', dx: 4, dy: -4 },
  ];

  for (const bd of buildingDefs) {
    const bInfo = BALANCE.buildings[bd.type as keyof typeof BALANCE.buildings];
    if (!bInfo) continue;
    createBuildingEntity(world, bd.type, bd.name, townHallPos.x + bd.dx, townHallPos.y + bd.dy, bInfo.hp, true, grid, mapSize);
  }
}

function placeNeutralFactions(
  world: ECSWorld,
  grid: Cell[][],
  mapSize: number,
  biome: Biome,
  rng: SeededRNG,
  townHallPos: { x: number; y: number },
  spirePos: { x: number; y: number }
): void {
  const factionTypes: FactionType[] = ['village', 'banditCamp', 'ancientRuin', 'wanderingTrader', 'mercenaryCamp'];
  const factionCount = Math.floor(mapSize / 16);

  for (let i = 0; i < factionCount; i++) {
    const type = rng.pick(factionTypes);
    let x: number, y: number;
    let attempts = 0;
    do {
      x = rng.int(5, mapSize - 5);
      y = rng.int(5, mapSize - 5);
      attempts++;
    } while (
      attempts < 20 &&
      (getDistance(x, y, townHallPos.x, townHallPos.y) < 12 ||
       getDistance(x, y, spirePos.x, spirePos.y) < 8)
    );

    if (attempts >= 20) continue;

    const id = world.createEntity();
    const name = generateFactionName(type, rng);
    const fInfo = FACTION_TYPES[type];
    world.addComponent(id, { type: 'Position', entityId: id, x, y });
    world.addComponent(id, { type: 'Health', entityId: id, hp: 200, maxHp: 200 });
    world.addComponent(id, { type: 'Faction', entityId: id, factionType: type, factionName: name, disposition: fInfo.defaultDisposition, tradeResource: type === 'wanderingTrader' ? rng.pick(['wood', 'stone', 'food', 'mana']) : null, tradeAmount: 20 });
    world.addComponent(id, { type: 'Name', entityId: id, name });
    world.addComponent(id, { type: 'Selectable', entityId: id, selectionType: 'faction' });
    world.addComponent(id, { type: 'Sprite', entityId: id, spriteType: 'faction', animationState: 'idle', animationFrame: 0, color: 0x26f4ff, size: 14 });
  }
}

export function createHeroEntity(
  world: ECSWorld,
  heroClass: string,
  name: string,
  x: number,
  y: number,
  rng: SeededRNG,
  courageBonus: number = 0
): EntityId {
  const classStats = HERO_CLASSES[heroClass as keyof typeof HERO_CLASSES];
  if (!classStats) return -1;

  let hp = classStats.baseHp;
  let atk = classStats.baseAttack;
  let courage = classStats.baseCourage + courageBonus;

  const kynmarked = rng.chance(BALANCE.kynmarkedChance);
  if (kynmarked) {
    hp = Math.floor(hp * BALANCE.kynmarkedHpMultiplier);
    atk = Math.floor(atk * BALANCE.kynmarkedAtkMultiplier);
    courage = Math.min(100, courage + BALANCE.kynmarkedCourageBonus);
  }

  const id = world.createEntity();
  world.addComponent(id, { type: 'Position', entityId: id, x, y });
  world.addComponent(id, { type: 'Health', entityId: id, hp, maxHp: hp });
  world.addComponent(id, { type: 'Combat', entityId: id, attack: atk, defense: classStats.baseDefense, speed: classStats.baseSpeed, range: classStats.range });
  world.addComponent(id, { type: 'Movement', entityId: id, targetX: null, targetY: null, path: null, baseSpeed: classStats.baseSpeed });
  world.addComponent(id, {
    type: 'HeroAI', entityId: id,
    heroClass, specialization: null,
    level: 1, xp: 0, xpNeeded: 120,
    courage, greed: classStats.baseGreed, caution: classStats.baseCaution, loyalty: 50,
    status: 'Searching', targetEntityId: null, targetType: null,
    personalGold: 15, inventoryTier: 1, kynmarked,
  });
  world.addComponent(id, { type: 'FogRevealer', entityId: id, viewRadius: classStats.viewRadius });
  world.addComponent(id, { type: 'Name', entityId: id, name });
  world.addComponent(id, { type: 'Selectable', entityId: id, selectionType: 'hero' });
  world.addComponent(id, { type: 'SquadMember', entityId: id, squadId: null, isLeader: false });
  world.addComponent(id, { type: 'Sprite', entityId: id, spriteType: 'hero', animationState: 'idle', animationFrame: 0, color: 0x38e68b, size: 12 });

  return id;
}

export function createMonsterEntity(
  world: ECSWorld,
  monsterType: string,
  name: string,
  x: number,
  y: number,
  hp: number,
  attack: number,
  defense: number,
  level: number,
  homeLairId: EntityId,
  status: string
): EntityId {
  const id = world.createEntity();
  world.addComponent(id, { type: 'Position', entityId: id, x, y });
  world.addComponent(id, { type: 'Health', entityId: id, hp, maxHp: hp });
  world.addComponent(id, { type: 'Combat', entityId: id, attack, defense, speed: 1.2, range: 1.8 });
  world.addComponent(id, { type: 'Movement', entityId: id, targetX: null, targetY: null, path: null, baseSpeed: 1.2 });
  world.addComponent(id, { type: 'MonsterAI', entityId: id, monsterType, level, status, homeLairId, targetEntityId: null });
  world.addComponent(id, { type: 'Name', entityId: id, name });
  world.addComponent(id, { type: 'Selectable', entityId: id, selectionType: 'monster' });
  world.addComponent(id, { type: 'Sprite', entityId: id, spriteType: 'monster', animationState: 'idle', animationFrame: 0, color: 0xff4d6d, size: 10 });

  return id;
}
