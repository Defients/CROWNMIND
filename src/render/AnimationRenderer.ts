import { Graphics, Container } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ECSWorld } from '../engine';
import type { BuildingComponent, LairComponent, PositionComponent } from '../engine/Component';
import { INK, QUALITY, noise, type Quality } from '../presentation/theme';

interface Emitter {
  id: number;
  x: number;
  y: number;
  kind: string;
}
export class AnimationRenderer {
  private root = new Container();
  private graphics = new Graphics();
  private emitters: Emitter[] = [];
  private camera: Camera | null = null;
  private time = 0;
  count = 0;
  constructor(scene: SceneManager) {
    this.root.label = 'building-activity';
    this.root.eventMode = 'none';
    this.root.addChild(this.graphics);
    scene.effectLayer.addChild(this.root);
  }
  setWorld(world: ECSWorld, camera: Camera): void {
    this.camera = camera;
    this.emitters = [];
    for (const id of world.query('Building', 'Position')) {
      const b = world.getComponent<BuildingComponent>(id, 'Building')!,
        p = world.getComponent<PositionComponent>(id, 'Position')!;
      if (b.isBuilt) this.emitters.push({ id, x: p.x + 0.5, y: p.y + 0.5, kind: b.buildingType });
    }
    for (const id of world.query('Lair', 'Position')) {
      const l = world.getComponent<LairComponent>(id, 'Lair')!,
        p = world.getComponent<PositionComponent>(id, 'Position')!;
      if (l.lairName === 'The Veylthyr Spire' && l.isDiscovered && !l.isDestroyed)
        this.emitters.push({ id, x: p.x, y: p.y, kind: 'Spire' });
    }
  }
  update(dt: number, quality: Quality = 'medium', reducedMotion = false, night = false): void {
    this.time += dt;
    const g = this.graphics.clear();
    this.count = 0;
    const cap = reducedMotion ? 0 : QUALITY[quality].particles;
    for (const e of this.emitters) {
      if (!this.camera?.isVisible(e.x, e.y, 4)) continue;
      const color =
        e.kind === 'Spire'
          ? INK.threat
          : e.kind === 'ManaWell'
            ? INK.violet
            : e.kind === 'ZeeyaShrine'
              ? INK.green
              : INK.gold;
      const active = [
        'Spire',
        'ManaWell',
        'Blacksmith',
        'ZeeyaShrine',
        'GuardTower',
        'TownHall',
      ].includes(e.kind);
      if (!active && !night) continue;
      const pulse = reducedMotion
        ? 0.5
        : 0.5 + Math.sin(this.time * (e.kind === 'Spire' ? 1.3 : 2) + e.id) * 0.12;
      g.ellipse(
        e.x,
        e.y + 0.3,
        e.kind === 'Spire' ? 2.4 : 0.65,
        e.kind === 'Spire' ? 1.4 : 0.4
      ).fill({ color, alpha: pulse * (night ? 0.13 : 0.07) });
      if (e.kind === 'Spire') {
        for (let i = 0; i < 3; i++) {
          const r = 1.3 + i * 0.18,
            a = i * 2 + (reducedMotion ? 0 : this.time * 0.15);
          g.moveTo(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r);
          g.arc(e.x, e.y, r, a, a + 0.9).stroke({ color, width: 0.025, alpha: 0.3 });
        }
      } else if (['Blacksmith', 'GuardTower', 'TownHall'].includes(e.kind) || night) {
        g.circle(e.x + 0.12, e.y + 0.18, 0.07).fill({ color: 0xffd995, alpha: 0.55 + pulse * 0.2 });
      }
      const density = e.kind === 'Spire' ? 12 : active ? 5 : 2;
      for (let i = 0; i < density && this.count < cap; i++) {
        this.count++;
        const phase = (this.time * (e.kind === 'Spire' ? 0.15 : 0.35) + noise(e.id * 19 + i)) % 1;
        const angle = noise(e.id * 31 + i) * Math.PI * 2 + this.time * 0.12;
        const r = e.kind === 'Spire' ? 1.4 : 0.4;
        const x = e.x + Math.cos(angle) * r,
          y = e.y + 0.3 + Math.sin(angle) * r * 0.3 - phase * (e.kind === 'Spire' ? 2 : 0.8);
        g.circle(x, y, (e.kind === 'Blacksmith' ? 0.02 : 0.035) * (1 - phase * 0.5)).fill({
          color,
          alpha: Math.sin(phase * Math.PI) * 0.55,
        });
      }
    }
  }
  getContainer(): Container {
    return this.root;
  }
  destroy(): void {
    this.emitters = [];
    this.root.destroy({ children: true });
  }
}
