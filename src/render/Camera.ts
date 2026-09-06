import { Application, Container, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';

export class Camera {
  x = 0;
  y = 0;
  zoom = 36;
  minZoom = 8;
  maxZoom = 128;
  viewportWidth: number;
  viewportHeight: number;
  onPanEnd: (() => void) | null = null;
  onClick: ((x: number, y: number) => void) | null = null;
  onManualInput: (() => void) | null = null;
  revision = 0;
  private dragging = false;
  private downX = 0;
  private downY = 0;
  private lastX = 0;
  private lastY = 0;
  private keys = new Set<string>();
  private destination: { x: number; y: number } | null = null;
  private directorDestination = false;
  private mapSize = 64;
  private enabled = true;
  constructor(
    private app: Application,
    private worldLayer: Container
  ) {
    this.viewportWidth = app.screen.width;
    this.viewportHeight = app.screen.height;
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerdown', this.pointerDown);
    app.stage.on('pointermove', this.pointerMove);
    app.stage.on('pointerup', this.pointerUp);
    app.stage.on('pointerupoutside', this.pointerUpOutside);
    app.stage.on('wheel', this.wheel);
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    window.addEventListener('blur', this.blur);
    this.updateTransform();
  }
  setMapSize(size: number): void {
    this.mapSize = size;
  }
  setInputEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.blur();
  }
  updateViewport(w: number, h: number): void {
    this.viewportWidth = w;
    this.viewportHeight = h;
    this.app.stage.hitArea = this.app.screen;
    this.updateTransform();
  }
  manual(): void {
    this.destination = null;
    this.onManualInput?.();
  }
  setZoom(zoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.updateTransform();
  }
  zoomIn(): void {
    this.manual();
    this.setZoom(this.zoom * 1.2);
  }
  zoomOut(): void {
    this.manual();
    this.setZoom(this.zoom / 1.2);
  }
  panTo(x: number, y: number): void {
    this.destination = null;
    this.x = x;
    this.y = y;
    this.updateTransform();
  }
  easeTo(x: number, y: number, fromDirector = false): void {
    this.destination = { x, y };
    this.directorDestination = fromDirector;
  }
  cancelDirectorShot(): void {
    if (this.directorDestination) this.destination = null;
    this.directorDestination = false;
  }
  follow(target: { x: number; y: number } | null): void {
    this.destination = target;
    this.directorDestination = false;
  }
  update(dt = 1 / 60, reducedMotion = false): void {
    let dx = 0,
      dy = 0;
    if (this.keys.has('arrowleft')) dx--;
    if (this.keys.has('arrowright')) dx++;
    if (this.keys.has('arrowup')) dy--;
    if (this.keys.has('arrowdown')) dy++;
    if (dx || dy) {
      this.manual();
      this.x += (dx * dt * 450) / this.zoom;
      this.y += (dy * dt * 450) / this.zoom;
      this.updateTransform();
    } else if (this.destination) {
      const t = reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
      this.x += (this.destination.x - this.x) * t;
      this.y += (this.destination.y - this.y) * t;
      if (Math.abs(this.x - this.destination.x) + Math.abs(this.y - this.destination.y) < 0.01) {
        this.x = this.destination.x;
        this.y = this.destination.y;
        this.destination = null;
      }
      this.updateTransform();
    }
  }
  screenToWorld(x: number, y: number) {
    return {
      x: (x - this.viewportWidth / 2) / this.zoom + this.x,
      y: (y - this.viewportHeight / 2) / this.zoom + this.y,
    };
  }
  worldToScreen(x: number, y: number) {
    return {
      x: (x - this.x) * this.zoom + this.viewportWidth / 2,
      y: (y - this.y) * this.zoom + this.viewportHeight / 2,
    };
  }
  isVisible(x: number, y: number, margin = 3): boolean {
    return (
      Math.abs(x - this.x) < this.viewportWidth / (2 * this.zoom) + margin &&
      Math.abs(y - this.y) < this.viewportHeight / (2 * this.zoom) + margin
    );
  }
  getViewportBounds() {
    return {
      x: this.x - this.viewportWidth / (2 * this.zoom),
      y: this.y - this.viewportHeight / (2 * this.zoom),
      width: this.viewportWidth / this.zoom,
      height: this.viewportHeight / this.zoom,
    };
  }
  private updateTransform(): void {
    this.x = Math.max(0, Math.min(this.mapSize, this.x));
    this.y = Math.max(0, Math.min(this.mapSize, this.y));
    this.worldLayer.scale.set(this.zoom);
    this.worldLayer.position.set(
      this.viewportWidth / 2 - this.x * this.zoom,
      this.viewportHeight / 2 - this.y * this.zoom
    );
    this.revision++;
  }
  private pointerDown = (e: FederatedPointerEvent) => {
    if (!this.enabled || e.button !== 0) return;
    this.manual();
    this.dragging = true;
    this.downX = this.lastX = e.globalX;
    this.downY = this.lastY = e.globalY;
  };
  private pointerMove = (e: FederatedPointerEvent) => {
    if (!this.dragging) return;
    this.x -= (e.globalX - this.lastX) / this.zoom;
    this.y -= (e.globalY - this.lastY) / this.zoom;
    this.lastX = e.globalX;
    this.lastY = e.globalY;
    this.updateTransform();
  };
  private pointerUp = (e: FederatedPointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    if (Math.hypot(e.globalX - this.downX, e.globalY - this.downY) < 5) {
      const p = this.screenToWorld(e.globalX, e.globalY);
      this.onClick?.(p.x, p.y);
    }
    this.onPanEnd?.();
  };
  private pointerUpOutside = () => {
    this.dragging = false;
    this.onPanEnd?.();
  };
  private wheel = (e: FederatedWheelEvent) => {
    if (!this.enabled) return;
    this.manual();
    const before = this.screenToWorld(e.globalX, e.globalY);
    this.setZoom(this.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
    const after = this.screenToWorld(e.globalX, e.globalY);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.updateTransform();
  };
  private keyDown = (e: KeyboardEvent) => {
    if (!this.enabled || e.ctrlKey || e.altKey || e.metaKey) return;
    if (
      (e.target as HTMLElement).closest(
        'input, textarea, select, button, [contenteditable], [role="dialog"]'
      )
    )
      return;
    const key = e.key.toLowerCase();
    if (key.startsWith('arrow')) {
      e.preventDefault();
      this.keys.add(key);
    }
  };
  private keyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };
  private blur = () => {
    this.keys.clear();
    this.dragging = false;
  };
  destroy(): void {
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
    window.removeEventListener('blur', this.blur);
    this.app.stage.off('pointerdown', this.pointerDown);
    this.app.stage.off('pointermove', this.pointerMove);
    this.app.stage.off('pointerup', this.pointerUp);
    this.app.stage.off('pointerupoutside', this.pointerUpOutside);
    this.app.stage.off('wheel', this.wheel);
    this.keys.clear();
    this.onManualInput = this.onClick = this.onPanEnd = null;
  }
}
