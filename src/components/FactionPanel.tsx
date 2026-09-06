import React, { useMemo } from 'react';
import { Users2, MapPin, ArrowRightLeft } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { ECSWorld } from '../engine';
import type { FactionComponent, NameComponent, PositionComponent } from '../engine/Component';
import { FACTION_TYPES } from '../types/world';

const dispositionColors: Record<string, 'green' | 'warning' | 'danger'> = {
  friendly: 'green',
  neutral: 'warning',
  hostile: 'danger',
};

export default function FactionPanel() {
  const state = useGameStore((s) => s.state);

  const factions = useMemo(() => {
    if (!state) return [];
    const world = new ECSWorld();
    world.deserialize(state.world);

    const factionIds = world.query('Faction');
    return factionIds.map((id) => {
      const f = world.getComponent<FactionComponent>(id, 'Faction');
      const name = world.getComponent<NameComponent>(id, 'Name');
      const pos = world.getComponent<PositionComponent>(id, 'Position');
      const info = f ? FACTION_TYPES[f.factionType as keyof typeof FACTION_TYPES] : null;
      return {
        id,
        factionName: f?.factionName ?? name?.name ?? 'Unknown',
        factionType: f?.factionType ?? 'Unknown',
        typeLabel: info?.label ?? f?.factionType ?? 'Unknown',
        description: info?.description ?? '',
        disposition: f?.disposition ?? 'neutral',
        tradeResource: f?.tradeResource ?? null,
        tradeAmount: f?.tradeAmount ?? 0,
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
      };
    });
  }, [state]);

  return (
    <Panel as="section" ariaLabel="Faction diplomacy" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Factions" icon={Users2} color="text-[#9b5cff]" as="h2" />

      {factions.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No Factions Discovered"
          description="Factions will appear as heroes explore the map."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {factions.map((f) => (
            <div
              key={f.id}
              className="rounded-lg border border-[rgba(128,90,213,0.18)] bg-[#07040d] p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-[#eee8ff] truncate">{f.factionName}</span>
                  <span className="text-[9px] font-mono text-[#eee8ff]/40">{f.typeLabel}</span>
                </div>
                <Badge
                  text={f.disposition}
                  color={dispositionColors[f.disposition] ?? 'muted'}
                />
              </div>

              <p className="text-[10px] text-[#eee8ff]/50 leading-relaxed">{f.description}</p>

              {f.tradeResource && (
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#eee8ff]/60">
                  <ArrowRightLeft className="w-3 h-3 text-[#f5c84b]" />
                  <span>Trades {f.tradeAmount} {f.tradeResource}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-[9px] font-mono text-[#eee8ff]/30">
                <MapPin className="w-2.5 h-2.5" />
                <span>({Math.floor(f.x)}, {Math.floor(f.y)})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
