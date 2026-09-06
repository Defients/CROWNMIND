import React from 'react';
import { Target, Trophy, Clock } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { getScenarioById } from '../systems/ScenarioSystem';

export default function ScenarioPanel() {
  const state = useGameStore((s) => s.state);

  if (!state) return null;

  const scenarioId = state.config.scenarioId;
  const scenario = scenarioId ? getScenarioById(scenarioId) : null;
  const objectives = state.scenarioObjectives ?? [];
  const endlessScore = state.endlessScore ?? 0;
  const isEndless = state.config.gameMode === 'endless';

  if (!scenario && !isEndless) {
    return (
      <Panel as="section" ariaLabel="Scenario" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
        <SectionHeader title="Scenario" icon={Target} color="text-[#50c878]" as="h2" />
        <EmptyState icon={Target} title="No Active Scenario" description="Scenarios are available in campaign and scenario modes." />
      </Panel>
    );
  }

  return (
    <Panel as="section" ariaLabel="Scenario" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Scenario" icon={Target} color="text-[#50c878]" as="h2" />

      {isEndless ? (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-[rgba(80,200,120,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#50c878]" />
              <span className="text-xs font-mono text-[#eee8ff]">Endless Mode</span>
            </div>
            <div className="text-[10px] font-mono text-[#eee8ff]/50">
              Score: <span className="text-[#50c878] text-sm">{endlessScore}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-[#eee8ff]/40">
              <Clock className="w-3 h-3" />
              <span>Day {state.day}</span>
            </div>
          </div>
        </div>
      ) : scenario ? (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-[rgba(80,200,120,0.18)] bg-[#07040d] p-3 flex flex-col gap-2">
            <span className="text-xs font-mono text-[#eee8ff]">{scenario.name}</span>
            <p className="text-[10px] text-[#eee8ff]/50 leading-relaxed">{scenario.description}</p>
          </div>

          <SectionHeader title="Objectives" icon={Target} color="text-[#26f4ff]" as="h3" />
          <div className="flex flex-col gap-1">
            {objectives.map((obj) => (
              <div key={obj.id} className="rounded-lg border border-[rgba(128,90,213,0.12)] bg-[#07040d] p-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-[#eee8ff]/60">{obj.description}</span>
                <Badge text={`${obj.target}`} color="muted" />
              </div>
            ))}
            {objectives.length === 0 && (
              <span className="text-[9px] font-mono text-[#eee8ff]/30">No objectives tracked yet</span>
            )}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
