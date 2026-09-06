import { Application, Container, Sprite, Graphics } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { GameState } from '../types/game';
import { textureFactory } from './TextureFactory';
import { generateTerrainTextures, getTerrainTextureKey } from './TerrainTextureFactory';
import { noise } from '../presentation/theme';

interface TileView {
  root: Container;
  ground: Sprite;
  road: Sprite;
  deposit: Sprite;
  edge: Graphics;
  key: string;
}
export class TileRenderer {
  private tiles = new Map<number, TileView>();
  private biomeGenerated = '';
  private state: GameState | null = null;
  private boundsKey = '';
  constructor(
    _app: Application,
    private scene: SceneManager
  ) {}
  render(state: GameState, camera: Camera): void {
    const b = camera.getViewportBounds();
    const sx = Math.max(0, Math.floor(b.x) - 2),
      ex = Math.min(state.mapSize, Math.ceil(b.x + b.width) + 2);
    const sy = Math.max(0, Math.floor(b.y) - 2),
      ey = Math.min(state.mapSize, Math.ceil(b.y + b.height) + 2);
    const boundsKey = `${sx}:${ex}:${sy}:${ey}`;
    if (this.state === state && this.boundsKey === boundsKey) return;
    this.state = state;
    this.boundsKey = boundsKey;
    if (this.biomeGenerated !== state.config.biome) {
      generateTerrainTextures(state.config.biome);
      this.biomeGenerated = state.config.biome;
    }
    for (const view of this.tiles.values()) view.root.visible = false;
    for (let x = sx; x < ex; x++)
      for (let y = sy; y < ey; y++) {
        const cell = state.grid[x]?.[y];
        if (!cell) continue;
        const id = x * state.mapSize + y;
        let view = this.tiles.get(id);
        if (!view) {
          const root = new Container(),
            ground = new Sprite(),
            road = new Sprite(),
            deposit = new Sprite(),
            edge = new Graphics();
          root.position.set(x + 0.5, y + 0.5);
          root.eventMode = 'none';
          for (const sprite of [ground, road, deposit]) {
            sprite.anchor.set(0.5);
            sprite.width = sprite.height = 1;
          }
          root.addChild(ground, edge, road, deposit);
          this.scene.terrainLayer.addChild(root);
          view = { root, ground, road, deposit, edge, key: '' };
          this.tiles.set(id, view);
        }
        view.root.visible = true;
        const shore =
          cell.isExplored &&
          cell.terrain !== 'water' &&
          state.grid[x]?.[y - 1]?.terrain === 'water';
        const frontier =
          cell.isExplored &&
          (!state.grid[x + 1]?.[y]?.isExplored || !state.grid[x]?.[y + 1]?.isExplored);
        const key = `${cell.isExplored}:${cell.terrain}:${cell.hasRoad}:${cell.resourceDeposit}:${shore}:${frontier}`;
        if (view.key === key) continue;
        view.key = key;
        const tex = cell.isExplored
          ? getTerrainTextureKey(cell.terrain, state.config.biome)
          : 'terrain:fog';
        view.ground.texture = textureFactory.require(tex);
        view.ground.width = view.ground.height = 1.005;
        // Coordinate variants break repetition without generating per-tile textures.
        view.ground.rotation =
          cell.isExplored && !['forest', 'stone'].includes(cell.terrain)
            ? (Math.floor(noise(id, 8) * 4) * Math.PI) / 2
            : 0;
        const shade = cell.isExplored ? 218 + Math.floor(noise(id, state.config.seed) * 37) : 255;
        view.ground.tint = (shade << 16) | (shade << 8) | shade;
        view.road.visible = cell.isExplored && cell.hasRoad;
        if (view.road.visible) {
          view.road.texture = textureFactory.require('terrain:road');
          view.road.width = view.road.height = 1;
        }
        const resKey = `resource:${cell.resourceDeposit}`;
        view.deposit.visible =
          cell.isExplored && !!cell.resourceDeposit && textureFactory.has(resKey);
        if (view.deposit.visible) {
          view.deposit.texture = textureFactory.require(resKey);
          view.deposit.width = view.deposit.height = 0.85;
        }
        const g = view.edge.clear();
        if (shore)
          g.moveTo(-0.5, -0.46)
            .lineTo(0.5, -0.46)
            .stroke({ color: 0x9cbea7, width: 0.06, alpha: 0.3 });
        if (frontier)
          g.moveTo(-0.4, 0.45)
            .lineTo(0.45, 0.45)
            .lineTo(0.45, -0.4)
            .stroke({ color: 0x688b91, width: 0.02, alpha: 0.25 });
        if (cell.isExplored && cell.terrain === 'stone')
          g.moveTo(-0.48, 0.46)
            .lineTo(0.48, 0.46)
            .stroke({ color: 0x020708, width: 0.08, alpha: 0.25 });
      }
  }
  get count(): number {
    return this.tiles.size;
  }
}
