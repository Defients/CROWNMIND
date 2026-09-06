import type { EntityId } from './Entity';
import type { ComponentType, AnyComponent } from './Component';

export class ECSWorld {
  private entities: Set<EntityId> = new Set();
  private components: Map<ComponentType, Map<EntityId, AnyComponent>> = new Map();
  private nextId: number = 1;
  private deletedEntities: EntityId[] = [];

  createEntity(): EntityId {
    const id = this.nextId++;
    this.entities.add(id);
    return id;
  }

  destroyEntity(id: EntityId): void {
    if (!this.entities.has(id)) return;
    this.entities.delete(id);
    this.deletedEntities.push(id);
    for (const [, componentMap] of this.components) {
      componentMap.delete(id);
    }
  }

  addComponent<T extends AnyComponent>(entityId: EntityId, component: T): T {
    if (!this.components.has(component.type)) {
      this.components.set(component.type, new Map());
    }
    component.entityId = entityId;
    this.components.get(component.type)!.set(entityId, component);
    return component;
  }

  removeComponent(entityId: EntityId, type: ComponentType): void {
    const componentMap = this.components.get(type);
    if (componentMap) {
      componentMap.delete(entityId);
    }
  }

  getComponent<T extends AnyComponent>(entityId: EntityId, type: ComponentType): T | undefined {
    const componentMap = this.components.get(type);
    if (!componentMap) return undefined;
    return componentMap.get(entityId) as T | undefined;
  }

  hasComponent(entityId: EntityId, type: ComponentType): boolean {
    const componentMap = this.components.get(type);
    return componentMap?.has(entityId) ?? false;
  }

  query(...types: ComponentType[]): EntityId[] {
    if (types.length === 0) return [...this.entities];

    let smallestMap: Map<EntityId, AnyComponent> | null = null;
    let smallestSize = Infinity;

    for (const type of types) {
      const map = this.components.get(type);
      if (!map || map.size === 0) return [];
      if (map.size < smallestSize) {
        smallestSize = map.size;
        smallestMap = map;
      }
    }

    if (!smallestMap) return [];

    const result: EntityId[] = [];
    for (const entityId of smallestMap.keys()) {
      if (types.every(t => this.hasComponent(entityId, t))) {
        result.push(entityId);
      }
    }
    return result;
  }

  queryComponents<T extends AnyComponent>(...types: ComponentType[]): Array<{ entityId: EntityId; components: Record<ComponentType, AnyComponent> }> {
    const entityIds = this.query(...types);
    return entityIds.map(entityId => {
      const components: Record<ComponentType, AnyComponent> = {} as Record<ComponentType, AnyComponent>;
      for (const type of types) {
        const comp = this.getComponent<AnyComponent>(entityId, type);
        if (comp) components[type] = comp;
      }
      return { entityId, components };
    });
  }

  getAllEntities(): EntityId[] {
    return [...this.entities];
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  getDeletedEntities(): EntityId[] {
    return this.deletedEntities;
  }

  clearDeletedEntities(): void {
    this.deletedEntities = [];
  }

  clear(): void {
    this.entities.clear();
    this.components.clear();
    this.nextId = 1;
    this.deletedEntities = [];
  }

  getNextId(): number {
    return this.nextId;
  }

  setNextId(id: number): void {
    this.nextId = id;
  }

  serialize(): SerializedWorld {
    const entityData: Record<number, Record<string, AnyComponent>> = {};
    for (const entityId of this.entities) {
      entityData[entityId] = {};
      for (const [type, componentMap] of this.components) {
        const comp = componentMap.get(entityId);
        if (comp) {
          entityData[entityId][type] = { ...comp };
        }
      }
    }
    return {
      entities: entityData,
      nextId: this.nextId,
    };
  }

  deserialize(data: SerializedWorld): void {
    this.clear();
    this.nextId = data.nextId;
    for (const [entityIdStr, components] of Object.entries(data.entities)) {
      const entityId = Number(entityIdStr);
      this.entities.add(entityId);
      for (const comp of Object.values(components)) {
        this.addComponent(entityId, { ...comp } as AnyComponent);
      }
    }
  }
}

export interface SerializedWorld {
  entities: Record<number, Record<string, AnyComponent>>;
  nextId: number;
}
