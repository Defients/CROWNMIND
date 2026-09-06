import React, { useMemo } from 'react';
import { GitBranch, Star, Zap } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { ECSWorld } from '../engine';
import type { HeroAIComponent, SkillTreeComponent, NameComponent } from '../engine/Component';
import { getSkillTree } from '../types/skills';

export default function SkillTreePanel() {
  const state = useGameStore((s) => s.state);

  const heroes = useMemo(() => {
    if (!state) return [];
    const world = new ECSWorld();
    world.deserialize(state.world);
    const heroIds = world.query('HeroAI', 'SkillTree');
    return heroIds.map((id) => {
      const hero = world.getComponent<HeroAIComponent>(id, 'HeroAI');
      const name = world.getComponent<NameComponent>(id, 'Name');
      const skill = world.getComponent<SkillTreeComponent>(id, 'SkillTree');
      const tree = skill ? getSkillTree(skill.classId) : null;
      return {
        id,
        name: name?.name ?? 'Unknown',
        heroClass: hero?.heroClass ?? 'Unknown',
        level: hero?.level ?? 1,
        classId: skill?.classId ?? '',
        treeName: tree ? `${tree.classId} Tree` : 'Unknown',
        skillPoints: skill?.skillPoints ?? 0,
        allocatedNodes: skill?.allocatedNodes ?? [],
        ultimateChoice: skill?.ultimateChoice ?? null,
        ultimateCooldown: skill?.ultimateCooldown ?? 0,
      };
    });
  }, [state]);

  return (
    <Panel as="section" ariaLabel="Skill Trees" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Skill Trees" icon={GitBranch} color="text-[#26f4ff]" as="h2" />

      {heroes.length === 0 ? (
        <EmptyState icon={GitBranch} title="No Skill Trees" description="Heroes gain skill trees as they level up." />
      ) : (
        <div className="flex flex-col gap-2">
          {heroes.map((h) => (
            <div key={h.id} className="rounded-lg border border-[rgba(128,90,213,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-[#eee8ff] truncate">{h.name}</span>
                  <span className="text-[9px] font-mono text-[#eee8ff]/40">{h.heroClass} Lv.{h.level}</span>
                </div>
                {h.skillPoints > 0 && (
                  <Badge text={`${h.skillPoints} SP`} color="warning" />
                )}
              </div>

              <div className="text-[10px] font-mono text-[#eee8ff]/50">{h.treeName}</div>

              <div className="flex flex-wrap gap-1">
                {h.allocatedNodes.map((nodeId) => (
                  <div key={nodeId} className="flex items-center gap-0.5 rounded-md bg-[#120b1c] px-1.5 py-0.5">
                    <Star className="w-2.5 h-2.5 text-[#26f4ff]" />
                    <span className="text-[8px] font-mono text-[#eee8ff]/60">{nodeId}</span>
                  </div>
                ))}
                {h.allocatedNodes.length === 0 && (
                  <span className="text-[9px] font-mono text-[#eee8ff]/30">No skills allocated yet</span>
                )}
              </div>

              {h.ultimateChoice && (
                <div className="flex items-center gap-1.5 text-[9px] font-mono">
                  <Zap className="w-3 h-3 text-[#f5c84b]" />
                  <span className="text-[#eee8ff]/70">{h.ultimateChoice}</span>
                  {h.ultimateCooldown > 0 && (
                    <span className="text-[#eee8ff]/30">({h.ultimateCooldown}d CD)</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
