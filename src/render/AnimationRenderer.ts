import { Graphics, Container } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { Camera } from './Camera';
import type { ECSWorld } from '../engine';
import type { PositionComponent, BuildingComponent } from '../engine/Component';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

export class AnimationRenderer {
  private scene: SceneManager;
  private container: Container = new Container();
  private particles: Particle[] = [];
  private time = 0;
  private world: ECSWorld | null = null;
  private camera: Camera | null = null;

  constructor(scene: SceneManager) {
    this.scene = scene;
    this.container.zIndex = 5;
  }

  setWorld(world: ECSWorld, camera: Camera): void {
    this.world = world;
    this.camera = camera;
  }

  update(dt: number): void {
    this.time += dt / 60;
    this.container.removeChildren();

    if (!this.world || !this.camera) return;

    this.updateBuildingAnimations();
    this.updateParticles(dt);
    this.drawParticles();
  }

  private updateBuildingAnimations(): void {
    if (!this.world || !this.camera) return;
    const ids = this.world.query('Building', 'Position');
    for (const id of ids) {
      const pos = this.world.getComponent<PositionComponent>(id, 'Position')!;
      const building = this.world.getComponent<BuildingComponent>(id, 'Building')!;
      if (!building.isBuilt) continue;
      if (!this.camera.isVisible(pos.x + 0.5, pos.y + 0.5, 3)) continue;

      const cx = pos.x + 0.5;
      const cy = pos.y + 0.5;

      switch (building.buildingType) {
        case 'TownHall':
          this.animateFlag(cx, cy - 1.0);
          break;
        case 'Blacksmith':
          this.animateForge(cx, cy);
          break;
        case 'ManaWell':
          this.animateManaParticles(cx, cy);
          break;
        case 'Housing':
          this.animateSmoke(cx + 0.3, cy - 0.5);
          break;
        case 'ZeeyaShrine':
          this.animateHolySparkles(cx, cy);
          break;
        case 'GuardTower':
          this.animateTorchFlicker(cx, cy);
          break;
      }
    }
  }

  private animateFlag(cx: number, cy: number): void {
    const sway = Math.sin(this.time * 2) * 0.08;
    const g = new Graphics();
    g.moveTo(cx, cy);
    g.lineTo(cx + 0.15 + sway, cy + 0.05);
    g.lineTo(cx, cy + 0.1);
    g.closePath();
    g.fill({ color: 0xb4323c, alpha: 0.7 });
    this.container.addChild(g);
  }

  private animateForge(cx: number, cy: number): void {
    const flicker = 0.3 + Math.sin(this.time * 8) * 0.15 + Math.random() * 0.1;
    const g = new Graphics();
    g.circle(cx, cy + 0.3, 0.15).fill({ color: 0xff7800, alpha: flicker * 0.4 });
    g.circle(cx, cy + 0.3, 0.08).fill({ color: 0xffc040, alpha: flicker * 0.5 });
    this.container.addChild(g);

    if (Math.random() < 0.15) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 0.2,
        y: cy + 0.3,
        vx: (Math.random() - 0.5) * 0.01,
        vy: -0.02 - Math.random() * 0.01,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        size: 0.02 + Math.random() * 0.02,
        color: 0xffa030,
      });
    }
  }

  private animateManaParticles(cx: number, cy: number): void {
    if (Math.random() < 0.2) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 0.3;
      this.particles.push({
        x: cx + Math.cos(angle) * r,
        y: cy + 0.3 + Math.sin(angle) * r * 0.5,
        vx: 0,
        vy: -0.015 - Math.random() * 0.01,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.5,
        size: 0.03 + Math.random() * 0.02,
        color: 0x9b5cff,
      });
    }
  }

  private animateSmoke(cx: number, cy: number): void {
    if (Math.random() < 0.08) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 0.1,
        y: cy,
        vx: (Math.random() - 0.5) * 0.005,
        vy: -0.01 - Math.random() * 0.008,
        life: 0,
        maxLife: 1.5 + Math.random() * 0.5,
        size: 0.04 + Math.random() * 0.03,
        color: 0x8a8a96,
      });
    }
  }

  private animateHolySparkles(cx: number, cy: number): void {
    if (Math.random() < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.random() * 0.5;
      this.particles.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r * 0.7,
        vx: 0,
        vy: -0.005,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 0.02 + Math.random() * 0.015,
        color: 0x96ffc8,
      });
    }
  }

  private animateTorchFlicker(cx: number, cy: number): void {
    const flickerL = 0.4 + Math.sin(this.time * 10) * 0.2 + Math.random() * 0.1;
    const flickerR = 0.4 + Math.sin(this.time * 10 + 1.5) * 0.2 + Math.random() * 0.1;
    const g = new Graphics();
    g.circle(cx - 0.4, cy - 0.5, 0.06).fill({ color: 0xffa040, alpha: flickerL * 0.5 });
    g.circle(cx + 0.4, cy - 0.5, 0.06).fill({ color: 0xffa040, alpha: flickerR * 0.5 });
    this.container.addChild(g);
  }

  private updateParticles(dt: number): void {
    const dts = dt / 60;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dts;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private drawParticles(): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      const size = p.size * (1 + p.life / p.maxLife * 0.5);
      const g = new Graphics();
      g.circle(p.x, p.y, size).fill({ color: p.color, alpha: alpha * 0.6 });
      this.container.addChild(g);
    }
  }

  destroy(): void {
    this.container.removeChildren();
    this.particles = [];
  }

  getContainer(): Container {
    return this.container;
  }
}
