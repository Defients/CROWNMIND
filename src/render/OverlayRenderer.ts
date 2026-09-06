import { Application, Graphics } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ECSWorld } from '../engine';
import type { GameState } from '../types/game';
import type { OverlayMode } from '../types/ui';
import { component, isObserved, positionOf, resolveDecisionTarget } from '../presentation/events';
import { INK } from '../presentation/theme';

export class OverlayRenderer {
  private graphics = new Graphics();
  constructor(_app: Application, scene: SceneManager) {
    this.graphics.label = 'semantic-overlays';
    this.graphics.eventMode = 'none';
    scene.overlayLayer.addChild(this.graphics);
  }
  render(_world: ECSWorld, state: GameState, camera: Camera, mode: OverlayMode): void {
    const g = this.graphics.clear();
    if (mode === 'none') return;
    let paths = 0;
    for (const key of Object.keys(state.world.entities)) {
      const id = Number(key),
        p = positionOf(state, id);
      if (!isObserved(state, id)) continue;
      const lair = component(state, id, 'Lair'),
        bounty = component(state, id, 'BountyTarget');
      if (p && mode === 'threat' && lair && !lair.isDestroyed) {
        const r = id === state.spireEntityId ? 8 : lair.threatLevel === 'high' ? 5 : 3;
        g.circle(p.x, p.y, r).fill({ color: INK.threat, alpha: 0.045 });
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          g.moveTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
          g.arc(p.x, p.y, r, a, a + 0.22).stroke({ color: INK.threat, width: 0.035, alpha: 0.5 });
        }
      }
      if (bounty?.bountyStatus === 'posted' && (mode === 'bounties' || mode === 'sovereign')) {
        g.regularPoly(bounty.targetX, bounty.targetY, 1.2, 4, Math.PI / 4).stroke({
          color: INK.gold,
          width: 0.05,
        });
      }
      if (
        p &&
        (mode === 'heroes' || mode === 'sovereign') &&
        component(state, id, 'HeroAI') &&
        paths < 8
      ) {
        const movement = component(state, id, 'Movement');
        if (movement?.path?.length && camera.isVisible(p.x, p.y)) {
          g.moveTo(p.x, p.y);
          for (const step of movement.path.slice(0, 16)) g.lineTo(step.x, step.y);
          g.stroke({ color: mode === 'heroes' ? INK.cyan : INK.violet, width: 0.035, alpha: 0.45 });
          paths++;
        }
      }
      if (p && mode === 'diplomacy') {
        const f = component(state, id, 'Faction');
        if (f) {
          const standing = state.factionStandings?.[id];
          const color =
            standing != null
              ? standing > 20
                ? INK.green
                : standing <= -20
                  ? INK.threat
                  : INK.warning
              : f.disposition === 'hostile'
                ? INK.threat
                : INK.cyan;
          g.regularPoly(p.x, p.y, 1.5, 6).stroke({ color, width: 0.04, alpha: 0.7 });
        }
      }
      if (p && mode === 'dungeons' && component(state, id, 'DungeonEntrance'))
        g.regularPoly(p.x, p.y, 1.2, 4).stroke({ color: INK.violet, width: 0.05 });
    }
    if (mode === 'sovereign') {
      const d = state.sovereignMind.recentDecisions.at(-1),
        target = d && resolveDecisionTarget(state, d);
      if (target)
        g.regularPoly(target.point.x, target.point.y, 1.5, 6).stroke({
          color: INK.gold,
          width: 0.05,
          alpha: 0.6,
        });
    }
    if (mode === 'resources' || mode === 'fog') {
      const b = camera.getViewportBounds();
      for (
        let x = Math.max(0, Math.floor(b.x));
        x < Math.min(state.mapSize, Math.ceil(b.x + b.width));
        x++
      )
        for (
          let y = Math.max(0, Math.floor(b.y));
          y < Math.min(state.mapSize, Math.ceil(b.y + b.height));
          y++
        ) {
          const c = state.grid[x]?.[y];
          if (!c) continue;
          if (mode === 'resources' && c.isExplored && c.resourceDeposit) {
            const color =
              c.resourceDeposit === 'mana'
                ? INK.violet
                : c.resourceDeposit === 'gold'
                  ? INK.gold
                  : INK.green;
            g.regularPoly(x + 0.5, y + 0.5, 0.35, 4).stroke({ color, width: 0.04, alpha: 0.75 });
          }
          if (mode === 'fog' && !c.isExplored)
            g.moveTo(x + 0.2, y + 0.2)
              .lineTo(x + 0.8, y + 0.8)
              .stroke({ color: INK.cyan, width: 0.02, alpha: 0.15 });
        }
    }
  }
}
