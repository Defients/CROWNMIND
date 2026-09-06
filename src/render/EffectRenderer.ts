import { Application, Graphics, Text, Container } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ActiveEffect } from '../types/game';
import type { UIState } from '../stores/uiStore';
import type { ECSWorld } from '../engine';
import type { PositionComponent, BuildingComponent } from '../engine/Component';

export class EffectRenderer {
  private app: Application;
  private scene: SceneManager;
  private selectionGraphics: Graphics | null = null;

  constructor(app: Application, scene: SceneManager) {
    this.app = app;
    this.scene = scene;
  }

  render(effects: ActiveEffect[], world: ECSWorld, camera: Camera, uiState: UIState): void {
    this.scene.clearLayer(this.scene.effectLayer);

    const g = new Graphics();

    for (const effect of effects) {
      if (!camera.isVisible(effect.x, effect.y, 5)) continue;

      const progress = 1 - effect.ttl / effect.maxTtl;

      switch (effect.type) {
        case 'combat':
          this.drawCombatEffect(g, effect, progress);
          break;
        case 'death':
          this.drawDeathEffect(g, effect, progress);
          break;
        case 'build':
          this.drawBuildEffect(g, effect, progress);
          break;
        case 'spawn':
          this.drawSpawnEffect(g, effect, progress);
          break;
      }
    }

    this.scene.effectLayer.addChild(g);

    if (uiState.selection.entityId != null) {
      this.drawSelectionRing(world, camera, uiState.selection.entityId);
    }
  }

  private drawCombatEffect(g: Graphics, effect: ActiveEffect, progress: number): void {
    const radius = 0.2 + progress * 0.5;
    const alpha = 1 - progress;
    g.circle(effect.x, effect.y, radius).stroke({ color: effect.color ?? 0xffaa44, width: 0.06, alpha });
    g.circle(effect.x, effect.y, radius * 0.5).fill({ color: effect.color ?? 0xffaa44, alpha: alpha * 0.3 });

    if (effect.value && effect.ttl > effect.maxTtl - 3) {
      const label = new Text({
        text: `-${effect.value}`,
        style: { fontSize: 14, fill: 0xff6b4a, fontFamily: 'monospace', fontWeight: 'bold' },
      });
      label.x = effect.x;
      label.y = effect.y - progress * 1.5;
      label.anchor.set(0.5, 0.5);
      label.scale.set(Math.max(0.02, Math.min(0.06, 0.4 / 14)), Math.max(0.02, Math.min(0.06, 0.4 / 14)));
      label.alpha = 1 - progress;
      this.scene.effectLayer.addChild(label);
    }
  }

  private drawDeathEffect(g: Graphics, effect: ActiveEffect, progress: number): void {
    const radius = 0.3 + progress * 0.8;
    const alpha = 1 - progress;
    g.circle(effect.x, effect.y, radius).stroke({ color: 0xff4444, width: 0.08, alpha });
    g.circle(effect.x, effect.y, radius * 0.6).fill({ color: 0x880000, alpha: alpha * 0.4 });

    if (effect.ttl > effect.maxTtl - 5) {
      const skull = new Text({
        text: 'X',
        style: { fontSize: 16, fill: 0xff4444, fontFamily: 'monospace', fontWeight: 'bold' },
      });
      skull.x = effect.x;
      skull.y = effect.y - progress * 1.0;
      skull.anchor.set(0.5, 0.5);
      skull.scale.set(Math.max(0.02, Math.min(0.06, 0.4 / 14)), Math.max(0.02, Math.min(0.06, 0.4 / 14)));
      skull.alpha = 1 - progress;
      this.scene.effectLayer.addChild(skull);
    }
  }

  private drawBuildEffect(g: Graphics, effect: ActiveEffect, progress: number): void {
    const radius = progress * 1.2;
    const alpha = 1 - progress;
    g.circle(effect.x, effect.y, radius).stroke({ color: 0xf5c84b, width: 0.1, alpha });
    g.circle(effect.x, effect.y, radius * 0.7).fill({ color: 0xf5c84b, alpha: alpha * 0.2 });
  }

  private drawSpawnEffect(g: Graphics, effect: ActiveEffect, progress: number): void {
    const radius = progress * 0.8;
    const alpha = 1 - progress;
    g.circle(effect.x, effect.y, radius).stroke({ color: 0xff4d6d, width: 0.08, alpha });
  }

  private drawSelectionRing(world: ECSWorld, _camera: Camera, entityId: number): void {
    const pos = world.getComponent<PositionComponent>(entityId, 'Position');
    if (!pos) return;

    const building = world.getComponent<BuildingComponent>(entityId, 'Building');
    const cx = building ? pos.x + 0.5 : pos.x;
    const cy = building ? pos.y + 0.5 : pos.y;
    const baseR = building ? 1.2 : 0.4;

    if (this.selectionGraphics) {
      this.selectionGraphics.destroy();
    }
    const g = new Graphics();
    const time = Date.now() / 300;
    const pulse = baseR + Math.sin(time) * 0.1;
    g.circle(cx, cy, pulse).stroke({ color: 0x26f4ff, width: 0.04, alpha: 0.9 });
    g.circle(cx, cy, pulse + 0.06).stroke({ color: 0x26f4ff, width: 0.02, alpha: 0.5 });
    g.circle(cx, cy, pulse + 0.12).stroke({ color: 0x26f4ff, width: 0.015, alpha: 0.25 });
    g.circle(cx, cy, pulse * 0.7).fill({ color: 0x26f4ff, alpha: 0.06 });
    this.selectionGraphics = g;
    this.scene.effectLayer.addChild(g);
  }
}
