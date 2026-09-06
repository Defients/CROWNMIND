import React from 'react';
import { Beaker, Lock, CheckCircle2, Clock, GitBranch } from 'lucide-react';
import type { GameState } from '../types/game';
import { TECH_TREE, TECH_BRANCHES, TECH_ERAS, ERA_UNLOCK_DAY, canResearch, getTechById } from '../types/tech';
import type { TechBranch, TechEra } from '../types/tech';
import Panel from './ui/Panel';

interface TechTreePanelProps {
  state: GameState;
}

const branchColors: Record<TechBranch, string> = {
  military: '#ff4d6d',
  economy: '#f5c84b',
  magic: '#9b5cff',
  defense: '#26f4ff',
  diplomacy: '#50c878',
  exploration: '#daa520',
};

const branchLabels: Record<TechBranch, string> = {
  military: 'Military',
  economy: 'Economy',
  magic: 'Magic',
  defense: 'Defense',
  diplomacy: 'Diplomacy',
  exploration: 'Exploration',
};

const eraLabels: Record<TechEra, string> = {
  foundation: 'Foundation',
  expansion: 'Expansion',
  ascension: 'Ascension',
};

export default function TechTreePanel({ state }: TechTreePanelProps) {
  const { unlockedTechs, currentResearch, researchProgress, day } = state;

  return (
    <Panel as="section" ariaLabel="Tech tree" glow="violet" className="flex flex-col max-h-[60vh]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(128,90,213,0.18)]">
        <Beaker className="w-4 h-4 text-[#9b5cff]" aria-hidden="true" />
        <h3 className="text-xs font-serif italic text-[#eee8ff]/80 tracking-wide">Tech Tree</h3>
      </div>
      <div className="overflow-y-auto custom-scrollbar p-3 flex flex-col gap-4">
        {TECH_ERAS.map(era => {
          const eraUnlocked = day >= ERA_UNLOCK_DAY[era];
          return (
            <div key={era}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${eraUnlocked ? 'text-[#f5c84b]' : 'text-[#eee8ff]/30'}`}>
                  {eraLabels[era]}
                </span>
                {!eraUnlocked && (
                  <span className="text-[9px] font-mono text-[#eee8ff]/30 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Day {ERA_UNLOCK_DAY[era]}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TECH_BRANCHES.map(branch => {
                  const techs = TECH_TREE.filter(t => t.era === era && t.branch === branch);
                  if (techs.length === 0) return null;
                  return (
                    <div key={branch} className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-mono uppercase" style={{ color: branchColors[branch] }}>{branchLabels[branch]}</span>
                      {techs.map(tech => {
                        const isUnlocked = unlockedTechs.includes(tech.id);
                        const isResearching = currentResearch === tech.id;
                        const canDo = canResearch(tech.id, unlockedTechs, day);
                        const isLocked = !eraUnlocked || !canDo && !isUnlocked;
                        const mutuallyExcluded = tech.mutuallyExclusiveWith?.some(ex => unlockedTechs.includes(ex));

                        return (
                          <div
                            key={tech.id}
                            className={`p-2 rounded-lg border text-left transition-all ${
                              isUnlocked ? 'border-[#38e68b]/40 bg-[#38e68b]/5' :
                              isResearching ? 'border-[#f5c84b]/50 bg-[#f5c84b]/10 glow-gold' :
                              canDo && !mutuallyExcluded ? 'border-[rgba(128,90,213,0.28)] bg-[#1a1028]' :
                              'border-[rgba(128,90,213,0.1)] bg-[#07040d] opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {isUnlocked ? (
                                <CheckCircle2 className="w-3 h-3 text-[#38e68b]" />
                              ) : isResearching ? (
                                <Clock className="w-3 h-3 text-[#f5c84b] animate-spin" style={{ animationDuration: '2s' }} />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3 text-[#eee8ff]/30" />
                              ) : (
                                <GitBranch className="w-3 h-3" style={{ color: branchColors[branch] }} />
                              )}
                              <span className={`text-[10px] font-bold ${isUnlocked ? 'text-[#38e68b]' : isResearching ? 'text-[#f5c84b]' : 'text-[#eee8ff]/70'}`}>
                                {tech.name}
                              </span>
                            </div>
                            <p className="text-[9px] text-[#eee8ff]/50 leading-tight mb-1">{tech.description}</p>
                            <div className="flex items-center gap-2 text-[8px] font-mono text-[#eee8ff]/40">
                              <span>{tech.cost.gold}g</span>
                              {tech.cost.mana > 0 && <span>{tech.cost.mana}m</span>}
                              <span>{tech.researchTime}d</span>
                            </div>
                            {isResearching && (
                              <div className="mt-1 w-full bg-[#07040d] h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-[#f5c84b] transition-all duration-300" style={{ width: `${(researchProgress / tech.researchTime) * 100}%` }} />
                              </div>
                            )}
                            {mutuallyExcluded && !isUnlocked && (
                              <p className="text-[8px] text-[#ff4d6d]/60 mt-0.5">Excluded by choice</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
