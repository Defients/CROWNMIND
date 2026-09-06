import React, { useMemo } from 'react';
import { Sword, Shield, Gem, ShoppingBag } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { ECSWorld } from '../engine';
import type { HeroAIComponent, EquipmentComponent, InventoryComponent, NameComponent } from '../engine/Component';
import { ITEM_TEMPLATES, RARITY_COLORS } from '../types/equipment';
import type { ItemRarity } from '../types/equipment';

const rarityBadgeColor: Record<ItemRarity, 'muted' | 'green' | 'warning' | 'danger'> = {
  common: 'muted',
  uncommon: 'green',
  rare: 'warning',
  epic: 'danger',
  legendary: 'warning',
};

const slotIcon: Record<string, typeof Sword> = {
  weapon: Sword,
  armor: Shield,
  accessory: Gem,
};

export default function EquipmentPanel() {
  const state = useGameStore((s) => s.state);

  const heroes = useMemo(() => {
    if (!state) return [];
    const world = new ECSWorld();
    world.deserialize(state.world);
    const heroIds = world.query('HeroAI', 'Equipment');
    return heroIds.map((id) => {
      const hero = world.getComponent<HeroAIComponent>(id, 'HeroAI');
      const name = world.getComponent<NameComponent>(id, 'Name');
      const equip = world.getComponent<EquipmentComponent>(id, 'Equipment');
      const inv = world.getComponent<InventoryComponent>(id, 'Inventory');
      const equippedItems: { slot: string; item: typeof ITEM_TEMPLATES[0] | null }[] = [];
      for (const slot of ['weapon', 'armor', 'accessory'] as const) {
        const itemId = equip?.[slot] ?? null;
        const item = itemId ? ITEM_TEMPLATES.find(i => i.id === itemId) ?? null : null;
        equippedItems.push({ slot, item });
      }
      return {
        id,
        name: name?.name ?? 'Unknown',
        heroClass: hero?.heroClass ?? 'Unknown',
        level: hero?.level ?? 1,
        equipped: equippedItems,
        inventoryCount: inv?.items.length ?? 0,
      };
    });
  }, [state]);

  return (
    <Panel as="section" ariaLabel="Equipment" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Equipment" icon={Sword} color="text-[#9b5cff]" as="h2" />

      {heroes.length === 0 ? (
        <EmptyState icon={Sword} title="No Heroes" description="Hire heroes to manage their equipment." />
      ) : (
        <div className="flex flex-col gap-2">
          {heroes.map((h) => (
            <div key={h.id} className="rounded-lg border border-[rgba(128,90,213,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-[#eee8ff] truncate">{h.name}</span>
                  <span className="text-[9px] font-mono text-[#eee8ff]/40">{h.heroClass} Lv.{h.level}</span>
                </div>
                <span className="text-[9px] font-mono text-[#eee8ff]/30 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  {h.inventoryCount}
                </span>
              </div>
              <div className="flex gap-1.5">
                {h.equipped.map(({ slot, item }) => {
                  const Icon = slotIcon[slot] ?? Sword;
                  return (
                    <div key={slot} className="flex-1 rounded-md border border-[rgba(128,90,213,0.12)] bg-[#120b1c] p-1.5 flex flex-col items-center gap-0.5">
                      <Icon className="w-3 h-3" style={item ? { color: RARITY_COLORS[item.rarity] } : { color: 'rgba(238,232,255,0.2)' }} />
                      <span className="text-[8px] font-mono text-[#eee8ff]/40">{slot}</span>
                      {item && <Badge text={item.rarity} color={rarityBadgeColor[item.rarity] ?? 'muted'} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
