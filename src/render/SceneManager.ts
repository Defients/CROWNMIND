import { Application, Container } from 'pixi.js';

/** Scene owns shared parents. Renderers own their permanent children; only final teardown destroys the tree. */
export class SceneManager {
  worldLayer = new Container({ label: 'world' });
  terrainLayer = new Container({ label: 'terrain' });
  buildingLayer = new Container({ label: 'buildings' });
  entityLayer = new Container({ label: 'entities' });
  effectLayer = new Container({ label: 'effects' });
  overlayLayer = new Container({ label: 'overlays' });
  ambientLayer = new Container({ label: 'ambient' });
  uiLayer = new Container({ label: 'ui' });
  minimapLayer = new Container({ label: 'minimap-layer' });
  constructor(public app: Application) {
    this.worldLayer.eventMode = 'none';
    this.worldLayer.addChild(
      this.terrainLayer,
      this.buildingLayer,
      this.entityLayer,
      this.overlayLayer,
      this.effectLayer
    );
    app.stage.addChild(this.worldLayer, this.ambientLayer, this.uiLayer, this.minimapLayer);
  }
}
