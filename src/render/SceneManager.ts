import { Application, Container } from 'pixi.js';

export class SceneManager {
  app: Application;
  worldLayer: Container;
  terrainLayer: Container;
  buildingLayer: Container;
  entityLayer: Container;
  effectLayer: Container;
  overlayLayer: Container;
  ambientLayer: Container;
  uiLayer: Container;
  minimapLayer: Container;

  constructor(app: Application) {
    this.app = app;

    this.terrainLayer = new Container();
    this.terrainLayer.label = 'terrain';

    this.buildingLayer = new Container();
    this.buildingLayer.label = 'buildings';

    this.entityLayer = new Container();
    this.entityLayer.label = 'entities';

    this.effectLayer = new Container();
    this.effectLayer.label = 'effects';

    this.overlayLayer = new Container();
    this.overlayLayer.label = 'overlays';

    this.ambientLayer = new Container();
    this.ambientLayer.label = 'ambient';

    this.uiLayer = new Container();
    this.uiLayer.label = 'ui';

    this.worldLayer = new Container();
    this.worldLayer.label = 'world';
    this.worldLayer.addChild(this.terrainLayer);
    this.worldLayer.addChild(this.buildingLayer);
    this.worldLayer.addChild(this.entityLayer);
    this.worldLayer.addChild(this.effectLayer);
    this.worldLayer.addChild(this.overlayLayer);

    this.minimapLayer = new Container();
    this.minimapLayer.label = 'minimap';

    this.app.stage.addChild(this.worldLayer);
    this.app.stage.addChild(this.ambientLayer);
    this.app.stage.addChild(this.uiLayer);
    this.app.stage.addChild(this.minimapLayer);
  }

  clearLayer(layer: Container): void {
    layer.removeChildren();
  }

  clearAll(): void {
    this.clearLayer(this.terrainLayer);
    this.clearLayer(this.buildingLayer);
    this.clearLayer(this.entityLayer);
    this.clearLayer(this.effectLayer);
    this.clearLayer(this.overlayLayer);
    this.clearLayer(this.ambientLayer);
    this.clearLayer(this.uiLayer);
    this.clearLayer(this.minimapLayer);
  }
}
