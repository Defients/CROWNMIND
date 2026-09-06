import { Application, Graphics } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ECSWorld } from '../engine';
import type { GameState } from '../types/game';
import type { OverlayMode } from '../types/ui';
import type { PositionComponent, HealthComponent, HeroAIComponent, MonsterAIComponent, LairComponent, BuildingComponent, BountyTargetComponent, FactionComponent } from '../engine/Component';

export class OverlayRenderer {
  private app: Application;
  private scene: SceneManager;

  constructor(app: Application, scene: SceneManager) {
    this.app = app;
    this.scene = scene;
  }

  render(world: ECSWorld, state: GameState, camera: Camera, mode: OverlayMode): void {
    this.scene.clearLayer(this.scene.overlayLayer);
    if (mode === 'none') return;

    const g = new Graphics();

    switch (mode) {
      case 'threat':
        this.renderThreatOverlay(world, state, camera, g);
        break;
      case 'bounties':
        this.renderBountyOverlay(world, state, camera, g);
        break;
      case 'heroes':
        this.renderHeroOverlay(world, state, camera, g);
        break;
      case 'fog':
        this.renderFogOverlay(world, state, camera, g);
        break;
      case 'resources':
        this.renderResourceOverlay(world, state, camera, g);
        break;
      case 'sovereign':
        this.renderSovereignOverlay(world, state, camera, g);
        break;
    }

    this.scene.overlayLayer.addChild(g);
  }

  private renderThreatOverlay(world: ECSWorld, state: GameState, camera: Camera, g: Graphics): void {
    const lairIds = world.query('Lair', 'Position');
    for (const id of lairIds) {
      const lair = world.getComponent<LairComponent>(id, 'Lair')!;
      if (lair.isDestroyed) continue;
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      const radius = lair.lairName === 'The Veylthyr Spire' ? 8 : lair.threatLevel === 'high' ? 5 : lair.threatLevel === 'medium' ? 4 : 3;
      const alpha = lair.lairName === 'The Veylthyr Spire' ? 0.15 : 0.08;
      g.circle(pos.x, pos.y, radius).fill({ color: 0xff4d6d, alpha });
    }

    const monsterIds = world.query('MonsterAI', 'Position');
    for (const id of monsterIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      g.circle(pos.x, pos.y, 2).fill({ color: 0xff4d6d, alpha: 0.1 });
    }
  }

  private renderBountyOverlay(world: ECSWorld, state: GameState, camera: Camera, g: Graphics): void {
    const bountyIds = world.query('BountyTarget');
    for (const id of bountyIds) {
      const bounty = world.getComponent<BountyTargetComponent>(id, 'BountyTarget')!;
      if (bounty.bountyStatus !== 'posted') continue;
      g.circle(bounty.targetX, bounty.targetY, 3).fill({ color: 0xf5c84b, alpha: 0.1 });
      g.circle(bounty.targetX, bounty.targetY, 1.5).fill({ color: 0xf5c84b, alpha: 0.2 });
    }
  }

  private renderHeroOverlay(world: ECSWorld, state: GameState, camera: Camera, g: Graphics): void {
    const heroIds = world.query('HeroAI', 'Position');
    for (const id of heroIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      g.circle(pos.x, pos.y, 2).fill({ color: 0x38e68b, alpha: 0.08 });
    }
  }

  private renderFogOverlay(world: ECSWorld, state: GameState, camera: Camera, g: Graphics): void {
    const { grid, mapSize } = state;
    const startX = Math.max(0, Math.floor(camera.x - camera.viewportWidth / (2 * camera.zoom)) - 2);
    const endX = Math.min(mapSize, Math.ceil(camera.x + camera.viewportWidth / (2 * camera.zoom)) + 2);
    const startY = Math.max(0, Math.floor(camera.y - camera.viewportHeight / (2 * camera.zoom)) - 2);
    const endY = Math.min(mapSize, Math.ceil(camera.y + camera.viewportHeight / (2 * camera.zoom)) + 2);

    for (let x = startX; x < endX; x += 2) {
      for (let y = startY; y < endY; y += 2) {
        const cell = grid[x]?.[y];
        if (!cell || !cell.isExplored) {
          g.rect(x, y, 2, 2).fill({ color: 0x000000, alpha: 0.7 });
        }
      }
    }
  }

  private renderResourceOverlay(world: ECSWorld, state: GameState, camera: Camera, g: Graphics): void {
    const { grid, mapSize } = state;
    const startX = Math.max(0, Math.floor(camera.x - camera.viewportWidth / (2 * camera.zoom)) - 1);
    const endX = Math.min(mapSize, Math.ceil(camera.x + camera.viewportWidth / (2 * camera.zoom)) + 1);
    const startY = Math.max(0, Math.floor(camera.y - camera.viewportHeight / (2 * camera.zoom)) - 1);
    const endY = Math.min(mapSize, Math.ceil(camera.y + camera.viewportHeight / (2 * camera.zoom)) + 1);

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const cell = grid[x]?.[y];
        if (!cell || !cell.isExplored || !cell.resourceDeposit) continue;
        const color = this.getDepositColor(cell.resourceDeposit);
        g.circle(x + 0.5, y + 0.5, 0.3).fill({ color, alpha: 0.3 });
      }
    }
  }

  private renderSovereignOverlay(world: ECSWorld, state: GameState, camera: Camera, g: Graphics): void {
    const heroIds = world.query('HeroAI', 'Position');
    for (const id of heroIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      g.circle(pos.x, pos.y, 1.5).fill({ color: 0x9b5cff, alpha: 0.06 });
    }

    const buildingIds = world.query('Building', 'Position');
    for (const id of buildingIds) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      g.circle(pos.x + 0.5, pos.y + 0.5, 1.2).fill({ color: 0x26f4ff, alpha: 0.06 });
    }
  }

  private getDepositColor(resource: string): number {
    switch (resource) {
      case 'wood': return 0x4a8a3a;
      case 'stone': return 0x8a8a9a;
      case 'food': return 0x6ac84a;
      case 'mana': return 0x9b5cff;
      default: return 0xffffff;
    }
  }
}
