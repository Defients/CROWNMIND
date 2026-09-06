import { Application, type Ticker } from 'pixi.js';
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
import { useUIStore, type UIState } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePresentationStore } from '../stores/presentationStore';
import { getTownHallPosition } from '../utils/worldGenerator';
import {
  component,
  isObserved,
  positionOf,
  PresentationEventDeriver,
} from '../presentation/events';
import { CameraDirector } from '../presentation/CameraDirector';
import { QUALITY } from '../presentation/theme';

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
  private initialized = false;
  private destroyed = false;
  private appReady = false;
  private world = new ECSWorld();
  private resizeObserver: ResizeObserver | null = null;
  private lastState: GameState | null = null;
  private cameraRevision = -1;
  private focusRequest: UIState['cameraTarget'] = null;
  private deriver = new PresentationEventDeriver();
  private director = new CameraDirector();
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private frameTimes: number[] = [];
  private elapsed = 0;

  async init(container: HTMLDivElement): Promise<void> {
    this.container = container;
    const app = new Application();
    this.app = app;
    await app.init({
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      backgroundColor: 0x080e12,
      antialias: true,
      resolution: Math.min(
        window.devicePixelRatio || 1,
        QUALITY[useSettingsStore.getState().graphicsQuality].dpr
      ),
      autoDensity: true,
    });
    // React may dispose an instance while GPU initialization is awaiting completion.
    if (this.destroyed) {
      app.destroy(true, { children: true });
      return;
    }
    this.appReady = true;
    container.appendChild(app.canvas);
    app.canvas.setAttribute(
      'aria-label',
      'Living kingdom map. Drag to pan, wheel to zoom; inspect entities with the realm roster.'
    );
    app.canvas.tabIndex = 0;
    this.sceneManager = new SceneManager(app);
    this.camera = new Camera(app, this.sceneManager.worldLayer);
    this.tileRenderer = new TileRenderer(app, this.sceneManager);
    this.entityRenderer = new EntityRenderer(app, this.sceneManager);
    this.overlayRenderer = new OverlayRenderer(app, this.sceneManager);
    this.effectRenderer = new EffectRenderer(app, this.sceneManager);
    this.ambientRenderer = new AmbientRenderer(app, this.sceneManager);
    this.animationRenderer = new AnimationRenderer(this.sceneManager);
    this.minimapRenderer = new MinimapRenderer(app);
    this.minimapRenderer.setCamera(this.camera);
    this.camera.onClick = this.selectAt;
    this.camera.onManualInput = () => {
      this.director.suspend();
      if (useUIStore.getState().followSelected) useUIStore.setState({ followSelected: false });
    };
    app.ticker.add(this.frame);
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(container);
    this.initialized = true;
    this.handleResize();
  }
  render(state: GameState, ui: UIState): void {
    if (!this.initialized || this.destroyed) return;
    if (!this.lastState) {
      const p = getTownHallPosition(state.mapSize);
      this.camera.setMapSize(state.mapSize);
      this.camera.setZoom(Math.max(24, Math.min(42, this.camera.viewportHeight / 20)));
      this.camera.panTo(p.x + 0.5, p.y + 0.5);
    }
    if (this.lastState !== state) {
      this.world.deserialize(state.world);
      const events = this.deriver.derive(state);
      this.effectRenderer.ingest(events, useSettingsStore.getState().graphicsQuality);
      this.director.ingest(events);
      usePresentationStore.getState().publish(events.filter((e) => e.priority >= 40));
      this.animationRenderer.setWorld(this.world, this.camera);
      this.entityRenderer.render(this.world, state, this.camera, ui);
      this.minimapRenderer.render(state, this.world);
      this.ambientRenderer.render(state);
      this.lastState = state;
    }
    this.tileRenderer.render(state, this.camera);
    this.overlayRenderer.render(this.world, state, this.camera, ui.overlayMode);
    if (ui.cameraTarget && ui.cameraTarget !== this.focusRequest) {
      this.focusRequest = ui.cameraTarget;
      this.camera.manual();
      if (this.motion.matches) this.camera.panTo(ui.cameraTarget.x, ui.cameraTarget.y);
      else this.camera.easeTo(ui.cameraTarget.x, ui.cameraTarget.y);
    }
  }
  private frame = (ticker: Ticker): void => {
    if (!this.lastState || this.destroyed) return;
    const state = this.lastState,
      ui = useUIStore.getState(),
      settings = useSettingsStore.getState();
    const dt = Math.min(ticker.deltaMS / 1000, 0.05),
      reduced = this.motion.matches;
    const blocked =
      (!!ui.workspace && ui.workspace !== 'inspector') || ui.showSettings || ui.showSaveLoad;
    this.camera.setInputEnabled(!blocked);
    const following = ui.followSelected && ui.selection.entityId != null;
    if (following) {
      const p = this.entityRenderer.position(ui.selection.entityId!);
      if (p) this.camera.follow(p);
      else useUIStore.setState({ followSelected: false });
    }
    const directorStatus = this.director.update(
      dt,
      this.camera,
      ui.directorMode,
      following,
      blocked || !!ui.workspace,
      reduced
    );
    usePresentationStore.getState().setDirectorStatus(directorStatus);
    this.camera.update(dt, reduced);
    if (this.cameraRevision !== this.camera.revision) {
      this.cameraRevision = this.camera.revision;
      this.tileRenderer.render(state, this.camera);
      this.overlayRenderer.render(this.world, state, this.camera, ui.overlayMode);
      this.minimapRenderer.updateViewportRect();
    }
    this.entityRenderer.update(dt, this.camera, ui.selection.entityId, reduced);
    this.effectRenderer.update(dt, state, ui, this.camera, reduced, this.visualPosition);
    const visualDt = dt * settings.animationSpeed;
    this.animationRenderer.update(
      visualDt,
      settings.graphicsQuality,
      reduced,
      state.timeOfDay < 20 || state.timeOfDay > 80
    );
    this.ambientRenderer.update(visualDt, settings.graphicsQuality, reduced, this.camera);
    const resolution = Math.min(
      window.devicePixelRatio || 1,
      QUALITY[settings.graphicsQuality].dpr
    );
    if (this.app.renderer.resolution !== resolution) {
      this.app.renderer.resolution = resolution;
      this.handleResize();
    }
    this.elapsed += dt;
    if (this.elapsed > 2) {
      this.frameTimes.push(ticker.elapsedMS);
      if (this.frameTimes.length > 600) this.frameTimes.shift();
    }
  };
  private visualPosition = (id: number) => this.entityRenderer.position(id);
  private selectAt = (x: number, y: number): void => {
    const state = this.lastState;
    if (!state) return;
    let nearest: { id: number; distance: number; type: string } | undefined;
    for (const key of Object.keys(state.world.entities)) {
      const id = Number(key);
      if (!isObserved(state, id)) continue;
      const p = this.entityRenderer.position(id) ?? positionOf(state, id);
      if (!p) continue;
      const hp = component(state, id, 'Health');
      if (hp && hp.hp <= 0) continue;
      const type = component(state, id, 'HeroAI')
        ? 'hero'
        : component(state, id, 'MonsterAI')
          ? 'monster'
          : component(state, id, 'Building')
            ? 'building'
            : component(state, id, 'Lair')
              ? 'lair'
              : component(state, id, 'Faction')
                ? 'faction'
                : '';
      if (!type) continue;
      const distance = Math.hypot(p.x - x, p.y - y),
        radius = type === 'building' ? 1.15 : type === 'lair' ? 1 : 0.65;
      if (distance < radius && (!nearest || distance < nearest.distance))
        nearest = { id, distance, type };
    }
    if (nearest) useUIStore.getState().selectEntity(nearest.id, nearest.type, x, y);
    else if (state.grid[Math.floor(x)]?.[Math.floor(y)]?.isExplored)
      useUIStore.getState().selectEntity(null, 'tile', Math.floor(x), Math.floor(y));
    else useUIStore.getState().selectEntity(null, null);
  };
  recenter(): void {
    if (!this.lastState) return;
    const p = getTownHallPosition(this.lastState.mapSize);
    this.camera.manual();
    this.camera.easeTo(p.x + 0.5, p.y + 0.5);
  }
  handleResize = (): void => {
    if (!this.initialized || this.destroyed || !this.container) return;
    const w = this.container.clientWidth,
      h = this.container.clientHeight;
    if (!w || !h) return;
    this.app.renderer.resize(w, h);
    this.camera.updateViewport(w, h);
  };
  diagnostics() {
    const frames = [...this.frameTimes].sort((a, b) => a - b);
    return {
      tiles: this.tileRenderer.count,
      entities: this.entityRenderer.count,
      effects: this.effectRenderer.count,
      motes: this.animationRenderer.count,
      weather: this.ambientRenderer.count,
      frameSamples: frames.length,
      medianFrameMS: frames[Math.floor(frames.length * 0.5)] ?? null,
      p95FrameMS: frames[Math.floor(frames.length * 0.95)] ?? null,
      persistentAnimationAttached:
        this.animationRenderer.getContainer().parent === this.sceneManager.effectLayer,
      resolution: this.app.renderer.resolution,
    };
  }
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    if (this.appReady) {
      this.app.ticker.remove(this.frame);
      this.camera?.destroy();
      this.app.destroy(true, { children: true });
      this.appReady = false;
      this.initialized = false;
    }
    this.lastState = null;
    this.deriver.reset();
  }
}
