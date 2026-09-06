import { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ECSWorld } from '../engine';
import type { GameState } from '../types/game';
import type { UIState } from '../stores/uiStore';
import { textureFactory } from './TextureFactory';
import { getHeroStateKey } from './HeroTextureFactory';
import { generateBuildingTexture } from './BuildingTextureFactory';
import { generateLairTexture, generateMonsterTexture } from './LairTextureFactory';
import { generateFactionTexture } from './FactionTextureFactory';
import { component, isObserved, positionOf } from '../presentation/events';
import { INK, noise } from '../presentation/theme';

interface EntityView {
  root: Container;
  sprite: Sprite;
  ground: Graphics;
  bars: Graphics;
  label: Text;
  x: number;
  y: number;
  moving: boolean;
  hero: boolean;
  important: boolean;
  labelY: number;
  visible: boolean;
  size: number;
}
export class EntityRenderer {
  private registry = new Map<number, EntityView>();
  private bounty = new Graphics();
  private time = 0;
  constructor(
    _app: Application,
    private scene: SceneManager
  ) {
    this.bounty.eventMode = 'none';
    scene.entityLayer.addChild(this.bounty);
  }
  render(_world: ECSWorld, state: GameState, _camera: Camera, _ui: UIState): void {
    const alive = new Set<number>();
    this.bounty.clear();
    for (const key of Object.keys(state.world.entities)) {
      const id = Number(key),
        p = positionOf(state, id);
      const b = component(state, id, 'Building'),
        h = component(state, id, 'HeroAI');
      const m = component(state, id, 'MonsterAI'),
        l = component(state, id, 'Lair'),
        f = component(state, id, 'Faction');
      const hp = component(state, id, 'Health'),
        bounty = component(state, id, 'BountyTarget');
      if (bounty?.bountyStatus === 'posted') {
        this.bounty
          .regularPoly(bounty.targetX, bounty.targetY, 0.8, 4, Math.PI / 4)
          .stroke({ color: INK.gold, width: 0.035, alpha: 0.8 });
        this.bounty.circle(bounty.targetX, bounty.targetY, 0.12).fill({ color: INK.gold });
      }
      if (!p || (!b && !h && !m && !l && !f) || ((h || m) && hp && hp.hp <= 0)) continue;
      alive.add(id);
      let view = this.registry.get(id);
      if (!view) {
        const root = new Container(),
          ground = new Graphics(),
          bars = new Graphics(),
          sprite = new Sprite();
        const label = new Text({
          text: '',
          style: {
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
            fill: INK.text,
            stroke: { color: INK.void, width: 3 },
            align: 'center',
          },
          resolution: 2,
        });
        sprite.anchor.set(0.5);
        label.anchor.set(0.5, 0);
        root.eventMode = 'none';
        root.position.set(p.x, p.y);
        root.addChild(ground, sprite, bars, label);
        (b || l ? this.scene.buildingLayer : this.scene.entityLayer).addChild(root);
        view = {
          root,
          ground,
          bars,
          sprite,
          label,
          x: p.x,
          y: p.y,
          moving: false,
          hero: !!h,
          important: false,
          labelY: 0.7,
          visible: true,
          size: 1,
        };
        this.registry.set(id, view);
      }
      view.x = p.x;
      view.y = p.y;
      view.visible = isObserved(state, id);
      view.moving = !!h || !!m || !!f;
      const spire = id === state.spireEntityId;
      view.important = b?.buildingType === 'TownHall' || (spire && !!l?.isDiscovered);
      const size = b
        ? 2.65
        : l
          ? spire
            ? 3.4
            : 1.7
          : h
            ? 1.15 + Math.min(h.level - 1, 8) * 0.025
            : m
              ? 0.85
              : 1.2;
      view.size = size;
      const tex = b
        ? generateBuildingTexture(b.buildingType, b.isBuilt)
        : h
          ? getHeroStateKey(h.heroClass, h.status, h.specialization, h.kynmarked)
          : l
            ? generateLairTexture(l.lairName, l.threatLevel, l.isDiscovered, l.isDestroyed)
            : m
              ? generateMonsterTexture(m.monsterType, m.status)
              : generateFactionTexture(f!.factionType, f!.disposition);
      view.sprite.texture = textureFactory.require(tex);
      view.sprite.width = view.sprite.height = size;
      view.sprite.alpha = b && !b.isBuilt ? 0.55 : l?.isDestroyed ? 0.4 : 1;
      view.sprite.tint = hp && hp.hp / hp.maxHp < 0.3 ? 0xe6aca5 : 0xffffff;
      const name = component(state, id, 'Name')?.name ?? l?.lairName ?? f?.factionName ?? '';
      view.label.text = h ? `${name} · ${h.level}` : name;
      view.label.style.fill = spire
        ? INK.threat
        : view.important
          ? INK.gold
          : h
            ? 0xe5eadd
            : INK.text;
      view.labelY = b ? 1.15 : l ? size * 0.45 : 0.6;
      const g = view.ground.clear();
      g.ellipse(0.08, size * 0.31, size * 0.35, size * 0.12).fill({ color: 0x020608, alpha: 0.6 });
      if (b?.isBuilt) {
        g.regularPoly(0, 0.35, 1.05, 4, Math.PI / 4).fill({ color: 0x26322e, alpha: 0.3 });
        g.moveTo(-0.85, 0.88)
          .lineTo(0.85, 0.88)
          .stroke({ color: view.important ? INK.gold : 0x9e9981, alpha: 0.3, width: 0.025 });
      }
      if (h && h.level >= 3)
        g.arc(0, 0.2, 0.48, Math.PI * 0.1, Math.PI * 0.9).stroke({
          color: INK.gold,
          alpha: 0.7,
          width: 0.045,
        });
      if (h && h.inventoryTier > 0) g.regularPoly(0.4, 0.2, 0.07, 4).fill({ color: INK.gold });
      if (spire && l && !l.isDestroyed) {
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          g.moveTo(0, 0)
            .lineTo(Math.cos(a + 0.1) * 1.6, Math.sin(a + 0.1) * 1.3)
            .lineTo(Math.cos(a) * 2.6, Math.sin(a) * 2.1)
            .stroke({ color: INK.threat, width: 0.025, alpha: 0.23 });
        }
      }
      const bars = view.bars.clear();
      if (hp && (hp.hp < hp.maxHp || h)) {
        const width = b || l ? 1.3 : 0.8,
          y = -size * 0.4;
        bars
          .roundRect(-width / 2 - 0.02, y - 0.02, width + 0.04, 0.11, 0.025)
          .fill({ color: INK.void, alpha: 0.9 });
        bars
          .rect(-width / 2, y, width * Math.max(0, hp.hp / hp.maxHp), 0.06)
          .fill({ color: m || l ? INK.threat : hp.hp / hp.maxHp < 0.3 ? INK.warning : INK.green });
      }
    }
    for (const [id, view] of this.registry)
      if (!alive.has(id)) {
        view.root.destroy({ children: true });
        this.registry.delete(id);
      }
  }
  update(dt: number, camera: Camera, selected: number | null, reducedMotion: boolean): void {
    this.time += dt;
    for (const [id, view] of this.registry) {
      view.root.visible = view.visible && camera.isVisible(view.x, view.y, 4);
      const t = reducedMotion || !view.moving ? 1 : 1 - Math.exp(-dt * 12);
      view.root.x += (view.x - view.root.x) * t;
      view.root.y += (view.y - view.root.y) * t;
      if (!view.root.visible) continue;
      view.sprite.y =
        reducedMotion || !view.hero ? 0 : Math.sin(this.time * 2.5 + noise(id) * 6) * 0.018;
      view.label.visible =
        selected === id || view.important || (view.hero ? camera.zoom >= 48 : camera.zoom >= 58);
      view.label.scale.set(1 / camera.zoom);
      view.label.y = view.labelY;
      view.label.alpha = selected === id || view.important ? 1 : 0.82;
      view.bars.visible = selected === id || camera.zoom >= 22;
    }
  }
  position(id: number): { x: number; y: number } | undefined {
    const view = this.registry.get(id);
    return view ? { x: view.root.x, y: view.root.y } : undefined;
  }
  get count(): number {
    return this.registry.size;
  }
}
