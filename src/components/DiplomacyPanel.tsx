import React, { useMemo } from 'react';
import { Handshake, Scroll, Gavel, Heart } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { useDiplomacyStore } from '../stores/diplomacyStore';
import { ECSWorld } from '../engine';
import type { FactionComponent, DiplomacyComponent, NameComponent } from '../engine/Component';

const standingColor = (standing: number): 'green' | 'warning' | 'danger' | 'muted' => {
  if (standing >= 60) return 'green';
  if (standing >= 20) return 'warning';
  if (standing <= -20) return 'danger';
  return 'muted';
};

const standingLabel = (standing: number): string => {
  if (standing >= 80) return 'Allied';
  if (standing >= 60) return 'Friendly';
  if (standing >= 20) return 'Neutral';
  if (standing >= -20) return 'Wary';
  return 'Hostile';
};

export default function DiplomacyPanel() {
  const state = useGameStore((s) => s.state);
  const treaties = useDiplomacyStore((s) => s.treaties);
  const quests = useDiplomacyStore((s) => s.quests);

  const factions = useMemo(() => {
    if (!state) return [];
    const world = new ECSWorld();
    world.deserialize(state.world);
    const factionIds = world.query('Faction', 'Diplomacy');
    return factionIds.map((id) => {
      const f = world.getComponent<FactionComponent>(id, 'Faction');
      const dip = world.getComponent<DiplomacyComponent>(id, 'Diplomacy');
      const name = world.getComponent<NameComponent>(id, 'Name');
      return {
        id,
        name: f?.factionName ?? name?.name ?? 'Unknown',
        factionType: f?.factionType ?? 'Unknown',
        standing: dip?.standing ?? 0,
        atWar: dip?.atWar ?? false,
        treatyType: dip?.treatyType ?? null,
        treatyDuration: dip?.treatyDuration ?? 0,
      };
    });
  }, [state]);

  return (
    <Panel as="section" ariaLabel="Diplomacy" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Diplomacy" icon={Handshake} color="text-[#50c878]" as="h2" />

      {factions.length === 0 ? (
        <EmptyState icon={Handshake} title="No Diplomatic Relations" description="Build an Embassy to engage in diplomacy." />
      ) : (
        <div className="flex flex-col gap-2">
          {factions.map((f) => (
            <div key={f.id} className="rounded-lg border border-[rgba(128,90,213,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-[#eee8ff] truncate">{f.name}</span>
                <Badge text={f.atWar ? 'At War' : standingLabel(f.standing)} color={f.atWar ? 'danger' : standingColor(f.standing)} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#1a1025] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.standing >= 0 ? 'bg-[#50c878]' : 'bg-[#ff4d6d]'}`}
                    style={{ width: `${Math.min(100, Math.abs(f.standing))}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-[#eee8ff]/50 w-8 text-right">{f.standing}</span>
              </div>
              {f.treatyType && (
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#eee8ff]/60">
                  <Gavel className="w-3 h-3 text-[#f5c84b]" />
                  <span>{f.treatyType} ({f.treatyDuration}d left)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {treaties.length > 0 && (
        <>
          <SectionHeader title="Treaties" icon={Gavel} color="text-[#f5c84b]" as="h3" />
          <div className="flex flex-col gap-1">
            {treaties.map((t) => (
              <div key={t.id} className="rounded-lg border border-[rgba(128,90,213,0.12)] bg-[#07040d] p-2 text-[10px] font-mono text-[#eee8ff]/60">
                {t.type} — {t.duration}d (from day {t.establishedDay})
              </div>
            ))}
          </div>
        </>
      )}

      {quests.length > 0 && (
        <>
          <SectionHeader title="Quests" icon={Scroll} color="text-[#26f4ff]" as="h3" />
          <div className="flex flex-col gap-1">
            {quests.filter(q => q.status === 'available' || q.status === 'active').map((q) => (
              <div key={q.id} className="rounded-lg border border-[rgba(128,90,213,0.12)] bg-[#07040d] p-2 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-[#26f4ff]" />
                  <span className="text-[10px] font-mono text-[#eee8ff]/70">{q.description}</span>
                </div>
                <span className="text-[9px] font-mono text-[#eee8ff]/40">Reward: {q.reward.gold ?? 0}g{q.reward.mana ? ` + ${q.reward.mana} mana` : ''}{q.reward.standingChange ? ` + ${q.reward.standingChange} standing` : ''}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
