import type { GameState, GameLog, Milestone, SovereignMind, SovereignPhaseType, SovereignDecision, SovereignMemory, WinReport, LossReport, RaidWarning, GameStatus } from '../types/game';
import type { ResourceState, ResourceCapacity } from '../types/resources';
import { ECSWorld } from '../engine';
import type { SerializedWorld, EntityId } from '../engine';
import type { PositionComponent, HealthComponent, HeroAIComponent, MonsterAIComponent, BuildingComponent, LairComponent, CombatComponent, MovementComponent, NameComponent, FactionComponent, SquadMemberComponent, FogRevealerComponent, SpriteComponent, BountyTargetComponent, SpellCasterComponent, ComponentType } from '../engine/Component';
import { createRNG, SeededRNG } from '../utils/rng';
import { BALANCE } from '../utils/balance';
import { DIFFICULTY_MODIFIERS } from '../types/game';
import { HERO_CLASSES, SPECIALIZATION_STATS } from '../types/heroes';
import { SEASONS, SEASON_ORDER, SEASON_LENGTH, WEATHER_TYPES } from '../types/world';
import { getTechById, canResearch, getAvailableTechs } from '../types/tech';
import { getDistance, findPath } from '../utils/pathfinding';
import { exploreAround } from '../utils/terrainGenerator';
import { generateHeroName, generateMonsterName } from '../utils/nameGenerator';
import { createHeroEntity, createMonsterEntity, getTownHallPosition } from '../utils/worldGenerator';
import { addResources, spendResources, canAfford, emptyResourceState, emptyResourceCapacity } from '../types/resources';
import { runSovereignBotAI } from './SovereignAISystem';
import { tickUltimateCooldowns, autoAllocateSkillPoints, grantSkillPointOnLevelUp } from './SkillTreeSystem';
import { autoEquipBestItems, rollItemDrop } from './EquipmentSystem';
import { processDiplomacyDayRollover } from './DiplomacySystem';
import { processExpedition, reviveHeroes } from './DungeonSystem';
import { processRivalAITick } from './RivalAISystem';
import { checkScenarioObjectives, applyScenarioModifiers, getEndlessScore } from './ScenarioSystem';
import type { Treaty, Quest } from '../types/diplomacy';
import type { Dungeon, Expedition } from '../types/dungeons';
import type { RivalConfig, ScenarioObjective } from '../types/scenarios';

let logCounter = 5;
function makeLog(day: number, text: string, type: GameLog['type']): GameLog {
  return { id: `log_${logCounter++}`, day, text, type };
}

let milestoneCounter = 0;
function makeMilestone(day: number, type: string, text: string): Milestone {
  return { id: `ms_${milestoneCounter++}`, day, type, text };
}

export function resetCounters(): void {
  logCounter = 0;
  milestoneCounter = 0;
}

export function simulateTick(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;

  const world = new ECSWorld();
  world.deserialize(state.world);

  const rng = createRNG(`${state.config.seedString}_${state.day}_${state.timeOfDay}`);
  const diffMods = DIFFICULTY_MODIFIERS[state.config.difficulty];

  let day = state.day;
  let timeOfDay = state.timeOfDay;
  let resources = { ...state.resources };
  let resourceCapacity = { ...state.resourceCapacity };
  let realmStability = state.realmStability;
  let threatPressure = state.threatPressure;
  let sovereignMind = {
    ...state.sovereignMind,
    botThoughts: [...state.sovereignMind.botThoughts],
    recentDecisions: [...state.sovereignMind.recentDecisions],
    strategicMemory: [...state.sovereignMind.strategicMemory],
  };
  let logs = [...state.logs];
  let milestones = [...state.milestones];
  let squads = [...state.squads];
  let activeEvent = state.activeEvent;
  let season = { ...state.season };
  let weather = { ...state.weather };
  let unlockedTechs = [...state.unlockedTechs];
  let currentResearch = state.currentResearch;
  let researchProgress = state.researchProgress;
  let researchCost = { ...state.researchCost };
  let sovereignFavor = state.sovereignFavor;
  let playerInterventions = state.playerInterventions;
  let raidWarning = state.raidWarning;
  let cameraCaption = state.cameraCaption;
  let gameStatus: GameStatus = state.gameStatus;
  let winReport = state.winReport;
  let lossReport = state.lossReport;
  let townHallEntityId = state.townHallEntityId;
  let spireEntityId = state.spireEntityId;
  let spellCooldowns = { ...(state.spellCooldowns ?? { rallySpark: 0, zeeyaMend: 0, astryxFlare: 0, diplomaticEnvoy: 0, dungeonReveal: 0, massRally: 0 }) };
  let stats = state.stats ? { ...state.stats, lairsCleared: [...state.stats.lairsCleared], buildingsBuilt: [...state.stats.buildingsBuilt], upgradesPurchased: [...state.stats.upgradesPurchased], highestHeroLevel: { ...state.stats.highestHeroLevel } } : { heroesLostCount: 0, heroesHiredCount: 0, goldSpent: 0, goldEarned: 0, bountiesPlacedCount: 0, monstersKilledCount: 0, lairsCleared: [], buildingsBuilt: [], upgradesPurchased: [], spellsCastCount: 0, highestHeroLevel: { name: 'None', level: 0 } };
  let activeEffects = (state.activeEffects ?? []).map(e => ({ ...e, ttl: e.ttl - 1 })).filter(e => e.ttl > 0);

  let effectCounter = activeEffects.length;
  let treaties: Treaty[] = [...(state.treaties ?? [])];
  let quests: Quest[] = [...(state.quests ?? [])];
  let factionStandings = { ...(state.factionStandings ?? {}) };
  let dungeons: Dungeon[] = [...(state.dungeons ?? [])];
  let expeditions: Expedition[] = [...(state.expeditions ?? [])];
  let rivalKingdoms: RivalConfig[] = [...(state.rivalKingdoms ?? [])];
  let scenarioObjectives: ScenarioObjective[] = [...(state.scenarioObjectives ?? [])];
  let endlessScore = state.endlessScore ?? 0;

  const grid = state.grid.map(row => row.map(cell => ({ ...cell })));

  timeOfDay += 10;
  const isDayRollover = timeOfDay >= 100;
  if (isDayRollover) {
    timeOfDay = 0;
    day++;
    season.dayInSeason++;
    if (season.dayInSeason > SEASON_LENGTH) {
      season.dayInSeason = 1;
      const currentIdx = SEASON_ORDER.indexOf(season.current);
      season.current = SEASON_ORDER[(currentIdx + 1) % SEASON_ORDER.length];
      const seasonInfo = SEASONS[season.current];
      logs.push(makeLog(day, `Season change: ${seasonInfo.label}. ${seasonInfo.description}`, 'season'));
    }
  }

  if (weather.ticksRemaining <= 0) {
    const weatherRoll = rng.next();
    let newWeather: typeof weather.current = 'clear';
    if (season.current === 'winter') {
      if (weatherRoll < 0.3) newWeather = 'snow';
      else if (weatherRoll < 0.5) newWeather = 'fog';
      else if (weatherRoll < 0.6) newWeather = 'storm';
      else newWeather = 'clear';
    } else {
      if (weatherRoll < 0.15) newWeather = 'rain';
      else if (weatherRoll < 0.25) newWeather = 'fog';
      else if (weatherRoll < 0.32) newWeather = 'storm';
      else newWeather = 'clear';
    }
    if (newWeather !== weather.current) {
      weather.current = newWeather;
      logs.push(makeLog(day, `Weather: ${WEATHER_TYPES[newWeather].label}`, 'weather'));
    }
    weather.ticksRemaining = rng.int(3, 8);
  } else {
    weather.ticksRemaining--;
  }

  const seasonInfo = SEASONS[season.current];
  const weatherInfo = WEATHER_TYPES[weather.current];

  if (isDayRollover) {
    const dailyProduction = computeDailyProduction(world, seasonInfo, weatherInfo, unlockedTechs);
    resources = addResources(resources, dailyProduction, resourceCapacity);

    const heroUpkeep = computeHeroUpkeep(world);
    resources = spendResources(resources, heroUpkeep);

    if (resources.food < 0) {
      resources.food = 0;
      damageAllHeroes(world, 15, 'starvation');
      realmStability = Math.max(0, realmStability - 5);
      logs.push(makeLog(day, 'Food shortage! Heroes are starving and losing HP.', 'economy'));
    }

    const incomeBonus = diffMods.dailyIncomeBonus;
    if (incomeBonus !== 0) {
      resources.gold = Math.max(0, resources.gold + incomeBonus);
    }

    threatPressure = Math.min(100, threatPressure + BALANCE.threat.baseIncrease + (day > 30 ? BALANCE.threat.earlyGameCap * day : 0));
    if (day % BALANCE.threat.spireStirEveryDays === 0) {
      threatPressure = Math.min(100, threatPressure + BALANCE.threat.spireStirThreatBonus);
    }

    realmStability = Math.max(0, Math.min(100, realmStability - (threatPressure > 70 ? 2 : 0) + (threatPressure < 30 ? 1 : 0)));

    sovereignFavor = Math.min(BALANCE.sovereignFavorMax, sovereignFavor + BALANCE.sovereignFavorRegenPerDay);

    if (activeEvent) {
      activeEvent.duration--;
      if (activeEvent.duration <= 0) {
        logs.push(makeLog(day, `Event ended: ${activeEvent.title}`, 'event'));
        activeEvent = null;
      }
    }

    if (!activeEvent && rng.chance(0.08)) {
      const eventResult = triggerRandomEvent(rng, day);
      activeEvent = eventResult.activeEvent;
      logs.push(eventResult.log);
      if (eventResult.milestone) milestones.push(eventResult.milestone);
    }

    logs.push(makeLog(day, `Day ${day} dawns. Treasury: ${resources.gold}g. Stability: ${Math.round(realmStability)}%. Threat: ${Math.round(threatPressure)}%.`, 'general'));
  }

  updateResearch(world, unlockedTechs, currentResearch, researchProgress, researchCost, day, isDayRollover, rng, (newUnlocked, newCurrent, newProgress) => {
    unlockedTechs = newUnlocked;
    currentResearch = newCurrent;
    researchProgress = newProgress;
  }, (log) => logs.push(log));

  if (isDayRollover) {
    const botResult = runSovereignBotAI({
      world, day, resources, resourceCapacity, realmStability, threatPressure,
      sovereignMind, unlockedTechs, currentResearch, researchProgress, researchCost,
      rng, difficulty: state.config.difficulty,
      playerInterventions, townHallEntityId, spireEntityId,
    });
    resources = botResult.resources;
    sovereignMind = botResult.sovereignMind;
    unlockedTechs = botResult.unlockedTechs;
    currentResearch = botResult.currentResearch;
    researchProgress = botResult.researchProgress;
    researchCost = botResult.researchCost;
    if (botResult.logs) logs.push(...botResult.logs);
    if (botResult.milestones) milestones.push(...botResult.milestones);
  }

  tickUltimateCooldowns(world);

  updateHeroAI(world, grid, state.mapSize, rng, day, seasonInfo, weatherInfo, unlockedTechs, diffMods, isDayRollover, (log) => logs.push(log), stats);
  updateMonsterAI(world, grid, state.mapSize, rng, day, seasonInfo, threatPressure, diffMods, townHallEntityId, isDayRollover, (log) => logs.push(log));
  updateMovement(world, grid, state.mapSize, seasonInfo, weatherInfo, unlockedTechs);
  updateCombat(world, rng, day, unlockedTechs, diffMods, (log) => logs.push(log), (milestone) => milestones.push(milestone), stats, seasonInfo, squads, (type, x, y, value) => {
    activeEffects.push({ id: `fx_${effectCounter++}`, type, x, y, value, ttl: type === 'death' ? 15 : 8, maxTtl: type === 'death' ? 15 : 8, color: type === 'death' ? 0xff4444 : 0xffaa44 });
  });
  updateFogOfWar(world, grid, state.mapSize, day);
  updateLairSpawning(world, grid, state.mapSize, rng, day, diffMods, isDayRollover, (log) => logs.push(log), activeEvent, weatherInfo);
  updateGuardTowers(world, grid, state.mapSize, rng, day, unlockedTechs, (log) => logs.push(log));
  updateSquads(world, squads);
  updateBounties(world);
  updateSpells(world, isDayRollover);

  for (const expedition of expeditions) {
    if (!expedition.isActive) continue;
    const dungeon = dungeons.find(d => d.id === expedition.dungeonId);
    if (!dungeon) continue;
    const result = processExpedition(world, dungeon, expedition, rng, (text) => logs.push(makeLog(day, text, 'dungeon')));
    const dIdx = dungeons.findIndex(d => d.id === dungeon.id);
    dungeons[dIdx] = result.dungeon;
    const eIdx = expeditions.findIndex(e => e.id === expedition.id);
    expeditions[eIdx] = result.expedition;
    if (result.completed) {
      milestones.push(makeMilestone(day, 'dungeon', `Dungeon cleared: ${dungeon.id}`));
    }
    if (result.dungeon.status === 'failed') {
      reviveHeroes(world, expedition.squadHeroIds);
      logs.push(makeLog(day, `Expedition failed. Heroes revived at Town Hall with reduced HP.`, 'dungeon'));
    }
  }

  if (isDayRollover) {
    const dipResult = processDiplomacyDayRollover(world, day, treaties, quests, rng);
    treaties = dipResult.treaties;
    quests = dipResult.quests;
    if (dipResult.newQuests.length > 0) {
      for (const q of dipResult.newQuests) {
        logs.push(makeLog(day, `New quest available: ${q.description}`, 'diplomacy'));
      }
    }
    if (dipResult.resourceGains) {
      resources = addResources(resources, dipResult.resourceGains, resourceCapacity);
    }

    processRivalAITick(world, day, rng, (text) => logs.push(makeLog(day, text, 'rival')));

    const heroIds = world.query('HeroAI', 'SkillTree');
    for (const heroId of heroIds) {
      autoAllocateSkillPoints(world, heroId);
      autoEquipBestItems(world, heroId);
    }

    if (state.config.gameMode === 'endless') {
      endlessScore = getEndlessScore({ ...state, day, resources, stats });
    }

    if (state.config.scenarioId) {
      const scenarioResult = checkScenarioObjectives({ ...state, day, resources, stats, dungeons, world: world.serialize() }, world);
      if (scenarioResult.allMet) {
        gameStatus = 'won';
        winReport = {
          dayWon: day, heroesLostCount: stats.heroesLostCount,
          highestHeroLevel: stats.highestHeroLevel.level > 0 ? `${stats.highestHeroLevel.name} (Lv.${stats.highestHeroLevel.level})` : 'Unknown',
          goldSpent: stats.goldSpent, bountiesPlacedCount: stats.bountiesPlacedCount,
          finalStrategy: sovereignMind.currentPlan, bestDecision: sovereignMind.lastSuccess,
          worstDecision: sovereignMind.lastMistake, omenSummary: 'All scenario objectives completed!',
          mode: state.config.gameMode, difficulty: state.config.difficulty, biome: state.config.biome,
          playerInterventions, sovereignStrategySummary: sovereignMind.currentPlan,
          majorDecisions: sovereignMind.recentDecisions.map(d => d.actionLabel),
          heroesOfTheRun: [], lairsCleared: stats.lairsCleared, buildingsBuilt: stats.buildingsBuilt,
          upgradesPurchased: unlockedTechs, turningPoint: 'Scenario objectives fulfilled',
          finalSovereignThought: sovereignMind.botThoughts[0] || 'Victory is ours.',
        };
      }
    }
  }

  if (isDayRollover) {
    for (const key of Object.keys(spellCooldowns) as Array<keyof typeof spellCooldowns>) {
      if (spellCooldowns[key] > 0) spellCooldowns[key]--;
    }
  }

  cleanupDeadEntities(world);

  if (isDayRollover) {
    const winLossResult = checkWinLoss(world, day, state.config.timeLimit, townHallEntityId, spireEntityId, sovereignMind, state.config, playerInterventions, logs, milestones, unlockedTechs, stats);
    if (winLossResult.status === 'won') {
      gameStatus = 'won';
      winReport = winLossResult.winReport ?? null;
    } else if (winLossResult.status === 'lost') {
      gameStatus = 'lost';
      lossReport = winLossResult.lossReport ?? null;
    }
  }

  if (cameraCaption && cameraCaption.expires <= day) {
    cameraCaption = null;
  }

  logs = logs.slice(-BALANCE.logTrimLimit);

  const newState: GameState = {
    ...state,
    grid,
    day, timeOfDay, resources, resourceCapacity, realmStability, threatPressure,
    sovereignMind, logs, milestones, squads, activeEvent, season, weather,
    unlockedTechs, currentResearch, researchProgress, researchCost,
    sovereignFavor, playerInterventions, raidWarning, cameraCaption,
    gameStatus, winReport, lossReport, townHallEntityId, spireEntityId,
    spellCooldowns, stats,
    world: world.serialize(),
    activeEffects,
    treaties,
    quests,
    factionStandings,
    dungeons,
    expeditions,
    rivalKingdoms,
    scenarioObjectives,
    endlessScore,
  };

  return newState;
}

function computeDailyProduction(world: ECSWorld, seasonInfo: typeof SEASONS['spring'], weatherInfo: typeof WEATHER_TYPES['clear'], unlockedTechs: string[]): Partial<ResourceState> {
  const prod: Partial<ResourceState> = { gold: 0, wood: 0, stone: 0, food: 0, mana: 0, population: 0 };

  const buildingIds = world.query('Building', 'Position');
  for (const id of buildingIds) {
    const building = world.getComponent<BuildingComponent>(id, 'Building')!;
    if (!building.isBuilt) continue;

    const bType = building.buildingType;
    const production = BALANCE.resourceProduction[bType as keyof typeof BALANCE.resourceProduction];
    if (production) {
      for (const [resource, amount] of Object.entries(production)) {
        let finalAmount = amount as number;
        if (resource === 'food') finalAmount *= seasonInfo.foodModifier;
        if (resource === 'gold' && unlockedTechs.includes('caravanPact')) finalAmount *= 1.6;
        if (resource === 'gold' && unlockedTechs.includes('banking')) finalAmount *= 1.2;
        if ((resource === 'wood' || resource === 'stone') && unlockedTechs.includes('industrialMills')) finalAmount *= 1.5;
        const key = resource as keyof ResourceState;
        prod[key] = (prod[key] ?? 0) + finalAmount;
      }
    }
  }

  if (weatherInfo.foodBonusNextDay > 0) {
    prod.food = (prod.food || 0) + weatherInfo.foodBonusNextDay;
  }

  return prod;
}

function computeHeroUpkeep(world: ECSWorld): Partial<ResourceState> {
  const heroIds = world.query('HeroAI');
  const foodCost = heroIds.length * BALANCE.heroUpkeep.food;
  return { food: foodCost };
}

function damageAllHeroes(world: ECSWorld, damage: number, reason: string): void {
  const heroIds = world.query('HeroAI', 'Health');
  for (const id of heroIds) {
    const health = world.getComponent<HealthComponent>(id, 'Health')!;
    health.hp = Math.max(0, health.hp - damage);
    if (health.hp <= 0) {
      const heroAI = world.getComponent<HeroAIComponent>(id, 'HeroAI')!;
      heroAI.status = 'Resting';
      heroAI.deathReason = reason;
      world.addComponent(id, { type: 'Death', entityId: id, reason, day: 0 });
    }
  }
}

function triggerRandomEvent(rng: SeededRNG, day: number): { activeEvent: GameState['activeEvent']; log: GameLog; milestone?: Milestone } {
  const events = [
    { type: 'HybriX Surge' as const, duration: 20, title: 'HybriX Surge', description: 'Monster aggression surges! All lair spawn rates increased.' },
    { type: 'Dalyze Bloom' as const, duration: 15, title: 'Dalyze Bloom', description: 'Mystical blooms increase mana regeneration.' },
    { type: 'Astryx Rupture' as const, duration: 12, title: 'Astryx Rupture', description: 'Astral energy ruptures — spell costs reduced.' },
    { type: 'Golden Caravan' as const, duration: 10, title: 'Golden Caravan', description: 'A golden caravan arrives! +200 gold bonus.' },
    { type: 'Plague' as const, duration: 15, title: 'Plague', description: 'A plague sweeps the land. Heroes lose HP slowly.' },
    { type: 'Harvest Festival' as const, duration: 10, title: 'Harvest Festival', description: 'Double food production for the duration!' },
    { type: 'Mana Storm' as const, duration: 12, title: 'Mana Storm', description: 'Mana flows freely — spells cost no mana!' },
    { type: 'Refugee Crisis' as const, duration: 8, title: 'Refugee Crisis', description: 'Refugees arrive! Population increases but stability drops.' },
    { type: 'Ancient Awakening' as const, duration: 20, title: 'Ancient Awakening', description: 'An ancient ruin stirs — a powerful neutral monster emerges!' },
  ];
  const event = rng.pick(events);
  return {
    activeEvent: event,
    log: makeLog(day, `Event: ${event.title} — ${event.description}`, 'event'),
    milestone: makeMilestone(day, 'event', `Event triggered: ${event.title}`),
  };
}

function updateResearch(
  world: ECSWorld,
  unlockedTechs: string[],
  currentResearch: string | null,
  researchProgress: number,
  researchCost: { gold: number; mana: number },
  day: number,
  isDayRollover: boolean,
  rng: SeededRNG,
  onUpdate: (unlocked: string[], current: string | null, progress: number) => void,
  onLog: (log: GameLog) => void
): void {
  if (!currentResearch || !isDayRollover) return;
  const tech = getTechById(currentResearch);
  if (!tech) return;

  researchProgress++;
  if (researchProgress >= tech.researchTime) {
    const newUnlocked = [...unlockedTechs, currentResearch];
    onLog(makeLog(day, `Research complete: ${tech.name}! ${tech.description}`, 'research'));
    onUpdate(newUnlocked, null, 0);
  } else {
    onUpdate(unlockedTechs, currentResearch, researchProgress);
  }
}

function updateHeroAI(
  world: ECSWorld,
  grid: GameState['grid'],
  mapSize: number,
  rng: SeededRNG,
  day: number,
  seasonInfo: typeof SEASONS['spring'],
  weatherInfo: typeof WEATHER_TYPES['clear'],
  unlockedTechs: string[],
  diffMods: typeof DIFFICULTY_MODIFIERS['easy'],
  isDayRollover: boolean,
  onLog: (log: GameLog) => void,
  stats: GameState['stats']
): void {
  const heroIds = world.query('HeroAI', 'Position', 'Health', 'Combat');

  for (const id of heroIds) {
    const heroAI = world.getComponent<HeroAIComponent>(id, 'HeroAI')!;
    const pos = world.getComponent<PositionComponent>(id, 'Position')!;
    const health = world.getComponent<HealthComponent>(id, 'Health')!;
    const combat = world.getComponent<CombatComponent>(id, 'Combat')!;

    if (health.hp <= 0) {
      if (!world.hasComponent(id, 'Death')) {
        world.addComponent(id, { type: 'Death', entityId: id, reason: heroAI.deathReason || 'fallen in battle', day });
        onLog(makeLog(day, `Hero ${getEntityName(world, id)} has died (${heroAI.deathReason || 'fallen in battle'}).`, 'death'));
        stats.heroesLostCount++;
      }
      continue;
    }

    if (isDayRollover) {
      if (heroAI.status === 'Resting') {
        health.hp = Math.min(health.maxHp, health.hp + Math.floor(health.maxHp * BALANCE.combat.heroRegenResting));
        if (health.hp >= health.maxHp * 0.8) {
          heroAI.status = 'Searching';
        }
      } else {
        health.hp = Math.min(health.maxHp, health.hp + BALANCE.combat.heroRegenPassive);
      }

      if (heroAI.xp >= heroAI.xpNeeded && heroAI.level < BALANCE.heroLevelCap) {
        heroAI.level++;
        heroAI.xp -= heroAI.xpNeeded;
        heroAI.xpNeeded = Math.floor(heroAI.xpNeeded * (1 + heroAI.level * 0.15));
        health.maxHp += BALANCE.combat.levelUpHpBonus;
        health.hp = health.maxHp;
        combat.attack += BALANCE.combat.levelUpAttackBonus;
        combat.defense += BALANCE.combat.levelUpDefenseBonus;
        onLog(makeLog(day, `${getEntityName(world, id)} reached level ${heroAI.level}!`, 'general'));
        if (heroAI.level > stats.highestHeroLevel.level) {
          stats.highestHeroLevel = { name: getEntityName(world, id), level: heroAI.level };
        }

        if (heroAI.level === BALANCE.specializationUnlockLevel && !heroAI.specialization) {
          const specs = getSpecializationsForClass(heroAI.heroClass);
          if (specs) {
            heroAI.specialization = rng.chance(0.5) ? specs.a : specs.b;
            const specStats = SPECIALIZATION_STATS[heroAI.specialization as keyof typeof SPECIALIZATION_STATS];
            if (specStats) {
              health.maxHp = Math.floor(health.maxHp * specStats.hpMultiplier);
              health.hp = health.maxHp;
              combat.attack = Math.floor(combat.attack * specStats.attackMultiplier);
              combat.defense = Math.floor(combat.defense * specStats.defenseMultiplier);
              combat.speed *= specStats.speedMultiplier;
              combat.range += specStats.rangeBonus;
            }
            onLog(makeLog(day, `${getEntityName(world, id)} specialized as ${heroAI.specialization}!`, 'general'));
          }
        }
      }
    }

    const hpPercent = health.hp / health.maxHp;
    const shouldFlee = hpPercent < BALANCE.combat.heroFleeThreshold && heroAI.caution > 40;
    if (shouldFlee && heroAI.status !== 'Fleeing' && !unlockedTechs.includes('lastStand')) {
      heroAI.status = 'Fleeing';
      const townHallPos = getTownHallPosition(mapSize);
      const movement = world.getComponent<MovementComponent>(id, 'Movement');
      if (movement) {
        movement.targetX = townHallPos.x;
        movement.targetY = townHallPos.y;
        movement.path = null;
      }
      onLog(makeLog(day, `${getEntityName(world, id)} is fleeing to safety!`, 'combat'));
    }

    if (heroAI.status === 'Fleeing' && hpPercent > 0.7) {
      heroAI.status = 'Searching';
    }

    if (heroAI.status === 'Fleeing' || heroAI.status === 'Resting') continue;

    const nearestMonster = findNearestEntity(world, pos.x, pos.y, 'MonsterAI', 10, mapSize);
    if (nearestMonster !== null) {
      heroAI.status = 'Fighting';
      heroAI.targetEntityId = nearestMonster;
      heroAI.targetType = 'monster';
      continue;
    }

    const bounty = findNearestBounty(world, pos.x, pos.y, mapSize);
    if (bounty) {
      heroAI.status = 'ChasingBounty';
      heroAI.targetEntityId = bounty;
      const bountyComp = world.getComponent<BountyTargetComponent>(bounty, 'BountyTarget')!;
      const movement = world.getComponent<MovementComponent>(id, 'Movement');
      if (movement) {
        movement.targetX = bountyComp.targetX;
        movement.targetY = bountyComp.targetY;
        movement.path = null;
      }
      continue;
    }

    if (heroAI.status !== 'Fighting' && heroAI.status !== 'ChasingBounty') {
      const nearestLair = findNearestLair(world, pos.x, pos.y, mapSize);
      if (nearestLair !== null && rng.chance(0.4)) {
        heroAI.status = 'Exploring';
        const movement = world.getComponent<MovementComponent>(id, 'Movement');
        if (movement) {
          movement.targetX = nearestLair.x;
          movement.targetY = nearestLair.y;
          movement.path = null;
        }
      } else if (rng.chance(0.65)) {
        heroAI.status = 'Exploring';
        const movement = world.getComponent<MovementComponent>(id, 'Movement');
        if (movement) {
          movement.targetX = Math.max(0, Math.min(mapSize - 1, pos.x + rng.int(-20, 20)));
          movement.targetY = Math.max(0, Math.min(mapSize - 1, pos.y + rng.int(-20, 20)));
          movement.path = null;
        }
      } else {
        heroAI.status = 'Patrolling';
        const movement = world.getComponent<MovementComponent>(id, 'Movement');
        if (movement) {
          movement.targetX = Math.max(0, Math.min(mapSize - 1, pos.x + rng.int(-5, 5)));
          movement.targetY = Math.max(0, Math.min(mapSize - 1, pos.y + rng.int(-5, 5)));
          movement.path = null;
        }
      }
    }
  }
}

function updateMonsterAI(
  world: ECSWorld,
  grid: GameState['grid'],
  mapSize: number,
  rng: SeededRNG,
  day: number,
  seasonInfo: typeof SEASONS['spring'],
  threatPressure: number,
  diffMods: typeof DIFFICULTY_MODIFIERS['easy'],
  townHallEntityId: EntityId | null,
  isDayRollover: boolean,
  onLog: (log: GameLog) => void
): void {
  const monsterIds = world.query('MonsterAI', 'Position', 'Health', 'Combat');

  for (const id of monsterIds) {
    const monsterAI = world.getComponent<MonsterAIComponent>(id, 'MonsterAI')!;
    const pos = world.getComponent<PositionComponent>(id, 'Position')!;
    const health = world.getComponent<HealthComponent>(id, 'Health')!;

    if (health.hp <= 0) continue;

    if (isDayRollover && monsterAI.status === 'roaming') {
      const raidChance = (0.02 + threatPressure * 0.001) * diffMods.raidChanceMultiplier * seasonInfo.monsterAggressionModifier;
      if (rng.chance(raidChance)) {
        monsterAI.status = 'raiding';
        if (townHallEntityId !== null) {
          const thPos = world.getComponent<PositionComponent>(townHallEntityId, 'Position');
          if (thPos) {
            const movement = world.getComponent<MovementComponent>(id, 'Movement');
            if (movement) {
              movement.targetX = thPos.x;
              movement.targetY = thPos.y;
              movement.path = null;
            }
          }
        }
        onLog(makeLog(day, `Monster ${getEntityName(world, id)} is raiding towards Pyahhold!`, 'raid'));
      }
    }

    const nearestHero = findNearestEntity(world, pos.x, pos.y, 'HeroAI', 5, mapSize);
    if (nearestHero !== null && monsterAI.status !== 'raiding') {
      monsterAI.status = 'roaming';
      monsterAI.targetEntityId = nearestHero;
      const heroPos = world.getComponent<PositionComponent>(nearestHero, 'Position');
      if (heroPos) {
        const movement = world.getComponent<MovementComponent>(id, 'Movement');
        if (movement) {
          movement.targetX = heroPos.x;
          movement.targetY = heroPos.y;
          movement.path = null;
        }
      }
    }
  }
}

function updateMovement(
  world: ECSWorld,
  grid: GameState['grid'],
  mapSize: number,
  seasonInfo: typeof SEASONS['spring'],
  weatherInfo: typeof WEATHER_TYPES['clear'],
  unlockedTechs: string[]
): void {
  const movingIds = world.query('Movement', 'Position', 'Combat');

  for (const id of movingIds) {
    const movement = world.getComponent<MovementComponent>(id, 'Movement')!;
    const pos = world.getComponent<PositionComponent>(id, 'Position')!;
    const combat = world.getComponent<CombatComponent>(id, 'Combat')!;

    if (movement.targetX === null || movement.targetY === null) continue;

    if (!movement.path || movement.path.length === 0) {
      const path = findPath(grid, pos.x, pos.y, movement.targetX, movement.targetY, mapSize);
      movement.path = path;
    }

    if (movement.path && movement.path.length > 0) {
      const next = movement.path[0];
      const dist = getDistance(pos.x, pos.y, next.x, next.y);
      let speed = combat.speed * seasonInfo.movementModifier * weatherInfo.movementModifier;

      const isMonster = world.hasComponent(id, 'MonsterAI');
      if (isMonster && unlockedTechs.includes('timeWarp')) speed *= 0.7;

      const tileX = Math.floor(pos.x);
      const tileY = Math.floor(pos.y);
      if (grid[tileX]?.[tileY]?.hasRoad) speed *= 1.3;

      if (dist <= speed) {
        pos.x = next.x;
        pos.y = next.y;
        movement.path.shift();
      } else {
        const dx = next.x - pos.x;
        const dy = next.y - pos.y;
        pos.x += (dx / dist) * speed;
        pos.y += (dy / dist) * speed;
      }
    } else {
      if (Math.abs(pos.x - movement.targetX) < 0.5 && Math.abs(pos.y - movement.targetY) < 0.5) {
        movement.targetX = null;
        movement.targetY = null;
      }
    }
  }
}

function updateCombat(
  world: ECSWorld,
  rng: SeededRNG,
  day: number,
  unlockedTechs: string[],
  diffMods: typeof DIFFICULTY_MODIFIERS['easy'],
  onLog: (log: GameLog) => void,
  onMilestone: (milestone: Milestone) => void,
  stats: GameState['stats'],
  seasonInfo: typeof SEASONS['spring'],
  squads: GameState['squads'],
  onEffect: (type: 'combat' | 'death', x: number, y: number, value?: number) => void
): void {
  const heroIds = world.query('HeroAI', 'Position', 'Health', 'Combat');

  for (const heroId of heroIds) {
    const heroAI = world.getComponent<HeroAIComponent>(heroId, 'HeroAI')!;
    const heroPos = world.getComponent<PositionComponent>(heroId, 'Position')!;
    const heroHealth = world.getComponent<HealthComponent>(heroId, 'Health')!;
    const heroCombat = world.getComponent<CombatComponent>(heroId, 'Combat')!;

    if (heroHealth.hp <= 0) continue;

    const monsterIds = world.query('MonsterAI', 'Position', 'Health', 'Combat');
    for (const monsterId of monsterIds) {
      const monsterAI = world.getComponent<MonsterAIComponent>(monsterId, 'MonsterAI')!;
      const monsterPos = world.getComponent<PositionComponent>(monsterId, 'Position')!;
      const monsterHealth = world.getComponent<HealthComponent>(monsterId, 'Health')!;
      const monsterCombat = world.getComponent<CombatComponent>(monsterId, 'Combat')!;

      if (monsterHealth.hp <= 0) continue;

      const dist = getDistance(heroPos.x, heroPos.y, monsterPos.x, monsterPos.y);
      if (dist <= heroCombat.range) {
        let heroDmg = Math.max(1, heroCombat.attack - monsterCombat.defense);
        if (unlockedTechs.includes('ironEdge')) heroDmg = Math.floor(heroDmg * 1.25);
        if (heroAI.specialization === 'Berserker' && heroHealth.hp < heroHealth.maxHp * 0.5) heroDmg *= 2;
        if (heroAI.specialization === 'Sniper' && rng.chance(0.25)) heroDmg *= 2;
        if (heroAI.specialization === 'Assassin' && monsterAI.targetEntityId !== heroId) heroDmg = Math.floor(heroDmg * 1.5);
        if (heroAI.specialization === 'Pyromancer') {
          const nearbyMonsters = world.query('MonsterAI', 'Position', 'Health');
          for (const nmId of nearbyMonsters) {
            if (nmId === monsterId) continue;
            const nmHealth = world.getComponent<HealthComponent>(nmId, 'Health')!;
            const nmPos = world.getComponent<PositionComponent>(nmId, 'Position')!;
            if (nmHealth.hp <= 0) continue;
            if (getDistance(monsterPos.x, monsterPos.y, nmPos.x, nmPos.y) <= 2) {
              nmHealth.hp -= Math.floor(heroDmg * 0.5);
            }
          }
        }
        if (heroAI.specialization === 'VolleyArcher') {
          const nearbyMonsters = world.query('MonsterAI', 'Position', 'Health');
          let hitCount = 1;
          for (const nmId of nearbyMonsters) {
            if (nmId === monsterId || hitCount >= 3) continue;
            const nmHealth = world.getComponent<HealthComponent>(nmId, 'Health')!;
            const nmPos = world.getComponent<PositionComponent>(nmId, 'Position')!;
            if (nmHealth.hp <= 0) continue;
            if (getDistance(heroPos.x, heroPos.y, nmPos.x, nmPos.y) <= heroCombat.range) {
              nmHealth.hp -= Math.floor(heroDmg * 0.7);
              hitCount++;
            }
          }
        }

        const squadMember = world.getComponent<SquadMemberComponent>(heroId, 'SquadMember');
        if (squadMember && squadMember.squadId !== null) {
          const squad = squads.find(s => s.id === squadMember.squadId);
          if (squad) {
            const aliveMembers = squad.memberIds.filter(mid => {
              const h = world.getComponent<HealthComponent>(mid, 'Health');
              return h && h.hp > 0;
            });
            const squadBonus = 1 + (aliveMembers.length - 1) * 0.1 * (unlockedTechs.includes('warCollege') ? 2 : 1);
            heroDmg = Math.floor(heroDmg * squadBonus);
          }
        }
        if (unlockedTechs.includes('eliteGuard')) {
          heroDmg = Math.floor(heroDmg * 1.2);
        }

        monsterHealth.hp -= heroDmg;
        heroAI.status = 'Fighting';
        heroAI.targetEntityId = monsterId;
        onEffect('combat', monsterPos.x, monsterPos.y, heroDmg);

        if (monsterHealth.hp <= 0) {
          const goldPerKill = Math.floor(BALANCE.combat.goldPerKill * seasonInfo.goldBountyModifier);
          heroAI.xp += Math.floor(BALANCE.combat.xpPerKill * (unlockedTechs.includes('heroTraining') ? 1.5 : 1));
          heroAI.personalGold += goldPerKill;
          stats.monstersKilledCount++;
          stats.goldEarned += goldPerKill;
          onLog(makeLog(day, `${getEntityName(world, heroId)} defeated ${getEntityName(world, monsterId)}! (+${Math.floor(BALANCE.combat.xpPerKill * (unlockedTechs.includes('heroTraining') ? 1.5 : 1))} XP)`, 'combat'));
          world.destroyEntity(monsterId);
          continue;
        }

        let monsterDmg = Math.max(1, monsterCombat.attack - heroCombat.defense);
        if (unlockedTechs.includes('wardedMail')) monsterDmg = Math.floor(monsterDmg * 0.75);
        monsterDmg = Math.floor(monsterDmg * diffMods.monsterDamageMultiplier);

        if (heroAI.specialization === 'Avenger') {
          monsterHealth.hp -= Math.floor(monsterDmg * 0.3);
        }

        heroHealth.hp -= monsterDmg;
        onLog(makeLog(day, `${getEntityName(world, heroId)} hit ${getEntityName(world, monsterId)} for ${heroDmg}. ${getEntityName(world, heroId)} took ${monsterDmg} damage.`, 'combat'));

        if (heroHealth.hp <= 0) {
          if (unlockedTechs.includes('zeeyasMercy') && rng.chance(0.65)) {
            heroHealth.hp = Math.floor(heroHealth.maxHp * 0.3);
            onLog(makeLog(day, `Zeeya's Mercy saved ${getEntityName(world, heroId)} from death!`, 'event'));
          } else {
            heroAI.status = 'Resting';
            heroAI.deathReason = `slain by ${getEntityName(world, monsterId)}`;
            world.addComponent(heroId, { type: 'Death', entityId: heroId, reason: heroAI.deathReason, day });
            onLog(makeLog(day, `Hero ${getEntityName(world, heroId)} has fallen in battle!`, 'death'));
            onEffect('death', heroPos.x, heroPos.y);
            stats.heroesLostCount++;
          }
        }
        break;
      }
    }

    if (heroAI.status === 'Fighting' && heroAI.targetEntityId !== null) {
      const targetHealth = world.getComponent<HealthComponent>(heroAI.targetEntityId, 'Health');
      if (!targetHealth || targetHealth.hp <= 0) {
        heroAI.status = 'Searching';
        heroAI.targetEntityId = null;
      }
    }

    const lairIds = world.query('Lair', 'Position', 'Health');
    for (const lairId of lairIds) {
      const lair = world.getComponent<LairComponent>(lairId, 'Lair')!;
      const lairPos = world.getComponent<PositionComponent>(lairId, 'Position')!;
      const lairHealth = world.getComponent<HealthComponent>(lairId, 'Health')!;

      if (lair.isDestroyed || lairHealth.hp <= 0) continue;

      const dist = getDistance(heroPos.x, heroPos.y, lairPos.x, lairPos.y);
      if (dist <= heroCombat.range + 1) {
        let lairDmg = Math.max(1, heroCombat.attack - BALANCE.combat.lairDefenseAttack);
        if (lair.lairName === 'The Veylthyr Spire') {
          lairDmg = Math.max(1, heroCombat.attack - BALANCE.combat.spireDefenseAttack);
          if (unlockedTechs.includes('spirebreakerArms')) lairDmg = Math.floor(lairDmg * 1.6);
        }
        if (unlockedTechs.includes('ironEdge')) lairDmg = Math.floor(lairDmg * 1.25);

        lairHealth.hp -= lairDmg;
        heroAI.status = 'Fighting';

        if (lairHealth.hp <= 0) {
          lair.isDestroyed = true;
          heroAI.xp += 100;
          stats.lairsCleared.push(lair.lairName);
          onLog(makeLog(day, `${getEntityName(world, heroId)} destroyed ${lair.lairName}!`, 'combat'));
          onMilestone(makeMilestone(day, 'lair', `Lair destroyed: ${lair.lairName}`));
          world.destroyEntity(lairId);
        }
        break;
      }
    }
  }
}

function updateFogOfWar(world: ECSWorld, grid: GameState['grid'], mapSize: number, day: number): void {
  const revealerIds = world.query('FogRevealer', 'Position');
  for (const id of revealerIds) {
    const fog = world.getComponent<FogRevealerComponent>(id, 'FogRevealer')!;
    const pos = world.getComponent<PositionComponent>(id, 'Position')!;
    exploreAround(grid, mapSize, Math.floor(pos.x), Math.floor(pos.y), fog.viewRadius);

    const lairIds = world.query('Lair', 'Position');
    for (const lairId of lairIds) {
      const lair = world.getComponent<LairComponent>(lairId, 'Lair')!;
      const lairPos = world.getComponent<PositionComponent>(lairId, 'Position')!;
      if (!lair.isDiscovered && getDistance(pos.x, pos.y, lairPos.x, lairPos.y) <= fog.viewRadius) {
        lair.isDiscovered = true;
        lair.discoveredDay = day;
      }
    }
  }
}

function updateLairSpawning(
  world: ECSWorld,
  grid: GameState['grid'],
  mapSize: number,
  rng: SeededRNG,
  day: number,
  diffMods: typeof DIFFICULTY_MODIFIERS['easy'],
  isDayRollover: boolean,
  onLog: (log: GameLog) => void,
  activeEvent: GameState['activeEvent'],
  weatherInfo: typeof WEATHER_TYPES['clear']
): void {
  if (!isDayRollover) return;

  const eventSpawnMod = activeEvent?.type === 'HybriX Surge' ? 1.5 : 1;
  const weatherSpawnMod = weatherInfo.monsterSpawnModifier ?? 1;

  const lairIds = world.query('Lair', 'Position', 'Health');
  for (const lairId of lairIds) {
    const lair = world.getComponent<LairComponent>(lairId, 'Lair')!;
    const lairPos = world.getComponent<PositionComponent>(lairId, 'Position')!;
    const lairHealth = world.getComponent<HealthComponent>(lairId, 'Health')!;

    if (lair.isDestroyed || lairHealth.hp <= 0) continue;

    lair.spawnCooldown--;
    if (lair.spawnCooldown <= 0) {
      const spawnRate = diffMods.lairSpawnRateMultiplier * eventSpawnMod * weatherSpawnMod;
      if (rng.chance(0.7 * spawnRate)) {
        const monsterType = lair.threatLevel === 'elite' ? 'Veylthyr Husk' : lair.threatLevel === 'high' ? 'Dalyze Crawler' : lair.threatLevel === 'medium' ? 'Fangling' : 'Gnarl Imp';
        const monsterHp = lair.threatLevel === 'elite' ? 180 : lair.threatLevel === 'high' ? 120 : lair.threatLevel === 'medium' ? 80 : 50;
        const monsterAtk = lair.threatLevel === 'elite' ? 30 : lair.threatLevel === 'high' ? 22 : lair.threatLevel === 'medium' ? 16 : 10;
        const monsterDef = lair.threatLevel === 'elite' ? 12 : lair.threatLevel === 'high' ? 8 : lair.threatLevel === 'medium' ? 5 : 3;
        const monsterLvl = lair.threatLevel === 'elite' ? 5 : lair.threatLevel === 'high' ? 3 : lair.threatLevel === 'medium' ? 2 : 1;

        const name = generateMonsterName(monsterType, rng);
        const spawnX = lairPos.x + rng.float(-1, 1);
        const spawnY = lairPos.y + rng.float(-1, 1);
        createMonsterEntity(world, monsterType, name, spawnX, spawnY, monsterHp, monsterAtk, monsterDef, monsterLvl, lairId, 'roaming');
        onLog(makeLog(day, `${lair.lairName} spawned a ${monsterType}.`, 'raid'));
      }
      lair.spawnCooldown = lair.threatLevel === 'elite' ? 25 : lair.threatLevel === 'high' ? 20 : lair.threatLevel === 'medium' ? 16 : 12;
    }
  }
}

function updateSquads(world: ECSWorld, squads: GameState['squads']): void {
  for (const squad of squads) {
    const aliveMembers = squad.memberIds.filter(id => {
      const health = world.getComponent<HealthComponent>(id, 'Health');
      return health && health.hp > 0;
    });
    if (aliveMembers.length < BALANCE.squadMinSize) {
      for (const memberId of aliveMembers) {
        const squadMember = world.getComponent<SquadMemberComponent>(memberId, 'SquadMember');
        if (squadMember) squadMember.squadId = null;
      }
    }
  }
}

function updateBounties(world: ECSWorld): void {
  const bountyIds = world.query('BountyTarget');
  for (const bountyId of bountyIds) {
    const bounty = world.getComponent<BountyTargetComponent>(bountyId, 'BountyTarget')!;
    if (bounty.bountyStatus === 'claimed') {
      world.destroyEntity(bountyId);
    }
  }
}

function updateSpells(world: ECSWorld, isDayRollover: boolean): void {
  const casterIds = world.query('SpellCaster');
  for (const id of casterIds) {
    const caster = world.getComponent<SpellCasterComponent>(id, 'SpellCaster')!;
    for (const spellKey of Object.keys(caster.spells)) {
      const spell = caster.spells[spellKey];
      if (spell.cooldown > 0 && isDayRollover) {
        spell.cooldown--;
      }
    }
  }
}

function checkWinLoss(
  world: ECSWorld,
  day: number,
  timeLimit: number,
  townHallEntityId: EntityId | null,
  spireEntityId: EntityId | null,
  sovereignMind: SovereignMind,
  config: GameState['config'],
  playerInterventions: number,
  logs: GameLog[],
  milestones: Milestone[],
  unlockedTechs: string[],
  stats: GameState['stats']
): { status: 'playing' | 'won' | 'lost'; winReport?: WinReport; lossReport?: LossReport } {
  if (spireEntityId !== null) {
    const spireHealth = world.getComponent<HealthComponent>(spireEntityId, 'Health');
    const spireLair = world.getComponent<LairComponent>(spireEntityId, 'Lair');
    if (spireHealth && spireHealth.hp <= 0 || (spireLair && spireLair.isDestroyed)) {
      const winReport: WinReport = {
        dayWon: day,
        heroesLostCount: stats.heroesLostCount,
        highestHeroLevel: stats.highestHeroLevel.level > 0 ? `${stats.highestHeroLevel.name} (Lv.${stats.highestHeroLevel.level})` : 'Unknown',
        goldSpent: stats.goldSpent,
        bountiesPlacedCount: stats.bountiesPlacedCount,
        finalStrategy: sovereignMind.currentPlan,
        bestDecision: sovereignMind.lastSuccess,
        worstDecision: sovereignMind.lastMistake,
        omenSummary: 'The Spire has fallen!',
        mode: config.gameMode,
        difficulty: config.difficulty,
        biome: config.biome,
        playerInterventions,
        sovereignStrategySummary: sovereignMind.currentPlan,
        majorDecisions: sovereignMind.recentDecisions.map(d => d.actionLabel),
        heroesOfTheRun: [],
        lairsCleared: stats.lairsCleared,
        buildingsBuilt: stats.buildingsBuilt,
        upgradesPurchased: unlockedTechs,
        turningPoint: 'The final assault on the Veylthyr Spire',
        finalSovereignThought: sovereignMind.botThoughts[0] || 'It is done.',
      };
      return { status: 'won', winReport };
    }
  }

  if (townHallEntityId !== null) {
    const thHealth = world.getComponent<HealthComponent>(townHallEntityId, 'Health');
    if (thHealth && thHealth.hp <= 0) {
      const lossReport: LossReport = {
        dayLost: day,
        causeOfCollapse: 'Town Hall destroyed',
        spireHpRemaining: 0,
        spireMaxHp: 0,
        biggestStrategicFailure: sovereignMind.lastMistake,
        strongestSurvivingMonster: 'Unknown',
        finalBotThought: sovereignMind.botThoughts[0] || 'We have failed.',
        omenSummary: 'Pyahhold has fallen!',
        mode: config.gameMode,
        difficulty: config.difficulty,
        biome: config.biome,
        playerInterventions,
        sovereignStrategySummary: sovereignMind.currentPlan,
        majorDecisions: sovereignMind.recentDecisions.map(d => d.actionLabel),
        heroesOfTheRun: [],
        lairsCleared: stats.lairsCleared,
        buildingsBuilt: stats.buildingsBuilt,
        upgradesPurchased: unlockedTechs,
        turningPoint: 'The Town Hall was overwhelmed',
      };
      return { status: 'lost', lossReport };
    }
  }

  if (day >= timeLimit) {
    const lossReport: LossReport = {
      dayLost: day,
      causeOfCollapse: 'Time limit expired — the Spire still stands',
      spireHpRemaining: 0,
      spireMaxHp: 0,
      biggestStrategicFailure: 'Failed to destroy the Veylthyr Spire in time',
      strongestSurvivingMonster: 'The Veylthyr Spire',
      finalBotThought: sovereignMind.botThoughts[0] || 'Time has run out.',
      omenSummary: 'The campaign has expired.',
      mode: config.gameMode,
      difficulty: config.difficulty,
      biome: config.biome,
      playerInterventions,
      sovereignStrategySummary: sovereignMind.currentPlan,
      majorDecisions: sovereignMind.recentDecisions.map(d => d.actionLabel),
      heroesOfTheRun: [],
      lairsCleared: stats.lairsCleared,
      buildingsBuilt: stats.buildingsBuilt,
      upgradesPurchased: unlockedTechs,
      turningPoint: 'The clock ran out',
    };
    return { status: 'lost', lossReport };
  }

  return { status: 'playing' };
}

function updateGuardTowers(
  world: ECSWorld,
  grid: GameState['grid'],
  mapSize: number,
  rng: SeededRNG,
  day: number,
  unlockedTechs: string[],
  onLog: (log: GameLog) => void
): void {
  const towerIds = world.query('Building', 'Position', 'Health');
  for (const towerId of towerIds) {
    const building = world.getComponent<BuildingComponent>(towerId, 'Building')!;
    if (building.buildingType !== 'GuardTower' || !building.isBuilt) continue;

    const towerHealth = world.getComponent<HealthComponent>(towerId, 'Health')!;
    if (towerHealth.hp <= 0) continue;

    const towerPos = world.getComponent<PositionComponent>(towerId, 'Position')!;
    let range = 5;
    if (unlockedTechs.includes('guardTowerRange')) range *= 1.5;

    const monsterIds = world.query('MonsterAI', 'Position', 'Health');
    for (const monsterId of monsterIds) {
      const monsterPos = world.getComponent<PositionComponent>(monsterId, 'Position')!;
      const monsterHealth = world.getComponent<HealthComponent>(monsterId, 'Health')!;
      if (monsterHealth.hp <= 0) continue;

      const dist = getDistance(towerPos.x, towerPos.y, monsterPos.x, monsterPos.y);
      if (dist <= range) {
        const damage = Math.max(1, BALANCE.combat.guardTowerDamage - BALANCE.combat.guardTowerDefense);
        monsterHealth.hp -= damage;
        if (monsterHealth.hp <= 0) {
          onLog(makeLog(day, `Guard Tower destroyed ${getEntityName(world, monsterId)}!`, 'combat'));
          world.destroyEntity(monsterId);
        }
        break;
      }
    }
  }
}

function cleanupDeadEntities(world: ECSWorld): void {
  const deadIds = world.query('Death');
  for (const id of deadIds) {
    world.destroyEntity(id);
  }
}

function getEntityName(world: ECSWorld, id: EntityId): string {
  const nameComp = world.getComponent<NameComponent>(id, 'Name');
  return nameComp?.name ?? `Entity#${id}`;
}

function findNearestEntity(world: ECSWorld, x: number, y: number, componentType: ComponentType, maxRange: number, mapSize: number): EntityId | null {
  const ids = world.query(componentType, 'Position', 'Health');
  let nearest: EntityId | null = null;
  let nearestDist = Infinity;

  for (const id of ids) {
    const health = world.getComponent<HealthComponent>(id, 'Health')!;
    if (health.hp <= 0) continue;
    const pos = world.getComponent<PositionComponent>(id, 'Position')!;
    const dist = getDistance(x, y, pos.x, pos.y);
    if (dist < nearestDist && dist <= maxRange) {
      nearestDist = dist;
      nearest = id;
    }
  }

  return nearest;
}

function findNearestLair(world: ECSWorld, x: number, y: number, _mapSize: number): { id: EntityId; x: number; y: number } | null {
  const lairIds = world.query('Lair', 'Position', 'Health');
  let nearest: { id: EntityId; x: number; y: number } | null = null;
  let nearestDist = Infinity;

  for (const id of lairIds) {
    const lair = world.getComponent<LairComponent>(id, 'Lair')!;
    const health = world.getComponent<HealthComponent>(id, 'Health')!;
    if (lair.isDestroyed || health.hp <= 0) continue;
    const pos = world.getComponent<PositionComponent>(id, 'Position')!;
    const dist = getDistance(x, y, pos.x, pos.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = { id, x: pos.x, y: pos.y };
    }
  }

  return nearest;
}

function findNearestBounty(world: ECSWorld, x: number, y: number, mapSize: number): EntityId | null {
  const bountyIds = world.query('BountyTarget');
  let nearest: EntityId | null = null;
  let nearestDist = Infinity;

  for (const id of bountyIds) {
    const bounty = world.getComponent<BountyTargetComponent>(id, 'BountyTarget')!;
    if (bounty.bountyStatus !== 'posted') continue;
    const dist = getDistance(x, y, bounty.targetX, bounty.targetY);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = id;
    }
  }

  return nearest;
}

function getSpecializationsForClass(heroClass: string): { a: string; b: string } | null {
  const map: Record<string, { a: string; b: string }> = {
    'Kiox-Bound Fighter': { a: 'Berserker', b: 'Guardian' },
    'Ymzo-Touched Scout': { a: 'Ranger', b: 'Assassin' },
    'Zeeya-Warded Acolyte': { a: 'Priest', b: 'Druid' },
    'Astryx Mage': { a: 'Pyromancer', b: 'Cryomancer' },
    'Kael Archer': { a: 'Sniper', b: 'VolleyArcher' },
    'Vael Paladin': { a: 'Templar', b: 'Avenger' },
    'Faeling Druid': { a: 'Warden', b: 'Stormcaller' },
    'Dwarven Runesmith': { a: 'Runesmith', b: 'Battlehammer' },
  };
  return map[heroClass] || null;
}
