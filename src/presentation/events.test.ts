import { describe, it, expect } from 'vitest';
import { initializeGame } from '../utils/worldGenerator';
import {
  component,
  decisionId,
  isObserved,
  positionOf,
  PresentationEventDeriver,
  resolveDecisionTarget,
} from './events';
import { deriveTheme, noise } from './theme';
import type { GameConfig, SovereignDecision } from '../types/game';
import { useUIStore } from '../stores/uiStore';

const config: GameConfig = {
  seed: 42,
  seedString: 'presentation-tests',
  biome: 'temperate',
  difficulty: 'standard',
  gameMode: 'observer',
  mapSize: 'small',
  timeLimit: 60,
};
const game = () => initializeGame(config);
describe('semantic presentation contract', () => {
  it('does not replay events when mounting a saved kingdom, or rendering the same snapshot twice', () => {
    const state = game(),
      deriver = new PresentationEventDeriver();
    expect(deriver.derive(state)).toEqual([]);
    expect(deriver.derive(state)).toEqual([]);
  });
  it('detects transitions even if an existing component object was mutated by a tick', () => {
    const state = game(),
      deriver = new PresentationEventDeriver();
    deriver.derive(state);
    const heroId = Number(
      Object.keys(state.world.entities).find((id) => component(state, Number(id), 'HeroAI'))
    );
    component(state, heroId, 'HeroAI')!.level++;
    const events = deriver.derive(state);
    expect(events.filter((e) => e.kind === 'progression')).toHaveLength(1);
    expect(events.find((e) => e.kind === 'progression')?.entityId).toBe(heroId);
    expect(deriver.derive(state)).toEqual([]);
  });
  it('emits construction, research, hero loss, raid, discovery, and terminal events from actual transitions', () => {
    const initial = game(),
      d = new PresentationEventDeriver();
    d.derive(initial);
    const state = structuredClone(initial);
    state.timeOfDay += 10;
    const id = state.townHallEntityId!;
    component(initial, id, 'Building')!.isBuilt = false;
    const construction = new PresentationEventDeriver();
    construction.derive(initial);
    expect(construction.derive(state).some((e) => e.kind === 'construction')).toBe(true);
    component(state, state.spireEntityId!, 'Lair')!.isDiscovered = true;
    const heroId = Number(
      Object.keys(state.world.entities).find((id) => component(state, Number(id), 'HeroAI'))
    );
    component(state, heroId, 'Health')!.hp = 0;
    state.unlockedTechs.push('test-research');
    state.gameStatus = 'won';
    state.raidWarning = {
      active: true,
      sourceLairId: state.spireEntityId!,
      sourceLairName: 'The Veylthyr Spire',
      monsterCount: 7,
      day: state.day,
    };
    const events = d.derive(state);
    expect(events.map((e) => e.kind)).toEqual(
      expect.arrayContaining(['research', 'death', 'raid', 'discovery', 'victory'])
    );
    expect(events[0].priority).toBe(100);
  });
  it('resets its baseline on backward time and different seeds', () => {
    const d = new PresentationEventDeriver(),
      state = game();
    state.day = 20;
    d.derive(state);
    expect(d.derive(game())).toEqual([]);
    const other = game();
    other.config = { ...config, seedString: 'other' };
    other.gameStatus = 'lost';
    expect(d.derive(other)).toEqual([]);
  });
  it('does not disclose undiscovered Spire coordinates or invent decision targets', () => {
    const state = game(),
      id = state.spireEntityId!;
    expect(isObserved(state, id)).toBe(false);
    expect(deriveTheme(state).corruptionIntensity).toBe(0);
    const decision: SovereignDecision = {
      day: 1,
      tick: 1,
      phase: 'opening',
      actionType: 'build',
      actionLabel: 'Build Imaginary Palace',
      reason: 'Recorded reason',
      expectedBenefit: 'Recorded benefit',
      goldBefore: 100,
      confidence: 55,
    };
    expect(resolveDecisionTarget(state, decision)).toBeUndefined();
    const d = new PresentationEventDeriver();
    d.derive(state);
    state.sovereignMind.recentDecisions.push(decision);
    const event = d.derive(state).find((e) => e.kind === 'decision');
    expect(event?.detail).toBe('Recorded reason');
    expect(event?.target).toBeUndefined();
    expect(decisionId(decision)).toContain('Build Imaginary Palace');
  });
  it('only resolves unique observed name associations', () => {
    const state = game();
    const decision = { actionLabel: 'Improve Pyahhold Town Hall' } as SovereignDecision;
    expect(resolveDecisionTarget(state, decision)?.point).toEqual(
      positionOf(state, state.townHallEntityId)
    );
    const cloneId = state.world.nextId++;
    state.world.entities[cloneId] = structuredClone(state.world.entities[state.townHallEntityId!]);
    expect(resolveDecisionTarget(state, decision)).toBeUndefined();
  });
  it('leaves deeply frozen simulation state untouched', () => {
    const state = game();
    const before = JSON.stringify(state);
    const freeze = (value: unknown): void => {
      if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(freeze);
      }
    };
    freeze(state);
    const d = new PresentationEventDeriver();
    d.derive(state);
    d.derive(state);
    deriveTheme(state);
    for (let i = 0; i < 500; i++) noise(i, config.seed);
    expect(JSON.stringify(state)).toBe(before);
  });
  it('opens exactly one strategic workspace and keeps shortcut visibility consistent', () => {
    const ui = useUIStore.getState();
    ui.reset();
    ui.toggleTechTree();
    expect(useUIStore.getState().showTechTree).toBe(true);
    ui.toggleEconomyPanel();
    expect(useUIStore.getState().showTechTree).toBe(false);
    expect(useUIStore.getState().showEconomyPanel).toBe(true);
    ui.selectEntity(7, 'hero');
    expect(useUIStore.getState().workspace).toBe('inspector');
    expect(useUIStore.getState().showEconomyPanel).toBe(false);
    ui.closeWorkspace();
    expect(useUIStore.getState().selection.entityId).toBe(7);
    ui.reset();
  });
});
