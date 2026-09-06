import { Application, Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { Camera } from './Camera';
import { TileRenderer } from './TileRenderer';
import { EntityRenderer } from './EntityRenderer';
import { OverlayRenderer } from './OverlayRenderer';
import { MinimapRenderer } from './MinimapRenderer';
import { EffectRenderer } from './EffectRenderer';
import { AmbientRenderer } from './AmbientRenderer';
import { AnimationRenderer } from './AnimationRenderer';
import type { GameState } from '../types/game';
import { ECSWorld } from '../engine';
import type { UIState } from '../stores/uiStore';
import { getTownHallPosition } from '../utils/worldGenerator';

export class PixiApp {
  app!: Application;
  sceneManager!: SceneManager;
  camera!: Camera;
  tileRenderer!: TileRenderer;
  entityRenderer!: EntityRenderer;
  overlayRenderer!: OverlayRenderer;
  minimapRenderer!: MinimapRenderer;
  effectRenderer!: EffectRenderer;
  ambientRenderer!: AmbientRenderer;
  animationRenderer!: AnimationRenderer;
  private container: HTMLDivElement | null = null;
  private tickerCallback: ((dt: number) => void) | null = null;
  private initialized = false;
  private destroyed = false;
  private hasInitialCamera = false;
  private world: ECSWorld = new ECSWorld();
  private resizeObserver: ResizeObserver | null = null;
  private lastState: GameState | null = null;
  private lastUIState: UIState | null = null;

  async init(container: HTMLDivElement): Promise<void> {
    this.container = container;
    this.app = new Application();

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    await this.app.init({
      width: w,
      height: h,
      backgroundColor: 0x07040d,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.canvas);

    this.sceneManager = new SceneManager(this.app);
    this.camera = new Camera(this.app, this.sceneManager.worldLayer);
    this.tileRenderer = new TileRenderer(this.app, this.sceneManager);
    this.entityRenderer = new EntityRenderer(this.app, this.sceneManager);
    this.overlayRenderer = new OverlayRenderer(this.app, this.sceneManager);
    this.minimapRenderer = new MinimapRenderer(this.app);
    this.effectRenderer = new EffectRenderer(this.app, this.sceneManager);
    this.ambientRenderer = new AmbientRenderer(this.app, this.sceneManager);
    this.animationRenderer = new AnimationRenderer(this.sceneManager);
    this.sceneManager.effectLayer.addChild(this.animationRenderer.getContainer());
    this.minimapRenderer.setCamera(this.camera);

    this.app.ticker.add((ticker) => {
      this.camera.update();
      this.minimapRenderer.updateViewportRect();
      this.animationRenderer.update(ticker.deltaTime);
      if (this.tickerCallback) this.tickerCallback(ticker.deltaTime);
    });

    window.addEventListener('resize', this.handleResize);

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(container);

    this.initialized = true;

    this.handleResize();
  }

  setTickCallback(cb: (dt: number) => void): void {
    this.tickerCallback = cb;
  }

  render(state: GameState, uiState: UIState): void {
    if (!this.app || !state || !this.initialized) return;

    this.lastState = state;
    this.lastUIState = uiState;

    if (!this.hasInitialCamera) {
      this.hasInitialCamera = true;
      const townHallPos = getTownHallPosition(state.mapSize);
      this.camera.panTo(townHallPos.x, townHallPos.y);
    }

    this.world.deserialize(state.world);
    this.animationRenderer.setWorld(this.world, this.camera);
    this.tileRenderer.render(state, this.camera);
    this.entityRenderer.render(this.world, state, this.camera, uiState);
    this.overlayRenderer.render(this.world, state, this.camera, uiState.overlayMode);
    this.effectRenderer.render(state.activeEffects ?? [], this.world, this.camera, uiState);
    this.ambientRenderer.render(state);
    this.minimapRenderer.render(state, this.world);
  }

  handleResize = (): void => {
    if (!this.app || !this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.app.renderer.resize(w, h);
    this.camera.updateViewport(w, h);
    if (this.lastState && this.lastUIState) {
      this.render(this.lastState, this.lastUIState);
    }
  };

  destroy(): void {
    this.destroyed = true;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.app && this.initialized) {
      this.animationRenderer.destroy();
      this.app.destroy(true);
    }
  }
}
