import { Application, Container, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';

export class Camera {
  private app: Application;
  private worldLayer: Container;
  x: number = 0;
  y: number = 0;
  zoom: number = 14;
  minZoom: number = 4;
  maxZoom: number = 256;
  private isDragging: boolean = false;
  private lastDragX: number = 0;
  private lastDragY: number = 0;
  private downX: number = 0;
  private downY: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  private followTarget: { x: number; y: number } | null = null;
  private keys: Set<string> = new Set();
  private keyHandlerDown: ((e: KeyboardEvent) => void) | null = null;
  private keyHandlerUp: ((e: KeyboardEvent) => void) | null = null;

  onPanEnd: (() => void) | null = null;
  onClick: ((worldX: number, worldY: number) => void) | null = null;

  constructor(app: Application, worldLayer: Container) {
    this.app = app;
    this.worldLayer = worldLayer;
    this.viewportWidth = app.screen.width;
    this.viewportHeight = app.screen.height;
    this.setupInput();
    this.setupKeyboard();
    this.updateTransform();
  }

  updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.updateTransform();
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.updateTransform();
  }

  zoomIn(): void {
    this.setZoom(this.zoom * 1.15);
  }

  zoomOut(): void {
    this.setZoom(this.zoom / 1.15);
  }

  panTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.updateTransform();
  }

  follow(target: { x: number; y: number } | null): void {
    this.followTarget = target;
  }

  update(): void {
    if (this.followTarget) {
      this.x = this.followTarget.x;
      this.y = this.followTarget.y;
      this.updateTransform();
      return;
    }
    this.handleKeyboardPan();
  }

  private handleKeyboardPan(): void {
    if (this.keys.size === 0) return;
    const panSpeed = 3.0 / this.zoom;
    let dx = 0, dy = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= panSpeed;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += panSpeed;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= panSpeed;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += panSpeed;
    if (dx !== 0 || dy !== 0) {
      this.x += dx;
      this.y += dy;
      this.updateTransform();
    }
  }

  private setupKeyboard(): void {
    this.keyHandlerDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const key = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) {
        this.keys.add(key);
        this.followTarget = null;
      }
    };
    this.keyHandlerUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
    };
    window.addEventListener('keydown', this.keyHandlerDown);
    window.addEventListener('keyup', this.keyHandlerUp);
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const worldX = (screenX - this.viewportWidth / 2) / this.zoom + this.x;
    const worldY = (screenY - this.viewportHeight / 2) / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const screenX = (worldX - this.x) * this.zoom + this.viewportWidth / 2;
    const screenY = (worldY - this.y) * this.zoom + this.viewportHeight / 2;
    return { x: screenX, y: screenY };
  }

  isVisible(worldX: number, worldY: number, margin: number = 2): boolean {
    const screen = this.worldToScreen(worldX, worldY);
    return (
      screen.x > -margin * this.zoom &&
      screen.x < this.viewportWidth + margin * this.zoom &&
      screen.y > -margin * this.zoom &&
      screen.y < this.viewportHeight + margin * this.zoom
    );
  }

  getViewportBounds(): { x: number; y: number; width: number; height: number } {
    const halfW = this.viewportWidth / (2 * this.zoom);
    const halfH = this.viewportHeight / (2 * this.zoom);
    return {
      x: this.x - halfW,
      y: this.y - halfH,
      width: halfW * 2,
      height: halfH * 2,
    };
  }

  private updateTransform(): void {
    this.worldLayer.scale.set(this.zoom);
    this.worldLayer.x = this.viewportWidth / 2 - this.x * this.zoom;
    this.worldLayer.y = this.viewportHeight / 2 - this.y * this.zoom;
  }

  private setupInput(): void {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
      this.isDragging = true;
      this.lastDragX = e.globalX;
      this.lastDragY = e.globalY;
      this.downX = e.globalX;
      this.downY = e.globalY;
    });

    this.app.stage.on('pointermove', (e: FederatedPointerEvent) => {
      if (!this.isDragging) return;
      const dx = (e.globalX - this.lastDragX) / this.zoom;
      const dy = (e.globalY - this.lastDragY) / this.zoom;
      this.x -= dx;
      this.y -= dy;
      this.lastDragX = e.globalX;
      this.lastDragY = e.globalY;
      this.followTarget = null;
      this.updateTransform();
    });

    const handlePointerUp = (e: FederatedPointerEvent) => {
      if (this.isDragging) {
        const moved = Math.abs(e.globalX - this.downX) > 3 || Math.abs(e.globalY - this.downY) > 3;
        this.isDragging = false;
        if (!moved && this.onClick) {
          const world = this.screenToWorld(e.globalX, e.globalY);
          this.onClick(world.x, world.y);
        }
        if (this.onPanEnd) this.onPanEnd();
      }
    };

    this.app.stage.on('pointerup', handlePointerUp);
    this.app.stage.on('pointerupoutside', handlePointerUp);

    this.app.stage.on('wheel', (e: FederatedWheelEvent) => {
      const wheelEvent = e.nativeEvent as WheelEvent;
      if (wheelEvent.deltaY < 0) this.zoomIn();
      else this.zoomOut();
    });
  }
}
