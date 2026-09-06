import React from 'react';
import { Crown, Swords, Coins } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';

export default function RivalPanel() {
  const state = useGameStore((s) => s.state);
  const rivals = state?.rivalKingdoms ?? [];

  if (rivals.length === 0) {
    return (
      <Panel as="section" ariaLabel="Rival Sovereigns" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
        <SectionHeader title="Rival Sovereigns" icon={Crown} color="text-[#ff4d6d]" as="h2" />
        <EmptyState icon={Crown} title="No Rivals" description="Rival sovereigns appear in rivalSovereigns mode." />
      </Panel>
    );
  }

  return (
    <Panel as="section" ariaLabel="Rival Sovereigns" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Rival Sovereigns" icon={Crown} color="text-[#ff4d6d]" as="h2" />

      <div className="flex flex-col gap-2">
        {rivals.map((r, idx) => (
          <div key={idx} className="rounded-lg border border-[rgba(255,77,109,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-mono text-[#eee8ff] truncate">{r.name}</span>
                <span className="text-[9px] font-mono text-[#eee8ff]/40">{r.personality}</span>
              </div>
              <Badge text="Active" color="danger" />
            </div>

            <div className="flex items-center gap-3 text-[9px] font-mono text-[#eee8ff]/50">
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#f5c84b]" />
                {r.startResources?.gold ?? 0}g
              </span>
              <span className="flex items-center gap-1">
                <Swords className="w-3 h-3 text-[#ff4d6d]" />
                {r.startHeroes} heroes
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
