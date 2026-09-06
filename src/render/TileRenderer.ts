import { Application } from 'pixi.js';

import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { GameState } from '../types/game';
import { textureFactory } from './TextureFactory';
import { generateTerrainTextures, getTerrainTextureKey } from './TerrainTextureFactory';

export class TileRenderer {
  private app: Application;
  private scene: SceneManager;
  private biomeGenerated: string | null = null;

  constructor(app: Application, scene: SceneManager) {
    this.app = app;
    this.scene = scene;
  }

  render(state: GameState, camera: Camera): void {
    this.scene.clearLayer(this.scene.terrainLayer);

    const biome = state.config.biome;
    if (this.biomeGenerated !== biome) {
      generateTerrainTextures(biome);
      this.biomeGenerated = biome;
    }

    const { grid, mapSize } = state;
    const tileSize = 1;

    const startX = Math.max(0, Math.floor(camera.x - camera.viewportWidth / (2 * camera.zoom)) - 1);
    const endX = Math.min(mapSize, Math.ceil(camera.x + camera.viewportWidth / (2 * camera.zoom)) + 1);
    const startY = Math.max(0, Math.floor(camera.y - camera.viewportHeight / (2 * camera.zoom)) - 1);
    const endY = Math.min(mapSize, Math.ceil(camera.y + camera.viewportHeight / (2 * camera.zoom)) + 1);

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const cell = grid[x]?.[y];
        if (!cell) continue;

        let textureKey: string;
        if (!cell.isExplored) {
          textureKey = 'terrain:fog';
        } else {
          textureKey = getTerrainTextureKey(cell.terrain, biome);
        }

        const sprite = textureFactory.sprite(textureKey, x + tileSize / 2, y + tileSize / 2, tileSize / 512);
        this.scene.terrainLayer.addChild(sprite);

        if (cell.isExplored && cell.terrain === 'corruption') {
          const overlay = textureFactory.sprite('terrain:corruption_overlay', x + tileSize / 2, y + tileSize / 2, tileSize / 512);
          this.scene.terrainLayer.addChild(overlay);
        }

        if (cell.hasRoad && cell.isExplored) {
          const road = textureFactory.sprite('terrain:road', x + tileSize / 2, y + tileSize / 2, tileSize / 512);
          this.scene.terrainLayer.addChild(road);
        }

        if (cell.resourceDeposit && cell.isExplored) {
          const resKey = `resource:${cell.resourceDeposit}`;
          if (textureFactory.has(resKey)) {
            const res = textureFactory.sprite(resKey, x + tileSize / 2, y + tileSize / 2, tileSize / 512);
            this.scene.terrainLayer.addChild(res);
          }
        }
      }
    }
  }
}
