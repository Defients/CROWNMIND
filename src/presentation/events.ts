import type { GameState, SovereignDecision } from '../types/game';
import type { AnyComponent, ComponentType } from '../engine/Component';
import { PHASE_LABELS } from './theme';

export type Point = { x: number; y: number };
export type EventKind =
  | 'decision'
  | 'phase'
  | 'construction'
  | 'research'
  | 'bounty'
  | 'progression'
  | 'death'
  | 'diplomacy'
  | 'discovery'
  | 'expedition'
  | 'raid'
  | 'combat'
  | 'spawn'
  | 'victory'
  | 'defeat';
export interface PresentationEvent {
  id: string;
  kind: EventKind;
  priority: number;
  title: string;
  detail: string;
  day: number;
  target?: Point;
  entityId?: number;
  origin?: Point;
}
export function component<K extends ComponentType>(
  state: GameState,
  id: number,
  type: K
): Extract<AnyComponent, { type: K }> | undefined {
  return state.world.entities[id]?.[type] as Extract<AnyComponent, { type: K }> | undefined;
}
export function positionOf(state: GameState, id: number | null): Point | undefined {
  if (id == null) return undefined;
  const p = component(state, id, 'Position');
  if (!p) return undefined;
  const offset = component(state, id, 'Building') ? 0.5 : 0;
  return { x: p.x + offset, y: p.y + offset };
}
export function isObserved(state: GameState, id: number): boolean {
  const lair = component(state, id, 'Lair');
  if (lair) return lair.isDiscovered;
  if (
    component(state, id, 'HeroAI') ||
    component(state, id, 'Building') ||
    component(state, id, 'BountyTarget')
  )
    return true;
  const p = positionOf(state, id);
  return !!p && !!state.grid[Math.floor(p.x)]?.[Math.floor(p.y)]?.isExplored;
}
export const decisionId = (d: SovereignDecision) =>
  `${d.day}:${d.tick}:${d.actionType}:${d.actionLabel}`;

/** A named current-world association, not a historical target or a hidden AI thought. */
export function resolveDecisionTarget(
  state: GameState,
  decision: SovereignDecision
): { entityId: number; point: Point; label: string } | undefined {
  const label = decision.actionLabel.toLowerCase();
  const matches: { entityId: number; point: Point; label: string }[] = [];
  for (const key of Object.keys(state.world.entities)) {
    const id = Number(key);
    if (!isObserved(state, id)) continue;
    const name = component(state, id, 'Name')?.name;
    const lair = component(state, id, 'Lair')?.lairName;
    const building = component(state, id, 'Building')?.buildingType.replace(
      /([a-z])([A-Z])/g,
      '$1 $2'
    );
    const match = [name, lair, building].find(
      (n) => n && n.length > 4 && label.includes(n.toLowerCase())
    );
    const point = positionOf(state, id);
    if (match && point) matches.push({ entityId: id, point, label: match });
  }
  return matches.length === 1 ? matches[0] : undefined;
}

interface EntitySnapshot {
  built?: boolean;
  level?: number;
  hp?: number;
  discovered?: boolean;
  bounty?: string;
  position?: Point;
  name: string;
}
interface Snapshot {
  seed: string;
  clock: number;
  phase: string;
  status: string;
  research: string | null;
  techs: Set<string>;
  decisions: Set<string>;
  entities: Map<number, EntitySnapshot>;
  treaties: Set<string>;
  expeditions: Map<string, string>;
  raid: string | null;
  effects: Set<string>;
}
function snapshot(state: GameState): Snapshot {
  const entities = new Map<number, EntitySnapshot>();
  for (const key of Object.keys(state.world.entities)) {
    const id = Number(key);
    const bounty = component(state, id, 'BountyTarget');
    entities.set(id, {
      built: component(state, id, 'Building')?.isBuilt,
      level: component(state, id, 'HeroAI')?.level,
      hp: component(state, id, 'Health')?.hp,
      discovered: component(state, id, 'Lair')?.isDiscovered,
      bounty: bounty?.bountyStatus,
      position: bounty ? { x: bounty.targetX, y: bounty.targetY } : positionOf(state, id),
      name: component(state, id, 'Name')?.name ?? bounty?.bountyName ?? 'Realm activity',
    });
  }
  return {
    seed: `${state.config.seedString}:${state.mapSize}`,
    clock: state.day * 100 + state.timeOfDay,
    phase: state.sovereignMind.phase,
    status: state.gameStatus,
    research: state.currentResearch,
    techs: new Set(state.unlockedTechs),
    decisions: new Set(state.sovereignMind.recentDecisions.map(decisionId)),
    entities,
    treaties: new Set((state.treaties ?? []).map((t) => String(t.id))),
    expeditions: new Map(
      (state.expeditions ?? []).map((e) => [String(e.id), e.isActive ? 'active' : 'ended'])
    ),
    raid: state.raidWarning?.active
      ? `${state.raidWarning.day}:${state.raidWarning.sourceLairId}`
      : null,
    effects: new Set((state.activeEffects ?? []).map((e) => `${e.id}:${e.type}:${e.x}:${e.y}`)),
  };
}

/** Copies only transition metadata: simulation snapshots may contain shared nested objects. */
export class PresentationEventDeriver {
  private previous?: Snapshot;
  reset(): void {
    this.previous = undefined;
  }
  derive(state: GameState): PresentationEvent[] {
    const next = snapshot(state),
      prev = this.previous;
    this.previous = next;
    if (!prev || prev.seed !== next.seed || next.clock < prev.clock) return [];
    const events: PresentationEvent[] = [];
    const origin = positionOf(state, state.townHallEntityId);
    const add = (
      kind: EventKind,
      priority: number,
      title: string,
      detail: string,
      target?: Point,
      entityId?: number,
      key: string | number = entityId ?? title
    ) => {
      events.push({
        id: `${next.clock}:${kind}:${key}`,
        kind,
        priority,
        title,
        detail,
        day: state.day,
        target,
        entityId,
        origin,
      });
    };
    if (prev.phase !== next.phase)
      add(
        'phase',
        next.phase === 'emergency' ? 90 : 70,
        PHASE_LABELS[state.sovereignMind.phase],
        state.sovereignMind.currentPlan,
        next.phase === 'emergency' ? origin : undefined
      );
    for (const d of state.sovereignMind.recentDecisions) {
      if (!prev.decisions.has(decisionId(d))) {
        // Decision records have no target IDs. Spatial associations are offered explicitly in the Mind UI.
        add('decision', 65, d.actionLabel, d.reason, undefined, undefined, decisionId(d));
      }
    }
    for (const [id, curr] of next.entities) {
      const old = prev.entities.get(id);
      if (!isObserved(state, id)) continue;
      if (curr.built && !old?.built)
        add(
          'construction',
          45,
          `${curr.name} completed`,
          'A completed structure is now part of the realm.',
          curr.position,
          id
        );
      if (old?.level != null && curr.level != null && curr.level > old.level)
        add(
          'progression',
          50,
          `${curr.name} · Level ${curr.level}`,
          'Hero progression recorded.',
          curr.position,
          id
        );
      if (old?.level != null && old.hp! > 0 && (curr.hp ?? 0) <= 0)
        add(
          'death',
          65,
          `${curr.name} has fallen`,
          'A hero was lost in the realm.',
          curr.position,
          id
        );
      if (curr.discovered && !old?.discovered)
        add(
          'discovery',
          id === state.spireEntityId ? 95 : 60,
          `${curr.name} discovered`,
          'A hostile stronghold has been observed.',
          curr.position,
          id
        );
      if (curr.bounty === 'posted' && old?.bounty !== 'posted')
        add(
          'bounty',
          40,
          curr.name,
          'Sovereign bounty posted at this location.',
          curr.position,
          id
        );
    }
    if (state.currentResearch && prev.research !== state.currentResearch)
      add('research', 40, 'Research begun', state.currentResearch, origin);
    for (const tech of next.techs)
      if (!prev.techs.has(tech))
        add('research', 75, 'Research completed', tech, origin, undefined, tech);
    if (next.raid && next.raid !== prev.raid) {
      const raid = state.raidWarning!;
      const target = isObserved(state, raid.sourceLairId)
        ? positionOf(state, raid.sourceLairId)
        : origin;
      add(
        'raid',
        90,
        'Raid warning',
        `${raid.monsterCount} hostiles · ${raid.sourceLairName}. Timing remains a warning.`,
        target
      );
    }
    for (const treaty of state.treaties ?? [])
      if (!prev.treaties.has(String(treaty.id)))
        add(
          'diplomacy',
          50,
          'Treaty established',
          'A diplomatic agreement has been recorded.',
          undefined,
          undefined,
          String(treaty.id)
        );
    for (const expedition of state.expeditions ?? []) {
      const status = expedition.isActive ? 'active' : 'ended';
      if (prev.expeditions.get(String(expedition.id)) !== status)
        add(
          'expedition',
          55,
          `Expedition · ${status}`,
          'Dungeon expedition activity changed. An ended expedition is not necessarily a victory.',
          undefined,
          undefined,
          String(expedition.id)
        );
    }
    for (const fx of state.activeEffects ?? []) {
      const key = `${fx.id}:${fx.type}:${fx.x}:${fx.y}`;
      if (!prev.effects.has(key) && state.grid[Math.floor(fx.x)]?.[Math.floor(fx.y)]?.isExplored) {
        if (fx.type === 'combat')
          add(
            'combat',
            (fx.value ?? 0) >= 30 ? 30 : 10,
            `${fx.value ?? ''} damage`,
            'Combat impact recorded.',
            { x: fx.x, y: fx.y },
            undefined,
            key
          );
        if (fx.type === 'spawn')
          add(
            'spawn',
            10,
            'Hostile emerged',
            'A hostile presence appeared.',
            { x: fx.x, y: fx.y },
            undefined,
            key
          );
        if (fx.type === 'death')
          add(
            'death',
            15,
            'Combat loss',
            'A combatant fell.',
            { x: fx.x, y: fx.y },
            undefined,
            key
          );
      }
    }
    if (next.status !== prev.status && (next.status === 'won' || next.status === 'lost'))
      add(
        next.status === 'won' ? 'victory' : 'defeat',
        100,
        next.status === 'won' ? 'Veylthyr has fallen' : 'The realm has fallen',
        'The simulation has reached its conclusion.',
        origin
      );
    return events.sort((a, b) => b.priority - a.priority);
  }
}
