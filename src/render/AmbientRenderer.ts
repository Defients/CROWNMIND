import { Graphics } from 'pixi.js';
import type { SceneManager } from './SceneManager';
import type { GameState } from '../types/game';

export class AmbientRenderer {
  private scene: SceneManager;

  constructor(_app: unknown, scene: SceneManager) {
    this.scene = scene;
  }

  render(state: GameState): void {
    this.scene.clearLayer(this.scene.ambientLayer);

    const w = this.scene.app.screen.width;
    const h = this.scene.app.screen.height;

    const tod = state.timeOfDay;

    let tintColor = 0x000000;
    let tintAlpha = 0;
    let dirColor = 0x000000;
    let dirAlpha = 0;
    let dirFromLeft = true;

    if (tod <= 20 || tod >= 80) {
      tintColor = 0x0a051e;
      tintAlpha = 0.22;
      dirColor = 0x0a051e;
      dirAlpha = 0.10;
    } else if (tod > 20 && tod <= 40) {
      const t = (tod - 20) / 20;
      tintColor = 0x502810;
      tintAlpha = 0.15 * (1 - t);
      dirColor = 0xc06020;
      dirAlpha = 0.08 * (1 - t * 0.5);
      dirFromLeft = true;
    } else if (tod >= 60 && tod < 80) {
      const t = (tod - 60) / 20;
      tintColor = 0x502810;
      tintAlpha = 0.15 * t;
      dirColor = 0xa03020;
      dirAlpha = 0.08 * t;
      dirFromLeft = false;
    }

    if (tintAlpha > 0) {
      const overlay = new Graphics();
      overlay.rect(0, 0, w, h).fill({ color: tintColor, alpha: tintAlpha });
      this.scene.ambientLayer.addChild(overlay);
    }

    if (dirAlpha > 0) {
      const dirOverlay = new Graphics();
      const steps = 20;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const alpha = dirAlpha * (1 - t);
        const stripW = w / steps;
        const x = dirFromLeft ? i * stripW : w - (i + 1) * stripW;
        dirOverlay.rect(x, 0, stripW + 1, h).fill({ color: dirColor, alpha });
      }
      this.scene.ambientLayer.addChild(dirOverlay);
    }

    const weather = state.weather.current;
    if (weather !== 'clear') {
      const wOverlay = new Graphics();
      switch (weather) {
        case 'rain':
          wOverlay.rect(0, 0, w, h).fill({ color: 0x3c5078, alpha: 0.12 });
          break;
        case 'snow':
          wOverlay.rect(0, 0, w, h).fill({ color: 0xc8d2e6, alpha: 0.1 });
          break;
        case 'fog':
          wOverlay.rect(0, 0, w, h).fill({ color: 0x64646e, alpha: 0.2 });
          break;
        case 'storm':
          wOverlay.rect(0, 0, w, h).fill({ color: 0x140f1e, alpha: 0.18 });
          break;
      }
      this.scene.ambientLayer.addChild(wOverlay);
    }
  }
}
