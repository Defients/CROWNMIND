import { Application, Container, Graphics, Text } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { GameState } from '../types/game';
import type { UIState } from '../stores/uiStore';
import {
  component,
  isObserved,
  positionOf,
  type Point,
  type PresentationEvent,
} from '../presentation/events';
import { INK, QUALITY, type Quality } from '../presentation/theme';

interface Signal {
  event: PresentationEvent;
  age: number;
  duration: number;
  root: Container;
  glyph: Graphics;
  label: Text;
}
const eventColor = (kind: PresentationEvent['kind']) =>
  ['raid', 'death', 'defeat', 'combat', 'spawn'].includes(kind)
    ? INK.threat
    : ['decision', 'phase'].includes(kind)
      ? INK.violet
      : kind === 'progression'
        ? INK.green
        : INK.gold;
export class EffectRenderer {
  readonly root = new Container();
  private signals: Signal[] = [];
  private pool: Signal[] = [];
  private selection = new Graphics();
  private path = new Graphics();
  constructor(_app: Application, scene: SceneManager) {
    this.root.label = 'semantic-effects';
    this.root.eventMode = 'none';
    this.root.addChild(this.path, this.selection);
    scene.effectLayer.addChild(this.root);
  }
  ingest(events: PresentationEvent[], quality: Quality): void {
    const cap = QUALITY[quality].effects;
    for (const event of events) {
      if (!event.target || this.signals.some((s) => s.event.id === event.id)) continue;
      if (this.signals.length >= cap) {
        const lowest = this.signals.reduce((a, b) => (a.event.priority < b.event.priority ? a : b));
        if (lowest.event.priority > event.priority) continue;
        this.release(lowest);
      }
      let signal = this.pool.pop();
      if (!signal) {
        const root = new Container(),
          glyph = new Graphics();
        const label = new Text({
          text: '',
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: '600',
            fill: INK.gold,
            stroke: { color: INK.void, width: 4 },
          },
          resolution: 2,
        });
        label.anchor.set(0.5);
        root.addChild(glyph, label);
        this.root.addChild(root);
        signal = { event, root, glyph, label, age: 0, duration: 3 };
      }
      signal.event = event;
      signal.age = 0;
      signal.duration = event.priority >= 80 ? 4.5 : 2.6;
      signal.root.visible = true;
      signal.label.text = event.title;
      signal.label.style.fill = eventColor(event.kind);
      this.signals.push(signal);
    }
  }
  private release(signal: Signal): void {
    this.signals.splice(this.signals.indexOf(signal), 1);
    signal.root.visible = false;
    this.pool.push(signal);
  }
  update(
    dt: number,
    state: GameState,
    ui: UIState,
    camera: Camera,
    reducedMotion: boolean,
    visualPosition: (id: number) => Point | undefined
  ): void {
    for (let i = this.signals.length - 1; i >= 0; i--) {
      const signal = this.signals[i];
      signal.age += dt;
      if (signal.age >= signal.duration) {
        this.release(signal);
        continue;
      }
      const p = signal.event.target!,
        t = signal.age / signal.duration,
        color = eventColor(signal.event.kind);
      signal.root.position.set(p.x, p.y);
      signal.root.visible = camera.isVisible(p.x, p.y, 4);
      signal.root.alpha = reducedMotion ? 1 : Math.min(1, (1 - t) * 3);
      const g = signal.glyph.clear(),
        radius = reducedMotion ? 1.1 : 0.6 + t * 1.2;
      if (signal.event.kind === 'construction')
        g.regularPoly(0, 0, radius, 4, Math.PI / 4).stroke({ color, width: 0.045 });
      else if (['raid', 'death', 'defeat', 'discovery'].includes(signal.event.kind))
        g.regularPoly(0, 0, radius, 3, -Math.PI / 2).stroke({ color, width: 0.045 });
      else g.circle(0, 0, radius).stroke({ color, width: 0.035, alpha: 0.8 });
      if (
        signal.event.origin &&
        ['construction', 'bounty', 'research'].includes(signal.event.kind)
      ) {
        const o = signal.event.origin;
        g.moveTo(o.x - p.x, o.y - p.y)
          .lineTo(0, 0)
          .stroke({ color, width: 0.025, alpha: 0.25 });
        if (!reducedMotion)
          g.circle(
            (o.x - p.x) * (1 - Math.min(1, t * 3)),
            (o.y - p.y) * (1 - Math.min(1, t * 3)),
            0.07
          ).fill({ color });
      }
      signal.label.scale.set(1 / camera.zoom);
      signal.label.y = -1.7;
    }
    const g = this.selection.clear(),
      path = this.path.clear();
    const id = ui.selection.entityId;
    const p =
      id == null
        ? ui.selection.selectionType === 'tile' && ui.selection.x != null
          ? { x: ui.selection.x + 0.5, y: ui.selection.y! + 0.5 }
          : undefined
        : (visualPosition(id) ?? positionOf(state, id));
    if (!p) return;
    const r = id != null && component(state, id, 'Building') ? 1.35 : 0.75;
    g.ellipse(p.x, p.y + 0.25, r, r * 0.45).fill({ color: INK.cyan, alpha: 0.07 });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      g.moveTo(p.x + Math.cos(a) * r, p.y + 0.1 + Math.sin(a) * r);
      g.arc(p.x, p.y + 0.1, r, a, a + 0.5).stroke({ color: INK.cyan, width: 0.035, alpha: 0.9 });
    }
    if (id != null) {
      const movement = component(state, id, 'Movement'),
        hero = component(state, id, 'HeroAI');
      const target =
        hero?.targetEntityId == null || !isObserved(state, hero.targetEntityId)
          ? undefined
          : positionOf(state, hero.targetEntityId);
      if (movement?.path?.length) {
        path.moveTo(p.x, p.y);
        for (const step of movement.path.slice(0, 12)) {
          if (Math.hypot(step.x - p.x, step.y - p.y) > 8) break;
          path.lineTo(step.x, step.y);
        }
        path.stroke({ color: INK.cyan, width: 0.035, alpha: 0.45 });
      } else if (target)
        path
          .moveTo(p.x, p.y)
          .lineTo(target.x, target.y)
          .stroke({ color: INK.cyan, width: 0.025, alpha: 0.35 });
      if (target)
        path.regularPoly(target.x, target.y, 0.45, 4).stroke({ color: INK.cyan, width: 0.035 });
    }
  }
  get count(): number {
    return this.signals.length;
  }
}
