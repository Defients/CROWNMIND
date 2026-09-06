import { describe, it, expect, beforeEach } from 'vitest';
import { ECSWorld } from './ECSWorld';
import { resetEntityIdCounter } from './Entity';
import type { PositionComponent, HealthComponent, NameComponent } from './Component';

describe('ECSWorld', () => {
  beforeEach(() => {
    resetEntityIdCounter();
  });

  it('creates entities with incrementing IDs', () => {
    const world = new ECSWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    expect(e2).toBeGreaterThan(e1);
  });

  it('adds and retrieves components', () => {
    const world = new ECSWorld();
    const entity = world.createEntity();
    const pos: PositionComponent = { type: 'Position', entityId: entity, x: 5, y: 10 };
    world.addComponent(entity, pos);
    const retrieved = world.getComponent<PositionComponent>(entity, 'Position');
    expect(retrieved).toBeDefined();
    expect(retrieved!.x).toBe(5);
    expect(retrieved!.y).toBe(10);
  });

  it('returns null for missing components', () => {
    const world = new ECSWorld();
    const entity = world.createEntity();
    expect(world.getComponent(entity, 'Health')).toBeUndefined();
  });

  it('queries entities by component types', () => {
    const world = new ECSWorld();
    const e1 = world.createEntity();
    world.addComponent(e1, { type: 'Position', entityId: e1, x: 0, y: 0 } as PositionComponent);
    world.addComponent(e1, { type: 'Health', entityId: e1, hp: 100, maxHp: 100 } as HealthComponent);

    const e2 = world.createEntity();
    world.addComponent(e2, { type: 'Position', entityId: e2, x: 1, y: 1 } as PositionComponent);

    const e3 = world.createEntity();
    world.addComponent(e3, { type: 'Health', entityId: e3, hp: 50, maxHp: 50 } as HealthComponent);

    const both = world.query('Position', 'Health');
    expect(both).toContain(e1);
    expect(both).not.toContain(e2);
    expect(both).not.toContain(e3);
  });

  it('destroys entities and removes their components', () => {
    const world = new ECSWorld();
    const entity = world.createEntity();
    world.addComponent(entity, { type: 'Position', entityId: entity, x: 0, y: 0 } as PositionComponent);
    world.destroyEntity(entity);
    expect(world.getComponent(entity, 'Position')).toBeUndefined();
    expect(world.query('Position')).not.toContain(entity);
  });

  it('serializes and deserializes correctly (round-trip)', () => {
    const world = new ECSWorld();
    const e1 = world.createEntity();
    world.addComponent(e1, { type: 'Position', entityId: e1, x: 3.5, y: 7.2 } as PositionComponent);
    world.addComponent(e1, { type: 'Health', entityId: e1, hp: 80, maxHp: 100 } as HealthComponent);
    world.addComponent(e1, { type: 'Name', entityId: e1, name: 'TestHero' } as NameComponent);

    const e2 = world.createEntity();
    world.addComponent(e2, { type: 'Position', entityId: e2, x: 10, y: 20 } as PositionComponent);

    const serialized = world.serialize();

    const world2 = new ECSWorld();
    world2.deserialize(serialized);

    const posIds = world2.query('Position');
    expect(posIds.length).toBe(2);

    const healthIds = world2.query('Health');
    expect(healthIds.length).toBe(1);

    const nameComp = world2.getComponent<NameComponent>(healthIds[0], 'Name');
    expect(nameComp?.name).toBe('TestHero');

    const posComp = world2.getComponent<PositionComponent>(healthIds[0], 'Position');
    expect(posComp?.x).toBe(3.5);
    expect(posComp?.y).toBe(7.2);
  });

  it('hasComponent checks correctly', () => {
    const world = new ECSWorld();
    const entity = world.createEntity();
    world.addComponent(entity, { type: 'Position', entityId: entity, x: 0, y: 0 } as PositionComponent);
    expect(world.hasComponent(entity, 'Position')).toBe(true);
    expect(world.hasComponent(entity, 'Health')).toBe(false);
  });
});
