import type { ECSWorld, EntityId } from '../engine';
import type { EquipmentComponent, InventoryComponent, CombatComponent, HealthComponent, HeroAIComponent } from '../engine/Component';
import { ITEM_TEMPLATES, RARITY_WEIGHTS } from '../types/equipment';
import type { Item, ItemRarity, EquipmentSlot } from '../types/equipment';
import { BALANCE } from '../utils/balance';
import type { SeededRNG } from '../utils/rng';

export function initEquipment(world: ECSWorld, entityId: EntityId): void {
  world.addComponent(entityId, {
    type: 'Equipment', entityId,
    weapon: null, armor: null, accessory: null,
  });
  world.addComponent(entityId, {
    type: 'Inventory', entityId,
    items: [],
  });
}

export function equipItem(world: ECSWorld, entityId: EntityId, item: Item): boolean {
  const equip = world.getComponent<EquipmentComponent>(entityId, 'Equipment');
  if (!equip) return false;

  const slot = item.slot;
  const currentItemId = equip[slot];
  if (currentItemId) {
    unequipItem(world, entityId, slot);
  }

  equip[slot] = item.id;
  applyEquipmentStats(world, entityId, item, true);
  return true;
}

export function unequipItem(world: ECSWorld, entityId: EntityId, slot: EquipmentSlot): Item | null {
  const equip = world.getComponent<EquipmentComponent>(entityId, 'Equipment');
  if (!equip || !equip[slot]) return null;

  const itemId = equip[slot];
  const item = ITEM_TEMPLATES.find(i => i.id === itemId);
  if (item) {
    applyEquipmentStats(world, entityId, item, false);
  }

  equip[slot] = null;

  const inv = world.getComponent<InventoryComponent>(entityId, 'Inventory');
  if (inv && item) {
    inv.items = [...inv.items, item.id];
  }

  return item ?? null;
}

export function addItemToInventory(world: ECSWorld, entityId: EntityId, itemId: string): void {
  const inv = world.getComponent<InventoryComponent>(entityId, 'Inventory');
  if (inv) {
    inv.items = [...inv.items, itemId];
  }
}

export function removeItemFromInventory(world: ECSWorld, entityId: EntityId, itemId: string): void {
  const inv = world.getComponent<InventoryComponent>(entityId, 'Inventory');
  if (inv) {
    inv.items = inv.items.filter(id => id !== itemId);
  }
}

function applyEquipmentStats(world: ECSWorld, entityId: EntityId, item: Item, isEquipping: boolean): void {
  const combat = world.getComponent<CombatComponent>(entityId, 'Combat');
  const health = world.getComponent<HealthComponent>(entityId, 'Health');
  const heroAI = world.getComponent<HeroAIComponent>(entityId, 'HeroAI');
  if (!combat || !health) return;

  const sign = isEquipping ? 1 : -1;
  const s = item.stats;

  if (s.attack) combat.attack += sign * s.attack;
  if (s.defense) combat.defense += sign * s.defense;
  if (s.hp) {
    health.maxHp += sign * s.hp;
    if (isEquipping) health.hp = Math.min(health.maxHp, health.hp + s.hp);
    else health.hp = Math.min(health.hp, health.maxHp);
  }
  if (s.speed) combat.speed += sign * s.speed;
  if (s.range) combat.range += sign * s.range;
  if (s.courage && heroAI) {
    heroAI.courage = Math.max(0, Math.min(100, heroAI.courage + sign * s.courage));
  }
}

export function computeGearStats(world: ECSWorld, entityId: EntityId): { attack: number; defense: number; hp: number; speed: number; range: number; courage: number } {
  const equip = world.getComponent<EquipmentComponent>(entityId, 'Equipment');
  if (!equip) return { attack: 0, defense: 0, hp: 0, speed: 0, range: 0, courage: 0 };

  const total = { attack: 0, defense: 0, hp: 0, speed: 0, range: 0, courage: 0 };
  for (const slot of ['weapon', 'armor', 'accessory'] as EquipmentSlot[]) {
    const itemId = equip[slot];
    if (!itemId) continue;
    const item = ITEM_TEMPLATES.find(i => i.id === itemId);
    if (!item) continue;
    const s = item.stats;
    if (s.attack) total.attack += s.attack;
    if (s.defense) total.defense += s.defense;
    if (s.hp) total.hp += s.hp;
    if (s.speed) total.speed += s.speed;
    if (s.range) total.range += s.range;
    if (s.courage) total.courage += s.courage;
  }
  return total;
}

export function rollItemDrop(monsterLevel: number, rng: SeededRNG, luckMultiplier: number = 1): Item | null {
  const dropChance = BALANCE.equipment.baseDropChance * luckMultiplier;
  if (!rng.chance(dropChance)) return null;

  const rarity = rollRarity(rng);
  const candidates = ITEM_TEMPLATES.filter(i => i.rarity === rarity);
  if (candidates.length === 0) return null;

  return rng.pick(candidates);
}

export function rollBossDrop(monsterLevel: number, rng: SeededRNG): Item {
  const rarity = rollRarity(rng, true);
  const candidates = ITEM_TEMPLATES.filter(i => i.rarity === rarity);
  if (candidates.length === 0) {
    return rng.pick(ITEM_TEMPLATES);
  }
  return rng.pick(candidates);
}

function rollRarity(rng: SeededRNG, isBoss: boolean = false): ItemRarity {
  const weights = BALANCE.equipment.rarityWeights;
  const totalWeight = weights.common + weights.uncommon + weights.rare + weights.epic + weights.legendary;
  let roll = rng.next() * totalWeight;

  if (isBoss) {
    roll = rng.next() * (weights.rare + weights.epic + weights.legendary);
    if (roll < weights.rare) return 'rare';
    if (roll < weights.rare + weights.epic) return 'epic';
    return 'legendary';
  }

  if (roll < weights.common) return 'common';
  roll -= weights.common;
  if (roll < weights.uncommon) return 'uncommon';
  roll -= weights.uncommon;
  if (roll < weights.rare) return 'rare';
  roll -= weights.rare;
  if (roll < weights.epic) return 'epic';
  return 'legendary';
}

export function autoEquipBestItems(world: ECSWorld, entityId: EntityId): void {
  const inv = world.getComponent<InventoryComponent>(entityId, 'Inventory');
  const equip = world.getComponent<EquipmentComponent>(entityId, 'Equipment');
  if (!inv || !equip) return;

  const heroAI = world.getComponent<HeroAIComponent>(entityId, 'HeroAI');
  const isFrontline = !!(heroAI?.heroClass.includes('Fighter') || heroAI?.heroClass.includes('Paladin') || heroAI?.heroClass.includes('Runesmith'));

  for (const slot of ['weapon', 'armor', 'accessory'] as EquipmentSlot[]) {
    const candidates = inv.items
      .map(id => ITEM_TEMPLATES.find(i => i.id === id))
      .filter((i): i is Item => i !== undefined && i.slot === slot);

    if (candidates.length === 0) continue;

    candidates.sort((a, b) => {
      const aScore = scoreItem(a, isFrontline);
      const bScore = scoreItem(b, isFrontline);
      return bScore - aScore;
    });

    const best = candidates[0];
    if (best) {
      inv.items = inv.items.filter(id => id !== best.id);
      equipItem(world, entityId, best);
    }
  }
}

function scoreItem(item: Item, isFrontline: boolean): number {
  let score = 0;
  if (item.stats.attack) score += item.stats.attack * (isFrontline ? 2 : 1.5);
  if (item.stats.defense) score += item.stats.defense * (isFrontline ? 2 : 1);
  if (item.stats.hp) score += item.stats.hp * 0.5;
  if (item.stats.speed) score += item.stats.speed * 10;
  if (item.stats.range) score += item.stats.range * 5;
  if (item.stats.courage) score += item.stats.courage * 0.5;
  const rarityBonus: Record<ItemRarity, number> = { common: 0, uncommon: 10, rare: 25, epic: 50, legendary: 100 };
  score += rarityBonus[item.rarity];
  return score;
}

export function getShopInventory(maxGold: number, currentDay: number): Item[] {
  const restockDay = Math.floor(currentDay / BALANCE.equipment.shopRestockInterval);
  const seed = restockDay * 9973;
  const rng = createRNGFromSeed(seed);
  const pool = ITEM_TEMPLATES.filter(i => i.goldValue <= maxGold * 2);
  const inventory: Item[] = [];
  const used = new Set<string>();
  for (let i = 0; i < BALANCE.equipment.shopInventorySize && pool.length > 0; i++) {
    const available = pool.filter(i => !used.has(i.id));
    if (available.length === 0) break;
    const item = rng.pick(available);
    used.add(item.id);
    inventory.push(item);
  }
  return inventory;
}

function createRNGFromSeed(seed: number): { pick: <T>(arr: T[]) => T; next: () => number } {
  let state = seed;
  return {
    next: () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    },
    pick: <T>(arr: T[]): T => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return arr[Math.floor((state / 4294967296) * arr.length)];
    },
  };
}
