import { Application, Graphics, Container, FederatedPointerEvent } from 'pixi.js';
import type { ECSWorld } from '../engine';
import type { GameState } from '../types/game';
import type { PositionComponent, HealthComponent, BuildingComponent, LairComponent, FactionComponent } from '../engine/Component';
import type { Camera } from './Camera';

const MINIMAP_SIZE = 160;

const BUILDING_COLORS: Record<string, number> = {
  TownHall: 0x9b5cff,
  WarriorGuild: 0xff6b6b,
  RangerLodge: 0x4ecdc4,
  ZeeyaShrine: 0x95e1d3,
  Market: 0xffd93d,
  Blacksmith: 0xff8c42,
  GuardTower: 0x88ccff,
  LumberMill: 0xd4a574,
  Quarry: 0xaaaaaa,
  Farm: 0x8bc34a,
  ManaWell: 0xb388ff,
  Warehouse: 0xb0bec5,
  Housing: 0xffcc80,
  HuntersLodge: 0xa1887f,
};

export class MinimapRenderer {
  private app: Application;
  private graphics: Graphics | null = null;
  private viewportRect: Graphics | null = null;
  private container: Container | null = null;
  private camera: Camera | null = null;
  private mapSize: number = 48;

  constructor(app: Application) {
    this.app = app;
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  render(state: GameState, world: ECSWorld): void {
    if (this.graphics) {
      this.graphics.destroy();
    }
    if (this.viewportRect) {
      this.viewportRect.destroy();
      this.viewportRect = null;
    }

    this.mapSize = state.mapSize;
    const g = new Graphics();
    const { grid, mapSize } = state;
    const scale = MINIMAP_SIZE / mapSize;

    g.rect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE).fill({ color: 0x07040d });
    g.rect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE).stroke({ color: 0x3a2a5a, width: 2 });

    for (let x = 0; x < mapSize; x += 1) {
      for (let y = 0; y < mapSize; y += 1) {
        const cell = grid[x]?.[y];
        if (!cell) continue;
        if (cell.isExplored) {
          let color = 0x1a1520;
          if (cell.terrain === 'forest') color = 0x1a2a1a;
          else if (cell.terrain === 'stone') color = 0x2a2a2e;
          else if (cell.terrain === 'corruption') color = 0x2a1a35;
          else if (cell.terrain === 'desert') color = 0x3a2a10;
          else if (cell.terrain === 'snow') color = 0x2a2a3a;
          else if (cell.terrain === 'water') color = 0x0a1a2a;
          else if (cell.terrain === 'fertile') color = 0x1a3a1a;
          else if (cell.terrain === 'grass') color = 0x1a2a1a;
          g.rect(x * scale, y * scale, scale + 0.5, scale + 0.5).fill({ color });
        }
      }
    }

    const buildingIds = world.query('Building', 'Position');
    for (const id of buildingIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      const building = world.getComponent<BuildingComponent>(id, 'Building')!;
      if (!building.isBuilt) continue;
      const color = BUILDING_COLORS[building.buildingType] ?? 0x9b5cff;
      const size = building.buildingType === 'TownHall' ? 4 : 2.5;
      g.rect(pos.x * scale, pos.y * scale, 2 * scale, 2 * scale).fill({ color, alpha: 0.7 });
      if (building.buildingType === 'TownHall') {
        g.rect(pos.x * scale - 1, pos.y * scale - 1, 2 * scale + 2, 2 * scale + 2).stroke({ color, width: 1 });
      }
    }

    const lairIds = world.query('Lair', 'Position');
    for (const id of lairIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      const lair = world.getComponent<LairComponent>(id, 'Lair')!;
      if (lair.isDestroyed || !lair.isDiscovered) continue;
      const color = lair.lairName === 'The Veylthyr Spire' ? 0xff4d6d : lair.threatLevel === 'high' ? 0xff6d4d : lair.threatLevel === 'medium' ? 0xffb84d : 0xffdd4d;
      const size = lair.lairName === 'The Veylthyr Spire' ? 4 : 2.5;
      g.regularPoly(pos.x * scale, pos.y * scale, size, 3).fill({ color });
    }

    const factionIds = world.query('Faction', 'Position');
    for (const id of factionIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      const faction = world.getComponent<FactionComponent>(id, 'Faction')!;
      const color = faction.disposition === 'friendly' ? 0x26f4ff : faction.disposition === 'hostile' ? 0xff4d6d : 0xffb84d;
      g.star(pos.x * scale, pos.y * scale, 4, 2, 1).fill({ color });
    }

    const heroIds = world.query('HeroAI', 'Position', 'Health');
    for (const id of heroIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;
      if (health.hp <= 0) continue;
      g.circle(pos.x * scale, pos.y * scale, 2).fill({ color: 0x38e68b });
      g.circle(pos.x * scale, pos.y * scale, 3).stroke({ color: 0x38e68b, width: 0.5, alpha: 0.5 });
    }

    const monsterIds = world.query('MonsterAI', 'Position', 'Health');
    for (const id of monsterIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;
      if (health.hp <= 0) continue;
      g.circle(pos.x * scale, pos.y * scale, 1.5).fill({ color: 0xff4d6d });
    }

    this.graphics = g;
    g.x = this.app.screen.width - MINIMAP_SIZE - 10;
    g.y = 10;

    if (!this.container) {
      this.container = new Container();
      this.container.eventMode = 'static';
      this.container.on('pointerdown', (e: FederatedPointerEvent) => this.handleClick(e));
      this.app.stage.addChild(this.container);
    }

    this.container.removeChildren();
    this.container.addChild(g);
    this.container.x = 0;
    this.container.y = 0;

    this.updateViewportRect();
  }

  updateViewportRect(): void {
    if (!this.camera || !this.graphics) return;
    if (this.viewportRect) {
      this.viewportRect.destroy();
    }

    const scale = MINIMAP_SIZE / this.mapSize;
    const bounds = this.camera.getViewportBounds();

    const rect = new Graphics();
    const rx = Math.max(0, bounds.x * scale);
    const ry = Math.max(0, bounds.y * scale);
    const rw = Math.min(MINIMAP_SIZE - rx, bounds.width * scale);
    const rh = Math.min(MINIMAP_SIZE - ry, bounds.height * scale);

    rect.rect(rx, ry, rw, rh).stroke({ color: 0xffffff, width: 1.5, alpha: 0.8 });
    rect.rect(rx, ry, rw, rh).fill({ color: 0xffffff, alpha: 0.05 });

    this.viewportRect = rect;
    rect.x = this.graphics.x;
    rect.y = this.graphics.y;
    this.container?.addChild(rect);
  }

  private handleClick(e: FederatedPointerEvent): void {
    if (!this.camera || !this.graphics) return;
    const localX = e.globalX - this.graphics.x;
    const localY = e.globalY - this.graphics.y;
    const scale = MINIMAP_SIZE / this.mapSize;
    const worldX = localX / scale;
    const worldY = localY / scale;
    this.camera.panTo(worldX, worldY);
    this.camera.follow(null);
  }

  destroy(): void {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
    if (this.viewportRect) {
      this.viewportRect.destroy();
      this.viewportRect = null;
    }
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
