import { Application, Container, Graphics, Text } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ECSWorld } from '../engine';
import type { GameState } from '../types/game';
import type { UIState } from '../stores/uiStore';
import type { PositionComponent, HealthComponent, HeroAIComponent, MonsterAIComponent, BuildingComponent, LairComponent, NameComponent, FactionComponent, BountyTargetComponent } from '../engine/Component';
import { textureFactory } from './TextureFactory';
import { getHeroStateKey } from './HeroTextureFactory';
import { generateBuildingTexture } from './BuildingTextureFactory';
import { generateLairTexture, generateMonsterTexture } from './LairTextureFactory';
import { generateFactionTexture } from './FactionTextureFactory';

export class EntityRenderer {
  private app: Application;
  private scene: SceneManager;

  constructor(app: Application, scene: SceneManager) {
    this.app = app;
    this.scene = scene;
  }

  render(world: ECSWorld, state: GameState, camera: Camera, uiState: UIState): void {
    this.scene.clearLayer(this.scene.buildingLayer);
    this.scene.clearLayer(this.scene.entityLayer);

    this.renderBuildings(world, state, camera, uiState);
    this.renderLairs(world, state, camera);
    this.renderHeroes(world, state, camera, uiState);
    this.renderMonsters(world, state, camera);
    this.renderFactions(world, state, camera, uiState);
    this.renderBounties(world, state, camera);
  }

  private renderBuildings(world: ECSWorld, _state: GameState, camera: Camera, uiState: UIState): void {
    const ids = world.query('Building', 'Position', 'Health');
    for (const id of ids) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      if (!camera.isVisible(pos.x + 0.5, pos.y + 0.5, 3)) continue;

      const building = world.getComponent<BuildingComponent>(id, 'Building')!;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;
      const name = world.getComponent<NameComponent>(id, 'Name');

      const isTownHall = building.buildingType === 'TownHall';

      // Drop shadow
      if (building.isBuilt) {
        const shadowW = isTownHall ? 1.2 : 0.9;
        const shadow = new Graphics();
        shadow.ellipse(pos.x + 0.5, pos.y + 1.3, shadowW, 0.35).fill({ color: 0x000000, alpha: 0.3 });
        this.scene.buildingLayer.addChild(shadow);
      }

      // Glow auras for special structures
      if (building.isBuilt) {
        const time = Date.now() / 1000;
        if (building.buildingType === 'ManaWell') {
          const pulse = 0.12 + Math.sin(time * 2) * 0.04;
          const glow = new Graphics();
          glow.circle(pos.x + 0.5, pos.y + 0.5, 1.2).fill({ color: 0x9b5cff, alpha: pulse });
          this.scene.buildingLayer.addChild(glow);
        } else if (building.buildingType === 'ZeeyaShrine') {
          const glow = new Graphics();
          glow.circle(pos.x + 0.5, pos.y + 0.5, 1.0).fill({ color: 0x38e68b, alpha: 0.10 });
          this.scene.buildingLayer.addChild(glow);
        }
      }

      const texKey = generateBuildingTexture(building.buildingType, building.isBuilt);
      const scale = 2.0 / 512;
      const sprite = textureFactory.sprite(texKey, pos.x + 0.5, pos.y + 0.5, scale);
      this.scene.buildingLayer.addChild(sprite);

      if (health.hp < health.maxHp && building.isBuilt) {
        this.drawHealthBar(pos.x + 0.5, pos.y - 0.1, 1.2, 0.10, health.hp / health.maxHp, 0x38e68b, camera);
      }

      if (name && building.isBuilt) {
        const showLabel = camera.zoom > 6 || (camera.zoom > 3 && uiState.selection.entityId === id);
        if (showLabel) {
          this.drawLabel(name.name, pos.x + 0.5, pos.y + 1.4, 0xeee8ff, camera, this.scene.buildingLayer);
        }
      }
    }
  }

  private renderLairs(world: ECSWorld, state: GameState, camera: Camera): void {
    const ids = world.query('Lair', 'Position', 'Health');
    for (const id of ids) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      if (!camera.isVisible(pos.x, pos.y)) continue;

      const lair = world.getComponent<LairComponent>(id, 'Lair')!;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;

      const isSpire = lair.lairName === 'The Veylthyr Spire';

      // Spire glow aura
      if (isSpire && lair.isDiscovered && !lair.isDestroyed) {
        const time = Date.now() / 1000;
        const pulse = 0.15 + Math.sin(time * 1.5) * 0.05;
        const glow = new Graphics();
        glow.circle(pos.x, pos.y, 2.0).fill({ color: 0xff4d6d, alpha: pulse });
        this.scene.buildingLayer.addChild(glow);
      }

      const texKey = generateLairTexture(lair.lairName, lair.threatLevel, lair.isDiscovered, lair.isDestroyed);
      const texSize = isSpire ? 512 : 384;
      const scale = (isSpire ? 1.5 : 1.0) / texSize;
      const sprite = textureFactory.sprite(texKey, pos.x, pos.y, scale);
      this.scene.buildingLayer.addChild(sprite);

      if (lair.isDiscovered && !lair.isDestroyed && health.hp < health.maxHp) {
        this.drawHealthBar(pos.x, pos.y - (isSpire ? 0.9 : 0.65), isSpire ? 1.2 : 0.8, 0.10, health.hp / health.maxHp, 0xff4d6d, camera);
      }
    }
  }

  private renderHeroes(world: ECSWorld, _state: GameState, camera: Camera, uiState: UIState): void {
    const ids = world.query('HeroAI', 'Position', 'Health', 'Combat');
    for (const id of ids) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      if (!camera.isVisible(pos.x, pos.y)) continue;

      const heroAI = world.getComponent<HeroAIComponent>(id, 'HeroAI')!;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;
      const name = world.getComponent<NameComponent>(id, 'Name');

      if (health.hp <= 0) continue;

      // Drop shadow
      const heroShadow = new Graphics();
      heroShadow.ellipse(pos.x, pos.y + 0.2, 0.3, 0.12).fill({ color: 0x000000, alpha: 0.25 });
      this.scene.entityLayer.addChild(heroShadow);

      const texKey = getHeroStateKey(heroAI.heroClass, heroAI.status, heroAI.specialization, heroAI.kynmarked);
      const scale = 0.5 / 512;
      const sprite = textureFactory.sprite(texKey, pos.x, pos.y, scale);
      this.scene.entityLayer.addChild(sprite);

      const barW = 0.7;
      const barH = 0.08;
      const barY = pos.y - 0.35;
      this.drawHealthBar(pos.x, barY, barW, barH, health.hp / health.maxHp, 0x38e68b, camera);

      if (name) {
        const showLabel = camera.zoom > 10 || (camera.zoom > 4 && uiState.selection.entityId === id);
        if (showLabel) {
          this.drawLabel(name.name, pos.x, pos.y + 0.35, 0xeee8ff, camera, this.scene.entityLayer);
        }
      }
    }
  }

  private renderMonsters(world: ECSWorld, state: GameState, camera: Camera): void {
    const ids = world.query('MonsterAI', 'Position', 'Health');
    for (const id of ids) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      if (!camera.isVisible(pos.x, pos.y)) continue;

      const monsterAI = world.getComponent<MonsterAIComponent>(id, 'MonsterAI')!;
      const health = world.getComponent<HealthComponent>(id, 'Health')!;

      if (health.hp <= 0) continue;

      // Drop shadow
      const monsterShadow = new Graphics();
      monsterShadow.ellipse(pos.x, pos.y + 0.15, 0.22, 0.09).fill({ color: 0x000000, alpha: 0.25 });
      this.scene.entityLayer.addChild(monsterShadow);

      const texKey = generateMonsterTexture(monsterAI.monsterType, monsterAI.status);
      const scale = 0.35 / 384;
      const sprite = textureFactory.sprite(texKey, pos.x, pos.y, scale);
      this.scene.entityLayer.addChild(sprite);

      const barW = 0.6;
      const barH = 0.07;
      const barY = pos.y - 0.28;
      this.drawHealthBar(pos.x, barY, barW, barH, health.hp / health.maxHp, 0xff4d6d, camera);
    }
  }

  private renderFactions(world: ECSWorld, _state: GameState, camera: Camera, uiState: UIState): void {
    const ids = world.query('Faction', 'Position');
    for (const id of ids) {
      const pos = world.getComponent<PositionComponent>(id, 'Position')!;
      if (!camera.isVisible(pos.x, pos.y)) continue;

      const faction = world.getComponent<FactionComponent>(id, 'Faction')!;
      const name = world.getComponent<NameComponent>(id, 'Name');

      const texKey = generateFactionTexture(faction.factionType, faction.disposition);
      const scale = 0.45 / 384;
      const sprite = textureFactory.sprite(texKey, pos.x, pos.y, scale);
      this.scene.entityLayer.addChild(sprite);

      if (name) {
        const showLabel = camera.zoom > 10 || (camera.zoom > 4 && uiState.selection.entityId === id);
        if (showLabel) {
          this.drawLabel(faction.factionName, pos.x, pos.y + 0.4, 0xffd93d, camera, this.scene.entityLayer);
        }
      }
    }
  }

  private renderBounties(world: ECSWorld, state: GameState, camera: Camera): void {
    const ids = world.query('BountyTarget');
    for (const id of ids) {
      const bounty = world.getComponent<BountyTargetComponent>(id, 'BountyTarget')!;
      if (bounty.bountyStatus !== 'posted') continue;
      if (!camera.isVisible(bounty.targetX, bounty.targetY)) continue;

      const g = new Graphics();
      g.circle(bounty.targetX, bounty.targetY, 0.6).stroke({ color: 0xf5c84b, width: 0.06, alpha: 0.6 });
      g.circle(bounty.targetX, bounty.targetY, 0.4).stroke({ color: 0xf5c84b, width: 0.03, alpha: 0.4 });

      this.scene.entityLayer.addChild(g);
    }
  }

  private drawHealthBar(cx: number, cy: number, w: number, h: number, pct: number, color: number, _camera: Camera): void {
    const g = new Graphics();
    g.rect(cx - w / 2 - 0.02, cy - 0.02, w + 0.04, h + 0.04).fill({ color: 0x000000, alpha: 0.8 });
    g.rect(cx - w / 2, cy, w, h).fill({ color: 0x000000, alpha: 0.6 });
    g.rect(cx - w / 2, cy, w * pct, h).fill({ color });
    g.rect(cx - w / 2, cy, w, h).stroke({ color: 0x000000, width: 0.02, alpha: 0.5 });
    this.scene.entityLayer.addChild(g);
  }

  private drawLabel(text: string, x: number, y: number, color: number, camera: Camera, layer: Container): void {
    const screenScale = Math.max(0.02, Math.min(0.06, 0.4 / camera.zoom));
    const label = new Text({ text, style: { fontSize: 8, fill: color, fontFamily: 'monospace' } });
    label.x = x;
    label.y = y;
    label.anchor.set(0.5, 0);
    label.scale.set(screenScale, screenScale);

    const bgW = text.length * 0.09 * screenScale + 0.06;
    const bgH = 0.14 * screenScale;
    const bg = new Graphics();
    bg.roundRect(x - bgW / 2, y - 0.01, bgW, bgH, 0.04 * screenScale).fill({ color: 0x000000, alpha: 0.55 });

    layer.addChild(bg);
    layer.addChild(label);
  }
}
