import React from 'react';
import { Castle, Swords, Trophy, AlertTriangle } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { useDungeonStore } from '../stores/dungeonStore';

const statusColor: Record<string, 'green' | 'warning' | 'danger' | 'muted'> = {
  unexplored: 'muted',
  inProgress: 'warning',
  cleared: 'green',
  failed: 'danger',
};

export default function DungeonPanel() {
  const state = useGameStore((s) => s.state);
  const dungeons = useDungeonStore((s) => s.dungeons);
  const expeditions = useDungeonStore((s) => s.expeditions);

  const activeExpeditions = expeditions.filter(e => e.isActive);

  return (
    <Panel as="section" ariaLabel="Dungeons" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Dungeons" icon={Castle} color="text-[#daa520]" as="h2" />

      {dungeons.length === 0 ? (
        <EmptyState icon={Castle} title="No Dungeons Found" description="Build an Adventurer's Guild and explore to discover dungeons." />
      ) : (
        <div className="flex flex-col gap-2">
          {dungeons.map((d) => (
            <div key={d.id} className="rounded-lg border border-[rgba(128,90,213,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-3 h-3 text-[#daa520]" />
                  <span className="text-xs font-mono text-[#eee8ff]">Dungeon Lv.{d.level}</span>
                </div>
                <Badge text={d.status} color={statusColor[d.status] ?? 'muted'} />
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono text-[#eee8ff]/50">
                <span>Rooms: {d.rooms.length}</span>
                <span>Progress: {d.currentRoomIndex}/{d.rooms.length}</span>
              </div>
              {d.status === 'inProgress' && (
                <div className="h-1.5 rounded-full bg-[#1a1025] overflow-hidden">
                  <div className="h-full bg-[#daa520] rounded-full transition-all" style={{ width: `${(d.currentRoomIndex / d.rooms.length) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeExpeditions.length > 0 && (
        <>
          <SectionHeader title="Active Expeditions" icon={AlertTriangle} color="text-[#ff4d6d]" as="h3" />
          <div className="flex flex-col gap-1">
            {activeExpeditions.map((e) => {
              const d = dungeons.find(d => d.id === e.dungeonId);
              return (
                <div key={e.id} className="rounded-lg border border-[rgba(255,77,109,0.2)] bg-[#07040d] p-2 text-[10px] font-mono text-[#eee8ff]/60">
                  {d ? `Dungeon Lv.${d.level}` : e.dungeonId} — {e.squadHeroIds.length} heroes — Progress: {e.progress}%
                </div>
              );
            })}
          </div>
        </>
      )}

      {dungeons.some(d => d.status === 'cleared') && (
        <>
          <SectionHeader title="Cleared" icon={Trophy} color="text-[#50c878]" as="h3" />
          <div className="text-[10px] font-mono text-[#eee8ff]/40">
            {dungeons.filter(d => d.status === 'cleared').length} dungeon(s) cleared
          </div>
        </>
      )}
    </Panel>
  );
}
