export type ResourceType = 'gold' | 'wood' | 'stone' | 'food' | 'mana' | 'population';

export interface ResourceCost {
  gold: number;
  wood: number;
  stone: number;
}

export interface ResourceState {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  mana: number;
  population: number;
}

export interface ResourceCapacity {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  mana: number;
  population: number;
}

export const RESOURCE_TYPES: ResourceType[] = ['gold', 'wood', 'stone', 'food', 'mana', 'population'];

export const RESOURCE_ICONS: Record<ResourceType, string> = {
  gold: 'Coins',
  wood: 'Tree',
  stone: 'Mountain',
  food: 'Wheat',
  mana: 'Crystal',
  population: 'Person',
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  gold: '#f5c84b',
  wood: '#8b6f47',
  stone: '#a0a0a0',
  food: '#38e68b',
  mana: '#9b5cff',
  population: '#26f4ff',
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  gold: 'Gold',
  wood: 'Wood',
  stone: 'Stone',
  food: 'Food',
  mana: 'Mana',
  population: 'Population',
};

export function emptyResourceState(): ResourceState {
  return { gold: 0, wood: 0, stone: 0, food: 0, mana: 0, population: 0 };
}

export function emptyResourceCapacity(): ResourceCapacity {
  return { gold: 9999, wood: 500, stone: 500, food: 500, mana: 200, population: 10 };
}

export function canAfford(resources: ResourceState, cost: Partial<ResourceState>): boolean {
  for (const key of Object.keys(cost) as ResourceType[]) {
    if ((resources[key] ?? 0) < (cost[key] ?? 0)) return false;
  }
  return true;
}

export function spendResources(resources: ResourceState, cost: Partial<ResourceState>): ResourceState {
  const result = { ...resources };
  for (const key of Object.keys(cost) as ResourceType[]) {
    result[key] = Math.max(0, result[key] - (cost[key] ?? 0));
  }
  return result;
}

export function addResources(resources: ResourceState, amount: Partial<ResourceState>, capacity?: ResourceCapacity): ResourceState {
  const result = { ...resources };
  for (const key of Object.keys(amount) as ResourceType[]) {
    const add = amount[key] ?? 0;
    if (capacity) {
      result[key] = Math.min(capacity[key], result[key] + add);
    } else {
      result[key] = result[key] + add;
    }
  }
  return result;
}
