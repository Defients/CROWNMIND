import { Application, Graphics, Container, FederatedPointerEvent, Rectangle } from 'pixi.js';
import type { ECSWorld } from '../engine';
import type { GameState } from '../types/game';
import type { Camera } from './Camera';
import { component, isObserved, positionOf } from '../presentation/events';
import { INK } from '../presentation/theme';

const SIZE = 148;
export class MinimapRenderer {
  readonly root = new Container();
  private graphics = new Graphics();
  private viewport = new Graphics();
  private camera: Camera | null = null;
  private mapSize = 64;
  private revision = -1;
  constructor(private app: Application) {
    this.root.label = 'minimap';
    this.root.eventMode = 'static';
    this.root.hitArea = new Rectangle(0, 0, SIZE, SIZE);
    this.graphics.eventMode = 'none';
    this.viewport.eventMode = 'none';
    this.root.addChild(this.graphics, this.viewport);
    app.stage.addChild(this.root);
    this.root.on('pointerdown', this.click);
    this.root.on('pointerup', (e) => e.stopPropagation());
    this.root.on('wheel', (e) => e.stopPropagation());
  }
  setCamera(camera: Camera): void {
    this.camera = camera;
  }
  render(state: GameState, _world: ECSWorld): void {
    this.mapSize = state.mapSize;
    const g = this.graphics.clear(),
      scale = SIZE / this.mapSize;
    g.rect(0, 0, SIZE, SIZE).fill({ color: INK.void, alpha: 0.92 });
    const colors: Record<string, number> = {
      forest: 0x243d32,
      grass: 0x3f5340,
      water: 0x294654,
      stone: 0x626a66,
      corruption: 0x522b46,
      desert: 0x75664c,
      snow: 0x718c9b,
      fertile: 0x4b6950,
    };
    for (let x = 0; x < this.mapSize; x++)
      for (let y = 0; y < this.mapSize; y++) {
        const c = state.grid[x]?.[y];
        if (c?.isExplored)
          g.rect(x * scale, y * scale, scale + 0.1, scale + 0.1).fill(colors[c.terrain]);
      }
    for (const key of Object.keys(state.world.entities)) {
      const id = Number(key),
        p = positionOf(state, id);
      if (!p || !isObserved(state, id)) continue;
      const health = component(state, id, 'Health');
      if (health && health.hp <= 0) continue;
      if (component(state, id, 'Building'))
        g.rect(p.x * scale - 1.5, p.y * scale - 1.5, 3, 3).fill(
          id === state.townHallEntityId ? INK.gold : 0xa4a18c
        );
      else if (component(state, id, 'Lair'))
        g.regularPoly(
          p.x * scale,
          p.y * scale,
          id === state.spireEntityId ? 4 : 2.5,
          3,
          -Math.PI / 2
        ).fill(INK.threat);
      else if (component(state, id, 'HeroAI'))
        g.circle(p.x * scale, p.y * scale, 1.7).fill(INK.cyan);
      else if (component(state, id, 'MonsterAI'))
        g.circle(p.x * scale, p.y * scale, 1).fill(INK.threat);
    }
    g.rect(0, 0, SIZE, SIZE).stroke({ color: INK.gold, width: 1, alpha: 0.35 });
    this.revision = -1;
    this.updateViewportRect();
  }
  updateViewportRect(): void {
    this.root.position.set(20, this.app.screen.height - SIZE - 22);
    if (!this.camera || this.revision === this.camera.revision) return;
    this.revision = this.camera.revision;
    const b = this.camera.getViewportBounds(),
      s = SIZE / this.mapSize;
    const x = Math.max(0, Math.min(SIZE, b.x * s)),
      y = Math.max(0, Math.min(SIZE, b.y * s));
    const right = Math.max(x, Math.min(SIZE, (b.x + b.width) * s)),
      bottom = Math.max(y, Math.min(SIZE, (b.y + b.height) * s));
    this.viewport
      .clear()
      .rect(x, y, right - x, bottom - y)
      .stroke({ color: INK.cyan, width: 1, alpha: 0.85 });
  }
  private click = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    if (!this.camera) return;
    this.camera.manual();
    this.camera.panTo(
      ((e.globalX - this.root.x) * this.mapSize) / SIZE,
      ((e.globalY - this.root.y) * this.mapSize) / SIZE
    );
  };
  destroy(): void {
    this.root.destroy({ children: true });
  }
}
