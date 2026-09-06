import type { EntityId } from '../engine/Entity';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface ItemStats {
  attack?: number;
  defense?: number;
  hp?: number;
  speed?: number;
  range?: number;
  courage?: number;
}

export interface Item {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  stats: ItemStats;
  specialEffect?: string;
  description: string;
  goldValue: number;
}

export interface ItemDrop {
  item: Item;
  chance: number;
}

export interface ShopInventory {
  items: Item[];
  lastRestockDay: number;
}

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#cccccc',
  uncommon: '#4ec74e',
  rare: '#4b8bf5',
  epic: '#a020f0',
  legendary: '#ffd700',
};

export const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

export const ITEM_TEMPLATES: Item[] = [
  // Weapons
  { id: 'wpn_iron_sword', name: 'Iron Sword', slot: 'weapon', rarity: 'common', stats: { attack: 5 }, description: 'A sturdy iron blade.', goldValue: 40 },
  { id: 'wpn_steel_axe', name: 'Steel Axe', slot: 'weapon', rarity: 'uncommon', stats: { attack: 10, speed: -0.1 }, description: 'A heavy steel axe.', goldValue: 80 },
  { id: 'wpn_enchanted_blade', name: 'Enchanted Blade', slot: 'weapon', rarity: 'rare', stats: { attack: 15, courage: 10 }, description: 'A blade humming with arcane energy.', goldValue: 150 },
  { id: 'wpn_dragon_fang', name: 'Dragon Fang', slot: 'weapon', rarity: 'epic', stats: { attack: 25, speed: 0.2 }, specialEffect: 'lifesteal', description: 'Carved from a dragon\'s fang.', goldValue: 300 },
  { id: 'wpn_godslayer', name: 'Godslayer', slot: 'weapon', rarity: 'legendary', stats: { attack: 40, courage: 20 }, specialEffect: 'splash', description: 'A blade forged to slay gods.', goldValue: 600 },

  // Armor
  { id: 'arm_leather', name: 'Leather Armor', slot: 'armor', rarity: 'common', stats: { defense: 4, hp: 20 }, description: 'Basic leather protection.', goldValue: 35 },
  { id: 'arm_chainmail', name: 'Chainmail', slot: 'armor', rarity: 'uncommon', stats: { defense: 8, hp: 40 }, description: 'Interlocked iron rings.', goldValue: 70 },
  { id: 'arm_enchanted_plate', name: 'Enchanted Plate', slot: 'armor', rarity: 'rare', stats: { defense: 14, hp: 70, courage: 5 }, description: 'Plate armor with protective runes.', goldValue: 140 },
  { id: 'arm_dragon_scale', name: 'Dragon Scale Mail', slot: 'armor', rarity: 'epic', stats: { defense: 20, hp: 120 }, specialEffect: 'thorns', description: 'Forged from dragon scales.', goldValue: 280 },
  { id: 'arm_aegis', name: 'Aegis of the Crown', slot: 'armor', rarity: 'legendary', stats: { defense: 30, hp: 200, courage: 15 }, specialEffect: 'thorns', description: 'The legendary armor of the first sovereign.', goldValue: 550 },

  // Accessories
  { id: 'acc_wood_amulet', name: 'Wooden Amulet', slot: 'accessory', rarity: 'common', stats: { courage: 5 }, description: 'A simple charm.', goldValue: 25 },
  { id: 'acc_silver_ring', name: 'Silver Ring', slot: 'accessory', rarity: 'uncommon', stats: { speed: 0.15, courage: 8 }, description: 'A ring of swift movement.', goldValue: 60 },
  { id: 'acc_mana_crystal', name: 'Mana Crystal', slot: 'accessory', rarity: 'rare', stats: { attack: 5, range: 1 }, description: 'A crystal pulsing with mana.', goldValue: 120 },
  { id: 'acc_phoenix_feather', name: 'Phoenix Feather', slot: 'accessory', rarity: 'epic', stats: { hp: 80, speed: 0.2, courage: 10 }, specialEffect: 'phoenix_revive', description: 'Grants a second chance at life.', goldValue: 250 },
  { id: 'acc_crown_jewel', name: 'Crown Jewel', slot: 'accessory', rarity: 'legendary', stats: { attack: 10, defense: 10, hp: 100, speed: 0.3, courage: 20 }, description: 'The most precious gem in the realm.', goldValue: 500 },
];

export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return ITEM_TEMPLATES.filter(i => i.rarity === rarity);
}

export function getShopItems(maxGold: number): Item[] {
  return ITEM_TEMPLATES.filter(i => i.goldValue <= maxGold).slice(0, 6);
}
