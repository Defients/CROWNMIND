import { Container, Graphics } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { GameState } from '../types/game';
import type { Camera } from './Camera';
import { QUALITY, noise, type Quality } from '../presentation/theme';

export class AmbientRenderer {
  private root = new Container();
  private lighting = new Graphics();
  private weather = new Graphics();
  private state: GameState | null = null;
  private time = 0;
  private lightingKey = '';
  count = 0;
  constructor(
    _app: unknown,
    private scene: SceneManager
  ) {
    this.root.label = 'environment';
    this.root.eventMode = 'none';
    this.root.addChild(this.lighting, this.weather);
    scene.ambientLayer.addChild(this.root);
  }
  render(state: GameState): void {
    this.state = state;
  }
  update(dt: number, quality: Quality, reducedMotion: boolean, camera: Camera): void {
    if (!this.state) return;
    this.time += dt;
    const state = this.state,
      w = this.scene.app.screen.width,
      h = this.scene.app.screen.height;
    const key = `${w}:${h}:${state.timeOfDay}:${state.weather.current}:${state.season.current}`;
    if (key !== this.lightingKey) {
      this.lightingKey = key;
      const g = this.lighting.clear(),
        tod = state.timeOfDay;
      const night = tod < 20 || tod > 80;
      if (night) g.rect(0, 0, w, h).fill({ color: 0x13172e, alpha: 0.12 });
      const dawn = tod >= 20 && tod < 40,
        dusk = tod > 60 && tod <= 80;
      if (dawn || dusk)
        for (let i = 0; i < 12; i++) {
          const strength = dawn ? (40 - tod) / 20 : (tod - 60) / 20;
          g.rect(dawn ? (i * w) / 12 : w - ((i + 1) * w) / 12, 0, w / 12 + 1, h).fill({
            color: dawn ? 0xd6a460 : 0xb25b44,
            alpha: (1 - i / 12) * strength * 0.09,
          });
        }
      if (state.weather.current === 'storm')
        g.rect(0, 0, w, h).fill({ color: 0x080d18, alpha: 0.14 });
      if (state.season.current === 'winter')
        g.rect(0, 0, w, h).fill({ color: 0x9cb6d1, alpha: 0.025 });
      if (state.season.current === 'autumn')
        g.rect(0, 0, w, h).fill({ color: 0x99763e, alpha: 0.025 });
    }
    const g = this.weather.clear(),
      type = state.weather.current;
    this.count = 0;
    if (type === 'clear') return;
    const time = reducedMotion ? 0 : this.time;
    if (type === 'fog') {
      const bands = quality === 'low' ? 3 : 6;
      for (let i = 0; i < bands; i++) {
        const x = ((noise(i, 81) * w + time * 10) % (w * 1.8)) - w * 0.4;
        for (let j = 3; j > 0; j--)
          g.ellipse(x, noise(i, 92) * h, w * (0.23 + j * 0.04), 30 + j * 30).fill({
            color: 0xa5b7bd,
            alpha: 0.012,
          });
      }
      this.count = bands;
      return;
    }
    const count = reducedMotion ? Math.min(20, QUALITY[quality].weather) : QUALITY[quality].weather;
    for (let i = 0; i < count; i++) {
      const snow = type === 'snow',
        velocity = snow ? 25 + noise(i, 11) * 20 : 280 + noise(i, 11) * 160;
      const x =
        ((((noise(i, 31) * (w + 100) + time * (snow ? 10 : -55) - camera.x * 2) % (w + 100)) +
          w +
          100) %
          (w + 100)) -
        50;
      const y = ((noise(i, 45) * (h + 100) + time * velocity) % (h + 100)) - 50;
      if (snow)
        g.circle(
          x + Math.sin(time + i) * (reducedMotion ? 0 : 8),
          y,
          0.8 + noise(i, 53) * 1.3
        ).fill({ color: 0xdce8e9, alpha: 0.35 });
      else
        g.moveTo(x, y)
          .lineTo(x - 3, y + 11)
          .stroke({ color: 0xabc7d0, width: 0.8, alpha: 0.2 });
      this.count++;
    }
  }
}
