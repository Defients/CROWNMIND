import type { ECSWorld, EntityId } from '../engine';
import type { DiplomacyComponent, FactionComponent } from '../engine/Component';
import type { Treaty, Quest, DiplomaticAction } from '../types/diplomacy';
import { BALANCE } from '../utils/balance';
import type { SeededRNG } from '../utils/rng';
import type { ResourceState } from '../types/resources';
import { canAfford, spendResources } from '../types/resources';

export function initDiplomacy(world: ECSWorld, entityId: EntityId, initialStanding: number = 0): void {
  world.addComponent(entityId, {
    type: 'Diplomacy', entityId,
    standing: initialStanding,
    atWar: false,
    treatyType: null,
    treatyDuration: 0,
    lastInteractionDay: 0,
  });
}

export function getStanding(world: ECSWorld, entityId: EntityId): number {
  const dip = world.getComponent<DiplomacyComponent>(entityId, 'Diplomacy');
  return dip?.standing ?? 0;
}

export function changeStanding(world: ECSWorld, entityId: EntityId, delta: number): void {
  const dip = world.getComponent<DiplomacyComponent>(entityId, 'Diplomacy');
  if (!dip) return;
  dip.standing = Math.max(-100, Math.min(100, dip.standing + delta));
  if (dip.standing <= -20) dip.atWar = true;
  if (dip.standing > -20) dip.atWar = false;
}

export function performDiplomaticAction(
  world: ECSWorld,
  factionId: EntityId,
  action: DiplomaticAction,
  resources: ResourceState,
  day: number,
  unlockedTechs: string[],
  rng: SeededRNG
): { resources: ResourceState; success: boolean; treaty: Treaty | null; standingChange: number } {
  const dip = world.getComponent<DiplomacyComponent>(factionId, 'Diplomacy');
  if (!dip) return { resources, success: false, treaty: null, standingChange: 0 };

  const diplomacyBonus = unlockedTechs.includes('culturalExchange') ? 10 : 0;

  switch (action) {
    case 'gift': {
      const cost = rng.int(BALANCE.diplomacy.giftMinCost, BALANCE.diplomacy.giftMaxCost);
      if (!canAfford(resources, { gold: cost })) return { resources, success: false, treaty: null, standingChange: 0 };
      const standingChange = rng.int(5, 15) + diplomacyBonus;
      changeStanding(world, factionId, standingChange);
      dip.lastInteractionDay = day;
      return {
        resources: spendResources(resources, { gold: cost }),
        success: true,
        treaty: null,
        standingChange,
      };
    }

    case 'proposeTrade': {
      const cost = 100;
      if (!canAfford(resources, { gold: cost })) return { resources, success: false, treaty: null, standingChange: 0 };
      if (dip.standing < 0) return { resources, success: false, treaty: null, standingChange: 0 };
      const standingChange = 5 + diplomacyBonus;
      changeStanding(world, factionId, standingChange);
      dip.treatyType = 'trade';
      dip.treatyDuration = BALANCE.diplomacy.tradeAgreementDuration;
      dip.lastInteractionDay = day;
      const treaty: Treaty = {
        id: `treaty_trade_${factionId}_${day}`,
        type: 'trade',
        factionId,
        establishedDay: day,
        duration: BALANCE.diplomacy.tradeAgreementDuration,
      };
      return {
        resources: spendResources(resources, { gold: cost }),
        success: true,
        treaty,
        standingChange,
      };
    }

    case 'proposeAlliance': {
      const cost = { gold: 200, mana: 50 };
      if (!canAfford(resources, cost)) return { resources, success: false, treaty: null, standingChange: 0 };
      if (dip.standing < 20) return { resources, success: false, treaty: null, standingChange: 0 };
      const standingChange = 10 + diplomacyBonus;
      changeStanding(world, factionId, standingChange);
      dip.treatyType = 'alliance';
      dip.treatyDuration = BALANCE.diplomacy.allianceDuration;
      dip.lastInteractionDay = day;
      const treaty: Treaty = {
        id: `treaty_alliance_${factionId}_${day}`,
        type: 'alliance',
        factionId,
        establishedDay: day,
        duration: BALANCE.diplomacy.allianceDuration,
      };
      return {
        resources: spendResources(resources, cost),
        success: true,
        treaty,
        standingChange,
      };
    }

    case 'declareWar': {
      changeStanding(world, factionId, -100);
      dip.atWar = true;
      dip.treatyType = 'war';
      dip.lastInteractionDay = day;
      const treaty: Treaty = {
        id: `treaty_war_${factionId}_${day}`,
        type: 'war',
        factionId,
        establishedDay: day,
        duration: 9999,
      };
      return { resources, success: true, treaty, standingChange: -100 };
    }

    case 'requestAid': {
      if (dip.standing < 60) return { resources, success: false, treaty: null, standingChange: 0 };
      dip.lastInteractionDay = day;
      return { resources, success: true, treaty: null, standingChange: 0 };
    }

    case 'proposeNonAggression': {
      const cost = { gold: 80 };
      if (!canAfford(resources, cost)) return { resources, success: false, treaty: null, standingChange: 0 };
      if (dip.standing < -40) return { resources, success: false, treaty: null, standingChange: 0 };
      const standingChange = 5 + diplomacyBonus;
      changeStanding(world, factionId, standingChange);
      dip.treatyType = 'nonAggression';
      dip.treatyDuration = 20;
      dip.lastInteractionDay = day;
      const treaty: Treaty = {
        id: `treaty_nonaggro_${factionId}_${day}`,
        type: 'nonAggression',
        factionId,
        establishedDay: day,
        duration: 20,
      };
      return {
        resources: spendResources(resources, cost),
        success: true,
        treaty,
        standingChange,
      };
    }
  }

  return { resources, success: false, treaty: null, standingChange: 0 };
}

export function processDiplomacyDayRollover(
  world: ECSWorld,
  day: number,
  treaties: Treaty[],
  quests: Quest[],
  rng: SeededRNG
): { treaties: Treaty[]; quests: Quest[]; newQuests: Quest[]; resourceGains: Partial<ResourceState> } {
  const factionIds = world.query('Faction', 'Diplomacy');
  const newQuests: Quest[] = [];
  const resourceGains: Partial<ResourceState> = { gold: 0, wood: 0, stone: 0, food: 0, mana: 0 };

  for (const fid of factionIds) {
    const dip = world.getComponent<DiplomacyComponent>(fid, 'Diplomacy')!;
    const faction = world.getComponent<FactionComponent>(fid, 'Faction')!;

    if (day - dip.lastInteractionDay > 0) {
      const decay = BALANCE.diplomacy.standingDecayPerDay;
      if (dip.standing > 0) {
        dip.standing = Math.max(0, dip.standing - decay);
      } else if (dip.standing < 0) {
        dip.standing = Math.min(0, dip.standing + decay);
      }
    }

    if (dip.treatyType === 'trade' && dip.treatyDuration > 0) {
      dip.treatyDuration--;
      if (faction.tradeResource && faction.tradeAmount) {
        const tradeBonus = 1;
        const key = faction.tradeResource as keyof ResourceState;
        (resourceGains[key] as number) = (resourceGains[key] || 0) + faction.tradeAmount * tradeBonus;
      }
    }

    if (dip.treatyType === 'alliance' && dip.treatyDuration > 0) {
      dip.treatyDuration--;
    }

    if (dip.treatyType === 'nonAggression' && dip.treatyDuration > 0) {
      dip.treatyDuration--;
    }
  }

  const expiredTreaties = treaties.filter(t => {
    if (t.type === 'war') return false;
    const dip = world.getComponent<DiplomacyComponent>(t.factionId, 'Diplomacy');
    return dip && dip.treatyDuration <= 0;
  });
  const activeTreaties = treaties.filter(t => !expiredTreaties.includes(t));

  for (const t of expiredTreaties) {
    const dip = world.getComponent<DiplomacyComponent>(t.factionId, 'Diplomacy');
    if (dip) dip.treatyType = null;
  }

  const expiredQuests = quests.filter(q => q.status === 'active' && day > q.dayExpires);
  for (const q of expiredQuests) {
    q.status = 'failed';
    const dip = world.getComponent<DiplomacyComponent>(q.factionId, 'Diplomacy');
    if (dip) changeStanding(world, q.factionId, -10);
  }

  for (const fid of factionIds) {
    const dip = world.getComponent<DiplomacyComponent>(fid, 'Diplomacy')!;
    if (dip.standing > 20 && day % BALANCE.diplomacy.questInterval === 0) {
      const hasActiveQuest = quests.some(q => q.factionId === fid && q.status === 'active');
      if (!hasActiveQuest && rng.chance(0.5)) {
        const quest = generateQuest(fid, day, rng);
        newQuests.push(quest);
      }
    }
  }

  return { treaties: activeTreaties, quests: [...quests, ...newQuests], newQuests, resourceGains };
}

function generateQuest(factionId: EntityId, day: number, rng: SeededRNG): Quest {
  const types = ['Clear nearby lair', 'Escort trader', 'Defend from raid', 'Gather resources'];
  const questType = rng.pick(types);
  const rewards = {
    gold: rng.int(50, 200),
    mana: rng.int(5, 30),
    standingChange: rng.int(5, 15),
  };

  return {
    id: `quest_${factionId}_${day}`,
    factionId,
    type: questType,
    description: `${questType} for the faction.`,
    objective: questType,
    reward: rewards,
    status: 'available',
    dayIssued: day,
    dayExpires: day + BALANCE.diplomacy.questExpiry,
  };
}

export function acceptQuest(quest: Quest): Quest {
  return { ...quest, status: 'active' };
}

export function completeQuest(
  world: ECSWorld,
  quest: Quest,
  resources: ResourceState,
  day: number
): { quest: Quest; resources: ResourceState } {
  const reward = quest.reward;
  let newResources = { ...resources };

  if (reward.gold) newResources.gold += reward.gold;
  if (reward.mana) newResources.mana += reward.mana;

  if (reward.standingChange) {
    changeStanding(world, quest.factionId, reward.standingChange);
  }

  return { quest: { ...quest, status: 'completed' }, resources: newResources };
}
