import React, { useMemo, useState } from 'react';
import { Users, ChevronDown, ChevronRight, Crown, Shield } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { ECSWorld } from '../engine';
import type { HeroAIComponent, NameComponent, SquadMemberComponent, PositionComponent } from '../engine/Component';
import type { Squad } from '../types/game';

export default function SquadPanel() {
  const state = useGameStore((s) => s.state);
  const [expandedSquads, setExpandedSquads] = useState<Set<number>>(new Set());

  const squadData = useMemo(() => {
    if (!state) return [];
    const world = new ECSWorld();
    world.deserialize(state.world);

    return state.squads.map((squad: Squad) => {
      const members = squad.memberIds.map((id) => {
        const heroAi = world.getComponent<HeroAIComponent>(id, 'HeroAI');
        const name = world.getComponent<NameComponent>(id, 'Name');
        const pos = world.getComponent<PositionComponent>(id, 'Position');
        return {
          id,
          name: name?.name ?? 'Unknown',
          heroClass: heroAi?.heroClass ?? 'Unknown',
          level: heroAi?.level ?? 1,
          status: heroAi?.status ?? 'Unknown',
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
        };
      });

      const leader = members.find((m) => m.id === squad.leaderId);

      return {
        ...squad,
        members,
        leaderName: leader?.name ?? 'Unknown',
      };
    });
  }, [state]);

  const toggleExpand = (id: number) => {
    setExpandedSquads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Panel as="section" ariaLabel="Squad overview" className="p-3 flex flex-col gap-3 h-full">
      <SectionHeader title="Squads" icon={Users} color="text-[#26f4ff]" as="h2" />

      {squadData.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Squads Formed"
          description="The Sovereign AI will form squads as heroes are hired and tactics develop."
        />
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1">
          {squadData.map((squad) => {
            const isExpanded = expandedSquads.has(squad.id);
            return (
              <div
                key={squad.id}
                className="rounded-lg border border-[rgba(128,90,213,0.18)] bg-[#07040d] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(squad.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${squad.name} squad, ${squad.members.length} members`}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#1a1028] transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#eee8ff]/40 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#eee8ff]/40 flex-shrink-0" />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-mono text-[#eee8ff] truncate">{squad.name}</span>
                    <span className="text-[9px] font-mono text-[#eee8ff]/40">
                      {squad.members.length} members · Leader: {squad.leaderName}
                    </span>
                  </div>
                  <Badge text={`x${squad.bonusMultiplier.toFixed(1)}`} color="violet" />
                </button>

                {isExpanded && (
                  <div className="border-t border-[rgba(128,90,213,0.12)] p-2 flex flex-col gap-1">
                    {squad.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#1a1028]/50"
                      >
                        {m.id === squad.leaderId ? (
                          <Crown className="w-3 h-3 text-[#f5c84b] flex-shrink-0" />
                        ) : (
                          <Shield className="w-3 h-3 text-[#eee8ff]/30 flex-shrink-0" />
                        )}
                        <span className="text-[10px] font-mono text-[#eee8ff]/80 flex-1 truncate">
                          {m.name}
                        </span>
                        <span className="text-[9px] font-mono text-[#eee8ff]/40">Lv.{m.level}</span>
                        <Badge text={m.status} color="muted" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
