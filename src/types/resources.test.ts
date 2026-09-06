import { describe, it, expect } from 'vitest';
import {
  emptyResourceState,
  emptyResourceCapacity,
  canAfford,
  spendResources,
  addResources,
} from './resources';
import type { ResourceState, ResourceCapacity } from './resources';

describe('emptyResourceState', () => {
  it('returns an object with all resources at 0', () => {
    const state = emptyResourceState();
    expect(state.gold).toBe(0);
    expect(state.wood).toBe(0);
    expect(state.stone).toBe(0);
    expect(state.food).toBe(0);
    expect(state.mana).toBe(0);
    expect(state.population).toBe(0);
  });
});

describe('emptyResourceCapacity', () => {
  it('returns an object with default starting capacities', () => {
    const cap = emptyResourceCapacity();
    expect(cap.gold).toBe(9999);
    expect(cap.wood).toBe(500);
    expect(cap.stone).toBe(500);
    expect(cap.food).toBe(500);
    expect(cap.mana).toBe(200);
    expect(cap.population).toBe(10);
  });
});

describe('canAfford', () => {
  it('returns true when resources meet cost', () => {
    const resources: ResourceState = { gold: 100, wood: 50, stone: 30, food: 20, mana: 10, population: 5 };
    const cost: Partial<ResourceState> = { gold: 50, wood: 20, stone: 0 };
    expect(canAfford(resources, cost)).toBe(true);
  });

  it('returns false when resources are insufficient', () => {
    const resources: ResourceState = { gold: 10, wood: 50, stone: 30, food: 20, mana: 10, population: 5 };
    const cost: Partial<ResourceState> = { gold: 50, wood: 20, stone: 0 };
    expect(canAfford(resources, cost)).toBe(false);
  });

  it('returns true for empty cost', () => {
    const resources: ResourceState = { gold: 0, wood: 0, stone: 0, food: 0, mana: 0, population: 0 };
    expect(canAfford(resources, {})).toBe(true);
  });
});

describe('spendResources', () => {
  it('subtracts cost from resources', () => {
    const resources: ResourceState = { gold: 100, wood: 50, stone: 0, food: 0, mana: 0, population: 0 };
    const cost: Partial<ResourceState> = { gold: 30, wood: 10, stone: 0 };
    const result = spendResources(resources, cost);
    expect(result.gold).toBe(70);
    expect(result.wood).toBe(40);
  });

  it('does not go below 0', () => {
    const resources: ResourceState = { gold: 10, wood: 0, stone: 0, food: 0, mana: 0, population: 0 };
    const cost: Partial<ResourceState> = { gold: 50, wood: 0, stone: 0 };
    const result = spendResources(resources, cost);
    expect(result.gold).toBeLessThanOrEqual(0);
  });
});

describe('addResources', () => {
  it('adds production to resources', () => {
    const resources: ResourceState = { gold: 50, wood: 0, stone: 0, food: 0, mana: 0, population: 0 };
    const production: Partial<ResourceState> = { gold: 30, wood: 10 };
    const cap: ResourceCapacity = { gold: 100, wood: 100, stone: 100, food: 100, mana: 100, population: 100 };
    const result = addResources(resources, production, cap);
    expect(result.gold).toBe(80);
    expect(result.wood).toBe(10);
  });

  it('respects capacity limits', () => {
    const resources: ResourceState = { gold: 90, wood: 0, stone: 0, food: 0, mana: 0, population: 0 };
    const production: Partial<ResourceState> = { gold: 30 };
    const cap: ResourceCapacity = { gold: 100, wood: 100, stone: 100, food: 100, mana: 100, population: 100 };
    const result = addResources(resources, production, cap);
    expect(result.gold).toBeLessThanOrEqual(100);
  });
});
