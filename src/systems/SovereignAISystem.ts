import type { ECSWorld, EntityId } from '../engine';
import type { PositionComponent, HealthComponent, BuildingComponent, LairComponent, HeroAIComponent, MonsterAIComponent, CombatComponent, NameComponent, BountyTargetComponent, SquadMemberComponent } from '../engine/Component';
import type { GameState, SovereignMind, SovereignPhaseType, SovereignDecision, SovereignMemory, GameLog, Milestone } from '../types/game';
import type { ResourceState, ResourceCapacity } from '../types/resources';
import type { Difficulty } from '../types/game';
import type { SeededRNG } from '../utils/rng';
import { DIFFICULTY_MODIFIERS } from '../types/game';
import { BALANCE } from '../utils/balance';
import { HERO_CLASSES } from '../types/heroes';
import type { HeroClass } from '../types/heroes';
import { getTechById, canResearch, getAvailableTechs } from '../types/tech';
import { canAfford, spendResources, addResources } from '../types/resources';
import { generateHeroName } from '../utils/nameGenerator';
import { createHeroEntity, getTownHallPosition } from '../utils/worldGenerator';
import { getDistance } from '../utils/pathfinding';
import { performDiplomaticAction } from './DiplomacySystem';
import { autoAllocateSkillPoints } from './SkillTreeSystem';
import { autoEquipBestItems } from './EquipmentSystem';
import type { DiplomacyComponent } from '../engine/Component';

let logCounter = 0;
function makeLog(day: number, text: string, type: GameLog['type']): GameLog {
  return { id: `blog_${logCounter++}`, day, text, type };
}

let milestoneCounter = 0;
function makeMilestone(day: number, type: string, text: string): Milestone {
  return { id: `bms_${milestoneCounter++}`, day, type, text };
}

const BOT_LINES: Record<SovereignPhaseType, string[]> = {
  opening: ['Gold is thin. I am holding the line.', 'A Shrine now prevents a funeral later.'],
  scouting: ['The fog hides teeth. I will send eyes.', 'Knowledge is cheaper than resurrection.'],
  stabilizing: ['The treasury breathes. Good.', 'Infrastructure is a weapon that does not dull.'],
  expanding: ['Resources flow. The realm grows stronger.', 'Multiple fronts require multiple solutions.'],
  fortifying: ['Steel and stone. The realm thickens.', 'A Guard Tower costs less than a burned Town Hall.'],
  hunting: ['The lairs know we are coming.', 'Threat pressure falls when spawners fall.'],
  spirePreparation: ['The Spire stirs. We must be ready.', 'Spirebreaker Arms — without them, we chip paint.'],
  finalAssault: ['All forces converge. Today we end it.', 'No more patience. Only steel.'],
  emergency: ['The walls bleed gold. I must act now!', 'Desperation is a poor strategist but an effective one.'],
};

interface BotInput {
  world: ECSWorld;
  day: number;
  resources: ResourceState;
  resourceCapacity: ResourceCapacity;
  realmStability: number;
  threatPressure: number;
  sovereignMind: SovereignMind;
  unlockedTechs: string[];
  currentResearch: string | null;
  researchProgress: number;
  researchCost: { gold: number; mana: number };
  rng: SeededRNG;
  difficulty: Difficulty;
  playerInterventions: number;
  townHallEntityId: EntityId | null;
  spireEntityId: EntityId | null;
}

interface BotOutput {
  resources: ResourceState;
  sovereignMind: SovereignMind;
  unlockedTechs: string[];
  currentResearch: string | null;
  researchProgress: number;
  researchCost: { gold: number; mana: number };
  logs: GameLog[];
  milestones: Milestone[];
}

export function runSovereignBotAI(input: BotInput): BotOutput {
  const { world, rng, difficulty } = input;
  const diffMods = DIFFICULTY_MODIFIERS[difficulty];
  let resources = { ...input.resources };
  let sovereignMind = { ...input.sovereignMind };
  let unlockedTechs = [...input.unlockedTechs];
  let currentResearch = input.currentResearch;
  let researchProgress = input.researchProgress;
  let researchCost = { ...input.researchCost };
  const logs: GameLog[] = [];
  const milestones: Milestone[] = [];

  const buildingIds = world.query('Building');
  const heroIds = world.query('HeroAI');
  const lairIds = world.query('Lair');
  const monsterIds = world.query('MonsterAI');

  const isBuilt = (type: string) => {
    for (const id of buildingIds) {
      const b = world.getComponent<BuildingComponent>(id, 'Building');
      if (b && b.buildingType === type && b.isBuilt) return true;
    }
    return false;
  };

  let fighters = 0, scouts = 0, acolytes = 0, mages = 0, archers = 0, paladins = 0, druids = 0, runesmiths = 0;
  for (const id of heroIds) {
    const h = world.getComponent<HeroAIComponent>(id, 'HeroAI')!;
    const health = world.getComponent<HealthComponent>(id, 'Health');
    if (!health || health.hp <= 0) continue;
    switch (h.heroClass) {
      case 'Kiox-Bound Fighter': fighters++; break;
      case 'Ymzo-Touched Scout': scouts++; break;
      case 'Zeeya-Warded Acolyte': acolytes++; break;
      case 'Astryx Mage': mages++; break;
      case 'Kael Archer': archers++; break;
      case 'Vael Paladin': paladins++; break;
      case 'Faeling Druid': druids++; break;
      case 'Dwarven Runesmith': runesmiths++; break;
    }
  }
  const totalHeroes = fighters + scouts + acolytes + mages + archers + paladins + druids + runesmiths;

  let spireDiscovered = false;
  let spireHpPercent = 1;
  let allMinorLairsCleared = true;
  for (const id of lairIds) {
    const lair = world.getComponent<LairComponent>(id, 'Lair')!;
    if (lair.lairName === 'The Veylthyr Spire') {
      spireDiscovered = lair.isDiscovered;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;
      spireHpPercent = health.hp / health.maxHp;
    } else {
      if (!lair.isDestroyed) allMinorLairsCleared = false;
    }
  }

  let townHallHpPercent = 1;
  if (input.townHallEntityId !== null) {
    const thHealth = world.getComponent<HealthComponent>(input.townHallEntityId, 'Health');
    if (thHealth) townHallHpPercent = thHealth.hp / thHealth.maxHp;
  }

  const raidingCount = monsterIds.filter(id => {
    const m = world.getComponent<MonsterAIComponent>(id, 'MonsterAI')!;
    return m.status === 'raiding';
  }).length;

  const isEmergency = townHallHpPercent < 0.6 || (raidingCount >= 2 && input.realmStability < 50);

  let phase: SovereignPhaseType;
  if (isEmergency) {
    phase = 'emergency';
  } else if (spireDiscovered && spireHpPercent < 0.5) {
    phase = 'finalAssault';
  } else if (spireDiscovered && allMinorLairsCleared) {
    phase = 'spirePreparation';
  } else if (isBuilt('Blacksmith') && isBuilt('ZeeyaShrine') && totalHeroes >= 4) {
    phase = 'hunting';
  } else if (isBuilt('Market') && isBuilt('ZeeyaShrine')) {
    phase = 'fortifying';
  } else if (isBuilt('WarriorGuild') && totalHeroes >= 2) {
    phase = 'expanding';
  } else if (isBuilt('WarriorGuild') && totalHeroes >= 1) {
    phase = 'scouting';
  } else {
    phase = 'opening';
  }

  const reserveByPhase: Record<SovereignPhaseType, number> = {
    opening: 100, scouting: 100, stabilizing: 150, expanding: 150,
    fortifying: 200, hunting: 200, spirePreparation: 250, finalAssault: 0, emergency: 0,
  };
  sovereignMind.emergencyReserve = reserveByPhase[phase];
  const reserve = sovereignMind.emergencyReserve;
  const canSpend = (cost: Partial<ResourceState>) => {
    if (isEmergency) return canAfford(resources, cost);
    const afterSpend = spendResources(resources, cost);
    return afterSpend.gold >= reserve;
  };

  const phaseSliders: Record<SovereignPhaseType, { fear: number; econ: number; military: number; spire: number; conf: number }> = {
    opening: { fear: 15, econ: 60, military: 30, spire: 5, conf: 55 },
    scouting: { fear: 20, econ: 55, military: 35, spire: 10, conf: 60 },
    stabilizing: { fear: 25, econ: 50, military: 45, spire: 15, conf: 65 },
    expanding: { fear: 30, econ: 45, military: 50, spire: 20, conf: 68 },
    fortifying: { fear: 35, econ: 35, military: 60, spire: 30, conf: 70 },
    hunting: { fear: 40, econ: 25, military: 75, spire: 50, conf: 72 },
    spirePreparation: { fear: 50, econ: 15, military: 85, spire: 70, conf: 75 },
    finalAssault: { fear: 55, econ: 5, military: 95, spire: 95, conf: 80 },
    emergency: { fear: 85, econ: 5, military: 95, spire: 100, conf: 45 },
  };
  const sl = { ...phaseSliders[phase] };
  if (monsterIds.length > 3) sl.fear = Math.min(100, sl.fear + 20);

  sovereignMind.phase = phase;
  sovereignMind.fearLevel = sl.fear;
  sovereignMind.economyPriority = sl.econ;
  sovereignMind.militaryReadiness = sl.military;
  sovereignMind.finalLairReadiness = sl.spire;
  sovereignMind.confidence = sl.conf;

  if (spireDiscovered) {
    const livingHeroes = heroIds.filter(id => {
      const h = world.getComponent<HealthComponent>(id, 'Health');
      return h && h.hp > 0;
    });
    const avgHp = livingHeroes.length > 0 ? livingHeroes.reduce((s, id) => {
      const h = world.getComponent<HealthComponent>(id, 'Health')!;
      return s + h.hp / h.maxHp;
    }, 0) / livingHeroes.length : 0;
    const hasUpgrades = unlockedTechs.length;
    const readiness = Math.min(100, Math.round(
      (livingHeroes.length / 5) * 30 + avgHp * 20 + (hasUpgrades / 6) * 25 + (resources.gold / 300) * 15 + 10
    ));
    const tier = readiness >= 80 ? 'Ready' : readiness >= 50 ? 'Not Ready' : 'Desperate';
    sovereignMind.spireReadinessText = `Spire Readiness: ${readiness}% — ${tier}`;
  } else {
    sovereignMind.spireReadinessText = 'Spire not yet discovered. Focus on survival first.';
  }

  const recordDecision = (actionType: string, actionLabel: string, reason: string, expectedBenefit: string, risk?: string) => {
    const decision: SovereignDecision = {
      day: input.day, tick: input.day, phase, actionType, actionLabel, reason, expectedBenefit, risk,
      goldBefore: resources.gold, confidence: sovereignMind.confidence,
    };
    sovereignMind.recentDecisions = [...sovereignMind.recentDecisions.slice(-9), decision];
  };

  const recordMemory = (type: SovereignMemory['type'], title: string, description: string, importance: number) => {
    const mem: SovereignMemory = { id: `mem_${input.day}_${type}`, day: input.day, type, title, description, importance };
    sovereignMind.strategicMemory = [...sovereignMind.strategicMemory.filter(m => m.id !== mem.id), mem]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8);
  };

  const lines = BOT_LINES[phase];
  if (lines.length > 0 && rng.chance(0.3)) {
    const line = rng.pick(lines);
    if (!sovereignMind.botThoughts.includes(line)) {
      sovereignMind.botThoughts = [...sovereignMind.botThoughts.slice(-3), line];
    }
  }

  if (!isBuilt('WarriorGuild')) sovereignMind.savingFor = 'Warrior Guild';
  else if (!isBuilt('RangerLodge')) sovereignMind.savingFor = 'Ranger Lodge';
  else if (!isBuilt('LumberMill')) sovereignMind.savingFor = 'Lumber Mill';
  else if (!isBuilt('Quarry')) sovereignMind.savingFor = 'Quarry';
  else if (!isBuilt('Farm')) sovereignMind.savingFor = 'Farm';
  else if (!isBuilt('Market')) sovereignMind.savingFor = 'Market';
  else if (!isBuilt('ZeeyaShrine')) sovereignMind.savingFor = 'Zeeya Shrine';
  else if (!isBuilt('Blacksmith')) sovereignMind.savingFor = 'Blacksmith';
  else if (!isBuilt('GuardTower')) sovereignMind.savingFor = 'Guard Tower';
  else if (!isBuilt('ManaWell')) sovereignMind.savingFor = 'Mana Well';
  else sovereignMind.savingFor = 'Upgrades & Tech';

  const townHallPos = input.townHallEntityId !== null
    ? world.getComponent<PositionComponent>(input.townHallEntityId, 'Position')
    : null;
  const thPos = townHallPos ?? { x: 12, y: 32 };

  const tryBuild = (buildingType: string, cost: Partial<ResourceState>, name: string, reason: string, benefit: string, risk?: string) => {
    if (!canSpend(cost)) return false;
    const existing = buildingIds.find(id => {
      const b = world.getComponent<BuildingComponent>(id, 'Building');
      return b && b.buildingType === buildingType;
    });
    if (existing) {
      const b = world.getComponent<BuildingComponent>(existing, 'Building')!;
      if (b.isBuilt) return false;
      b.isBuilt = true;
      resources = spendResources(resources, cost);
      sovereignMind.nextAction = `Completed ${name}.`;
      sovereignMind.reason = reason;
      recordDecision('build', name, reason, benefit, risk);
      recordMemory('success', `${name} built`, `${name} construction completed.`, 7);
      logs.push(makeLog(input.day, `Sovereign built ${name}.`, 'sovereign'));
      return true;
    }
    return false;
  };

  const tryHire = (heroClass: HeroClass, cost: Partial<ResourceState>, reason: string, benefit: string) => {
    if (!canSpend(cost)) return false;
    const name = generateHeroName(heroClass, rng);
    const heroId = createHeroEntity(world, heroClass, name, thPos.x + rng.float(-2, 2), thPos.y + rng.float(-2, 2), rng, diffMods.heroCourageBonus);
    resources = spendResources(resources, cost);
    sovereignMind.nextAction = `Hired ${name} (${heroClass}).`;
    sovereignMind.reason = reason;
    recordDecision('hire', `${heroClass} hire`, reason, benefit);
    logs.push(makeLog(input.day, `Sovereign hired ${name} as ${heroClass}.`, 'sovereign'));
    return true;
  };

  const tryResearch = (techId: string) => {
    if (currentResearch !== null) return false;
    if (unlockedTechs.includes(techId)) return false;
    if (!canResearch(techId, unlockedTechs, input.day)) return false;
    const tech = getTechById(techId);
    if (!tech) return false;
    if (!canAfford(resources, tech.cost)) return false;
    resources = spendResources(resources, tech.cost);
    currentResearch = techId;
    researchProgress = 0;
    researchCost = { ...tech.cost };
    sovereignMind.nextAction = `Researching ${tech.name}.`;
    sovereignMind.reason = tech.description;
    recordDecision('upgrade', `Research: ${tech.name}`, tech.description, tech.description);
    logs.push(makeLog(input.day, `Sovereign started researching ${tech.name}.`, 'research'));
    return true;
  };

  const tryBounty = (targetLairId: EntityId, amount: number, bountyName: string, reason: string) => {
    const cost: Partial<ResourceState> = { gold: amount };
    if (!canSpend(cost)) return false;
    const lair = world.getComponent<LairComponent>(targetLairId, 'Lair')!;
    const lairPos = world.getComponent<PositionComponent>(targetLairId, 'Position')!;
    const bountyId = world.createEntity();
    world.addComponent(bountyId, {
      type: 'BountyTarget', entityId: bountyId,
      bountyType: 'Combat', targetEntityId: targetLairId,
      targetX: lairPos.x, targetY: lairPos.y,
      rewardGold: amount, bountyName, bountyStatus: 'posted', placedBy: 'sovereign',
    });
    resources = spendResources(resources, cost);
    sovereignMind.nextAction = `Placed ${amount}g bounty on ${lair.lairName}.`;
    sovereignMind.reason = reason;
    recordDecision('bounty', `Bounty on ${lair.lairName} (${amount}g)`, reason, 'Reduce threat + clear spawner');
    logs.push(makeLog(input.day, `Sovereign placed ${amount}g bounty on ${lair.lairName}.`, 'bounty'));
    return true;
  };

  if (phase === 'emergency') {
    sovereignMind.currentPlan = 'EMERGENCY: Town Hall under threat! All resources redirected to defense!';
    if (canSpend({ gold: 90, food: 10 }) && fighters < 3 && isBuilt('WarriorGuild')) {
      tryHire('Kiox-Bound Fighter', { gold: 90, food: 10 }, 'Emergency fighter for defense', 'Combat power for defense');
    } else if (canSpend({ gold: 100, mana: 15 }) && acolytes < 2 && isBuilt('ZeeyaShrine')) {
      tryHire('Zeeya-Warded Acolyte', { gold: 100, mana: 15 }, 'Emergency healer', 'Healing during crisis');
    } else {
      sovereignMind.nextAction = 'Gathering energy for tactical interventions.';
      sovereignMind.reason = 'Watching the Town Hall. Will support heroes near it.';
    }
    if (!sovereignMind.strategicMemory.find(m => m.type === 'threat' && m.day === input.day)) {
      recordMemory('threat', 'Emergency declared', `Town Hall at ${Math.round(townHallHpPercent * 100)}% HP with ${raidingCount} raiders.`, 9);
    }
  } else if (phase === 'finalAssault') {
    sovereignMind.currentPlan = 'Sieging the Veylthyr Spire. All forces converge!';
    if (input.spireEntityId !== null) {
      const spireLair = world.getComponent<LairComponent>(input.spireEntityId, 'Lair')!;
      if (spireLair && !spireLair.isDestroyed) {
        const hasBounty = world.query('BountyTarget').some(id => {
          const b = world.getComponent<BountyTargetComponent>(id, 'BountyTarget')!;
          return b.targetEntityId === input.spireEntityId;
        });
        if (!hasBounty && canSpend({ gold: 150 })) {
          tryBounty(input.spireEntityId, Math.min(resources.gold, 200), 'Final Assault: Collapse Veylthyr Spire', 'All heroes must converge on the Spire!');
          recordMemory('milestone', 'Final assault begun', 'Final bounty placed on the Veylthyr Spire.', 10);
        }
      }
    }
    if (canSpend({ gold: 90, food: 10 }) && fighters < 3 && isBuilt('WarriorGuild')) {
      tryHire('Kiox-Bound Fighter', { gold: 90, food: 10 }, 'Fighter for final assault', 'More damage on Spire');
    }
  } else {
    const buildOrder: Array<{ type: string; cost: Partial<ResourceState>; name: string; reason: string; benefit: string; risk?: string }> = [
      { type: 'WarriorGuild', cost: { gold: 120, wood: 20 }, name: 'Warrior Guild', reason: 'Required to recruit fighters.', benefit: 'Unlocks Fighter hiring', risk: 'Early gold investment' },
      { type: 'RangerLodge', cost: { gold: 100, wood: 30 }, name: 'Ranger Lodge', reason: 'Scouts needed to explore and find lairs.', benefit: 'Unlocks Scout hiring' },
      { type: 'LumberMill', cost: { gold: 60, wood: 30 }, name: 'Lumber Mill', reason: 'Wood production for construction.', benefit: '+8 wood/day' },
      { type: 'Quarry', cost: { gold: 80, wood: 20 }, name: 'Quarry', reason: 'Stone production for fortifications.', benefit: '+6 stone/day' },
      { type: 'Farm', cost: { gold: 50, wood: 20 }, name: 'Farm', reason: 'Food production for hero upkeep.', benefit: '+10 food/day' },
      { type: 'Market', cost: { gold: 150, wood: 40, stone: 10 }, name: 'Grand Market', reason: 'Market secures daily gold generation.', benefit: 'Daily income boost' },
      { type: 'ZeeyaShrine', cost: { gold: 140, wood: 10, stone: 20 }, name: 'Zeeya Shrine', reason: 'Acolyte healers needed for combat.', benefit: 'Unlocks Acolyte hiring' },
      { type: 'Blacksmith', cost: { gold: 180, wood: 20, stone: 40 }, name: 'Blacksmith', reason: 'Weapon upgrades required for Spire.', benefit: 'Unlocks upgrades' },
      { type: 'GuardTower', cost: { gold: 90, wood: 15, stone: 25 }, name: 'Guard Tower', reason: 'Defense against raids.', benefit: 'Automated defense' },
      { type: 'ManaWell', cost: { gold: 120, wood: 10, stone: 50 }, name: 'Mana Well', reason: 'Mana for spells and research.', benefit: '+5 mana/day' },
      { type: 'Housing', cost: { gold: 70, wood: 30, stone: 10 }, name: 'Housing', reason: 'Population cap for more heroes.', benefit: '+5 population' },
      { type: 'AdventurersGuild', cost: { gold: 140, wood: 20, stone: 10 }, name: "Adventurer's Guild", reason: 'Enables dungeon expeditions.', benefit: 'Unlock dungeon system' },
      { type: 'Embassy', cost: { gold: 180, wood: 0, stone: 30 }, name: 'Embassy', reason: 'Enables diplomatic relations.', benefit: 'Unlock diplomacy system' },
      { type: 'Armory', cost: { gold: 160, wood: 20, stone: 30 }, name: 'Armory', reason: 'Equipment upgrades for heroes.', benefit: 'Better equipment' },
      { type: 'EnchantersTower', cost: { gold: 200, wood: 10, stone: 0 }, name: "Enchanter's Tower", reason: 'Magical equipment enhancements.', benefit: 'Enchant items' },
    ];

    let acted = false;
    for (const item of buildOrder) {
      if (!isBuilt(item.type)) {
        if (tryBuild(item.type, item.cost, item.name, item.reason, item.benefit, item.risk)) {
          acted = true;
          break;
        }
        break;
      }
    }

    if (!acted) {
      if (fighters < 1 && isBuilt('WarriorGuild')) {
        acted = tryHire('Kiox-Bound Fighter', { gold: 90, food: 10 }, 'First fighter for early defense.', 'Early defense');
      } else if (scouts < 1 && isBuilt('RangerLodge')) {
        acted = tryHire('Ymzo-Touched Scout', { gold: 80, food: 8 }, 'First scout for exploration.', 'Map exploration');
      } else if (fighters < 2 && isBuilt('WarriorGuild')) {
        acted = tryHire('Kiox-Bound Fighter', { gold: 90, food: 10 }, 'Second fighter for combat power.', 'Increased combat capacity');
      } else if (acolytes < 1 && isBuilt('ZeeyaShrine')) {
        acted = tryHire('Zeeya-Warded Acolyte', { gold: 100, mana: 15 }, 'Healer for squad support.', 'Healing support');
      } else if (mages < 1 && isBuilt('Blacksmith') && totalHeroes >= 4) {
        acted = tryHire('Astryx Mage', { gold: 120, mana: 20 }, 'Mage for ranged DPS.', 'High damage output');
      } else if (archers < 1 && isBuilt('Blacksmith') && totalHeroes >= 4) {
        acted = tryHire('Kael Archer', { gold: 100, wood: 15 }, 'Archer for ranged attacks.', 'Long-range DPS');
      } else if (paladins < 1 && isBuilt('ZeeyaShrine') && totalHeroes >= 5) {
        acted = tryHire('Vael Paladin', { gold: 130, mana: 10, food: 10 }, 'Paladin for tank/heal hybrid.', 'Frontline durability');
      } else if (druids < 1 && isBuilt('ZeeyaShrine') && totalHeroes >= 5) {
        acted = tryHire('Faeling Druid', { gold: 110, mana: 15, food: 5 }, 'Druid for nature buffs and terrain control.', 'AoE buffs and healing');
      } else if (runesmiths < 1 && isBuilt('Blacksmith') && totalHeroes >= 6) {
        acted = tryHire('Dwarven Runesmith', { gold: 120, stone: 15, food: 8 }, 'Runesmith for durable frontline DPS.', 'Tank/DPS hybrid with runes');
      }
    }

    if (!acted && currentResearch === null) {
      const available = getAvailableTechs(unlockedTechs, input.day);
      if (available.length > 0) {
        const priorityOrder = ['caravanPact', 'tradeRoutes', 'ironEdge', 'wardedMail', 'zeeyasMercy', 'spirebreakerArms', 'heroTraining', 'guardTowerRange', 'reinforcedWalls', 'caravanPact', 'spellAmplification', 'rallyAura', 'manaEfficiency', 'banking', 'industrialMills', 'sentryNetwork', 'fortifications', 'warCollege', 'eliteGuard', 'grandBazaar', 'treasuryVault', 'timeWarp', 'arcaneStorm', 'aegisBarrier', 'lastStand', 'culturalExchange', 'cartography', 'tradeMastery', 'dungeonLore', 'treasureHunter', 'coalitionFormation', 'grandAlliance', 'ancientKnowledge'];
        for (const techId of priorityOrder) {
          if (available.find(t => t.id === techId)) {
            acted = tryResearch(techId);
            if (acted) break;
          }
        }
      }
    }

    if (!acted) {
      const factionIds = world.query('Faction', 'Diplomacy');
      for (const fid of factionIds) {
        const dip = world.getComponent<DiplomacyComponent>(fid, 'Diplomacy');
        if (!dip) continue;
        if (dip.standing < 20 && canSpend({ gold: 80 })) {
          const result = performDiplomaticAction(world, fid, 'gift', resources, input.day, unlockedTechs, rng);
          if (result.success) {
            resources = result.resources;
            sovereignMind.nextAction = `Sent gift to faction (${result.standingChange > 0 ? '+' : ''}${result.standingChange} standing).`;
            sovereignMind.reason = 'Improving diplomatic relations.';
            recordDecision('diplomacy', 'Gift to faction', 'Improve standing', 'Better trade and alliance options');
            logs.push(makeLog(input.day, `Sovereign sent a gift to a faction. Standing ${result.standingChange > 0 ? '+' : ''}${result.standingChange}.`, 'diplomacy'));
            acted = true;
            break;
          }
        }
        if (dip.standing >= 20 && dip.standing < 60 && !dip.treatyType && canSpend({ gold: 100 })) {
          const result = performDiplomaticAction(world, fid, 'proposeTrade', resources, input.day, unlockedTechs, rng);
          if (result.success) {
            resources = result.resources;
            sovereignMind.nextAction = `Established trade agreement.`;
            sovereignMind.reason = 'Trade brings resources.';
            recordDecision('diplomacy', 'Trade agreement', 'Secure resource flow', 'Daily resource bonus');
            logs.push(makeLog(input.day, `Sovereign established a trade agreement.`, 'diplomacy'));
            acted = true;
            break;
          }
        }
        if (dip.standing >= 60 && dip.treatyType !== 'alliance' && canSpend({ gold: 200, mana: 50 })) {
          const result = performDiplomaticAction(world, fid, 'proposeAlliance', resources, input.day, unlockedTechs, rng);
          if (result.success) {
            resources = result.resources;
            sovereignMind.nextAction = `Formed alliance!`;
            sovereignMind.reason = 'Alliance strengthens the realm.';
            recordDecision('diplomacy', 'Alliance formed', 'Military and economic alliance', 'Faction military aid');
            recordMemory('milestone', 'Alliance formed', `Alliance established with a faction.`, 8);
            logs.push(makeLog(input.day, `Sovereign formed an alliance with a faction!`, 'diplomacy'));
            acted = true;
            break;
          }
        }
      }
    }

    if (!acted) {
      const unbountiedLair = lairIds.find(id => {
        const lair = world.getComponent<LairComponent>(id, 'Lair')!;
        if (!lair.isDiscovered || lair.isDestroyed || lair.lairName === 'The Veylthyr Spire') return false;
        return !world.query('BountyTarget').some(bid => {
          const b = world.getComponent<BountyTargetComponent>(bid, 'BountyTarget')!;
          return b.targetEntityId === id;
        });
      });
      if (unbountiedLair !== undefined && canSpend({ gold: 80 })) {
        const lair = world.getComponent<LairComponent>(unbountiedLair, 'Lair')!;
        const amount = lair.threatLevel === 'low' ? 60 : lair.threatLevel === 'medium' ? 80 : 100;
        acted = tryBounty(unbountiedLair, Math.floor(amount * diffMods.bountyCostMultiplier), `Clear ${lair.lairName}`, 'Destroying spawners decreases threat.');
      }
    }

    if (!acted) {
      const planByPhase: Record<SovereignPhaseType, string> = {
        opening: 'Establish Pyahhold foothold. Seek minor threats.',
        scouting: 'Scouts exploring the fog. Building infrastructure.',
        stabilizing: 'Expanding territory. Clear local nests.',
        expanding: 'Multi-resource economy setup. Tech research begins.',
        fortifying: 'Preparing arsenal and healer squads.',
        hunting: 'Hunting discovered lairs. Clearing threats.',
        spirePreparation: 'All preparation focused on Spire readiness.',
        finalAssault: 'Sieging the Veylthyr Spire.',
        emergency: 'EMERGENCY: All resources to defense!',
      };
      sovereignMind.currentPlan = planByPhase[phase];
      sovereignMind.nextAction = 'Conserving resources and monitoring hero statuses.';
      sovereignMind.reason = 'No active structural needs. Saving for future investments.';
      recordDecision('wait', 'Conserve resources', sovereignMind.reason, 'Build reserves');
    }
  }

  sovereignMind.botThoughts = [
    `Treasury: ${resources.gold}g, Wood: ${resources.wood}, Stone: ${resources.stone}, Food: ${resources.food}, Mana: ${resources.mana}.`,
    `Stability: ${Math.round(input.realmStability)}%, Threat: ${Math.round(input.threatPressure)}%.`,
    `Heroes: ${totalHeroes} (F:${fighters} S:${scouts} A:${acolytes} M:${mages} R:${archers} P:${paladins} D:${druids} R:${runesmiths}).`,
    `Phase: ${phase}, Research: ${currentResearch ?? 'none'}.`,
    ...sovereignMind.botThoughts.slice(-2),
  ].slice(0, 6);

  return {
    resources,
    sovereignMind,
    unlockedTechs,
    currentResearch,
    researchProgress,
    researchCost,
    logs,
    milestones,
  };
}
