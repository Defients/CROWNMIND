import type { ECSWorld, EntityId } from '../engine';
import type { HealthComponent, RivalSovereignComponent, DiplomacyComponent } from '../engine/Component';
import type { ScenarioConfig, ScenarioObjective } from '../types/scenarios';
import { SCENARIOS } from '../types/scenarios';
import type { GameState } from '../types/game';
import type { Dungeon } from '../types/dungeons';

export function getScenarioById(id: string): ScenarioConfig | undefined {
  return SCENARIOS.find(s => s.id === id);
}

export function checkScenarioObjectives(
  state: GameState,
  world: ECSWorld
): { allMet: boolean; newlyMet: ScenarioObjective[] } {
  const objectives = state.scenarioObjectives;
  if (!objectives || objectives.length === 0) return { allMet: false, newlyMet: [] };

  const newlyMet: ScenarioObjective[] = [];

  for (const obj of objectives) {
    if (isObjectiveMet(obj, state, world)) {
      newlyMet.push(obj);
    }
  }

  const allMet = objectives.every(obj => isObjectiveMet(obj, state, world));
  return { allMet, newlyMet };
}

export function isObjectiveMet(obj: ScenarioObjective, state: GameState, world: ECSWorld): boolean {
  switch (obj.type) {
    case 'destroySpire': {
      if (state.spireEntityId === null) return false;
      const spireHealth = world.getComponent<HealthComponent>(state.spireEntityId, 'Health');
      return !spireHealth || spireHealth.hp <= 0;
    }

    case 'clearDungeons': {
      const cleared = state.dungeons.filter(d => d.status === 'cleared').length;
      return cleared >= obj.target;
    }

    case 'surviveDays': {
      return state.day >= obj.target;
    }

    case 'eliminateRivals': {
      const rivalIds = world.query('RivalSovereign');
      const alive = rivalIds.filter(id => {
        const r = world.getComponent<RivalSovereignComponent>(id, 'RivalSovereign');
        return r && r.isAlive;
      });
      return alive.length === 0;
    }

    case 'reachPopulation': {
      return state.resources.population >= obj.target;
    }

    case 'allyWithFaction': {
      const factionIds = world.query('Faction', 'Diplomacy');
      const allies = factionIds.filter(id => {
        const dip = world.getComponent<DiplomacyComponent>(id, 'Diplomacy');
        return dip && dip.standing > 60;
      });
      return allies.length >= obj.target;
    }

    default:
      return false;
  }
}

export function applyScenarioModifiers(state: GameState, world: ECSWorld, day: number): GameState {
  const config = state.config;
  if (!config.scenarioId) return state;

  const scenario = getScenarioById(config.scenarioId);
  if (!scenario) return state;

  let newState = { ...state };

  for (const modifier of scenario.modifiers) {
    switch (modifier) {
      case 'eternal_winter': {
        newState.season = { current: 'winter', dayInSeason: ((day - 1) % 15) + 1 };
        break;
      }
      case 'stronger_monsters': {
        break;
      }
      case 'no_construction': {
        break;
      }
      case 'damaged_townhall': {
        if (day === 1 && state.townHallEntityId !== null) {
          const th = world.getComponent<HealthComponent>(state.townHallEntityId, 'Health');
          if (th) th.hp = Math.floor(th.maxHp * 0.5);
        }
        break;
      }
      case 'limited_gold': {
        if (day === 1) {
          newState.resources = { ...newState.resources, gold: Math.min(newState.resources.gold, 150) };
        }
        break;
      }
    }
  }

  return newState;
}

export function getEndlessScore(state: GameState): number {
  return state.day * 100 + state.stats.monstersKilledCount * 10 + state.stats.lairsCleared.length * 50;
}

export function getDailyChallengeSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

export function getDailyModifier(date: Date): string {
  const seed = getDailyChallengeSeed(date);
  const modifiers = [
    'All heroes start at level 3',
    'Double monster spawns',
    'Starting gold halved',
    'Heroes gain 2x XP',
    'All lairs are elite',
    'No guard towers',
    'Double mana regen',
    'Heroes start with full courage',
  ];
  return modifiers[seed % modifiers.length];
}
