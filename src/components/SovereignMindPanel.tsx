import React, { useState } from 'react';
import type { SovereignMind, SovereignPhaseType } from '../types/game';
import {
  Brain, Zap, Compass, Scroll, Eye, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronRight, Target, Coins,
} from 'lucide-react';
import Panel from './ui/Panel';
import Badge from './ui/Badge';
import ProgressMeter from './ui/ProgressMeter';
import SectionHeader from './ui/SectionHeader';

interface SovereignMindPanelProps {
  mind: SovereignMind;
  botName: string;
}

const phaseLabels: Record<SovereignPhaseType, string> = {
  opening: 'Opening', scouting: 'Scouting', stabilizing: 'Stabilizing', expanding: 'Expanding',
  fortifying: 'Fortifying', hunting: 'Hunting', spirePreparation: 'Spire Prep',
  finalAssault: 'Final Assault', emergency: 'EMERGENCY',
};

export default function SovereignMindPanel({ mind, botName }: SovereignMindPanelProps) {
  const [showDeepCognition, setShowDeepCognition] = useState(false);
  const [expandedDecisions, setExpandedDecisions] = useState<Set<number>>(new Set());

  const riskLevel = mind.fearLevel < 30 ? 'Low' : mind.fearLevel < 65 ? 'Moderate' : 'High';
  const riskColor = mind.fearLevel < 30 ? 'green' : mind.fearLevel < 65 ? 'warning' : 'danger';

  const priorities = [
    { icon: Compass, label: mind.nextAction, tag: 'Immediate' },
    { icon: Coins, label: mind.savingFor ? `Saving for ${mind.savingFor}` : 'No economic goal set', tag: 'Economic' },
    { icon: Target, label: mind.spireReadinessText.includes('Ready') && !mind.spireReadinessText.includes('Not') ? 'Spire assault viable' : mind.spireReadinessText, tag: 'Strategic' },
  ];

  const toggleDecision = (i: number) => {
    setExpandedDecisions(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <Panel id="sovereign-mind-panel" glow="subtle" className="flex flex-col h-full p-3 gap-3 overflow-hidden">
      {/* Sigil Header */}
      <div className="flex items-center justify-between border-b border-[rgba(128,90,213,0.28)] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg border border-[#9b5cff]/40 bg-[#9b5cff]/5 glow-violet" />
            <div className="absolute inset-1 rounded border border-[#9b5cff]/20 rotate-45" />
            <Brain className="w-4 h-4 text-[#9b5cff] relative z-10" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#f5c84b] font-bold">Sovereign Mind</h2>
            <p className="text-[10px] text-[#eee8ff]/40 font-mono">{botName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge text={phaseLabels[mind.phase]} icon={Zap} color={mind.phase === 'emergency' ? 'danger' : 'violet'} />
        </div>
      </div>

      {/* Intent Summary */}
      <div className="bg-gradient-to-r from-[#07040d] to-[#1a1028]/40 border-l-2 border-[#f5c84b] p-2.5 rounded-r-lg">
        <p className="text-xs italic text-white leading-snug">&ldquo;{mind.currentPlan}&rdquo;</p>
      </div>

      {/* Confidence + Risk */}
      <div className="grid grid-cols-2 gap-2">
        <ProgressMeter label="Confidence" value={mind.confidence} showValue valueSuffix="%" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-[#eee8ff]/60 uppercase">Risk Level</span>
          <Badge text={riskLevel} color={riskColor} className="self-start" />
        </div>
      </div>

      {/* Priority Queue */}
      <div className="flex flex-col gap-1.5">
        <SectionHeader title="Priority Queue" icon={Target} color="text-[#26f4ff]" />
        {priorities.map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#07040d] border border-[rgba(128,90,213,0.18)]">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] font-mono font-bold text-[#9b5cff] w-4">{i + 1}.</span>
              <p.icon className="w-3.5 h-3.5 text-[#26f4ff] flex-shrink-0" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[9px] font-mono uppercase text-[#eee8ff]/40">{p.tag}</span>
              <span className="text-[11px] text-[#eee8ff] truncate">{p.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Decisions */}
      {mind.recentDecisions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <SectionHeader title="Recent Decisions" icon={Scroll} color="text-[#9b5cff]" />
          <div className="max-h-[140px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {mind.recentDecisions.slice(-5).reverse().map((d, i) => (
              <div key={i} className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md px-2 py-1.5">
                <button
                  type="button"
                  className="flex items-center gap-1.5 cursor-pointer w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50 rounded"
                  onClick={() => toggleDecision(i)}
                  aria-expanded={expandedDecisions.has(i)}
                  aria-label={`Decision on day ${d.day}: ${d.actionLabel}`}
                >
                  <span className="text-[9px] font-mono text-[#f5c84b] flex-shrink-0">D{d.day}</span>
                  <span className="text-[9px] font-mono uppercase font-bold text-[#9b5cff] flex-shrink-0">{d.actionType}</span>
                  <span className="text-[11px] text-[#eee8ff] truncate flex-1">{d.actionLabel}</span>
                  {expandedDecisions.has(i) ? <ChevronDown className="w-3 h-3 text-[#eee8ff]/40 flex-shrink-0" aria-hidden="true" /> : <ChevronRight className="w-3 h-3 text-[#eee8ff]/40 flex-shrink-0" aria-hidden="true" />}
                </button>
                {expandedDecisions.has(i) && (
                  <div className="mt-1 pl-4 flex flex-col gap-0.5">
                    <p className="text-[10px] text-[#eee8ff]/60 italic">{d.reason}</p>
                    {d.expectedBenefit && <p className="text-[10px] text-[#38e68b]">+ {d.expectedBenefit}</p>}
                    {d.risk && <p className="text-[10px] text-[#ff4d6d]">! {d.risk}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Readiness Meters */}
      <div className="grid grid-cols-2 gap-2">
        <ProgressMeter label="Military" value={mind.militaryReadiness} showValue valueSuffix="%" />
        <ProgressMeter label="Spire Prep" value={mind.finalLairReadiness} showValue valueSuffix="%" />
      </div>

      {/* Spire Readiness Text */}
      {mind.spireReadinessText && (
        <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-[#07040d] border border-[rgba(128,90,213,0.18)]">
          <Eye className="w-3 h-3 text-[#ff4d6d] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#eee8ff]/70 font-mono leading-snug">{mind.spireReadinessText}</p>
        </div>
      )}

      {/* Deep Cognition (collapsible) */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={() => setShowDeepCognition(!showDeepCognition)}
          aria-expanded={showDeepCognition}
          aria-label="Toggle deep cognition"
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#eee8ff]/50 hover:text-[#eee8ff] transition-colors cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50 rounded"
        >
          {showDeepCognition ? <ChevronDown className="w-3 h-3" aria-hidden="true" /> : <ChevronRight className="w-3 h-3" aria-hidden="true" />}
          <span>Deep Cognition</span>
        </button>

        {showDeepCognition && (
          <div className="flex flex-col gap-2 mt-1.5">
            {/* Strategic Memory */}
            {mind.strategicMemory.length > 0 && (
              <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-2 max-h-[80px] overflow-y-auto custom-scrollbar">
                <SectionHeader title="Strategic Memory" icon={Brain} color="text-[#9b5cff]" className="mb-1" />
                {mind.strategicMemory.slice(0, 4).map((m, i) => (
                  <div key={i} className="text-[10px] text-[#eee8ff]/60 mb-1">
                    <span className={m.type === 'success' ? 'text-[#38e68b]' : m.type === 'regret' ? 'text-[#ffb84d]' : m.type === 'threat' ? 'text-[#ff4d6d]' : 'text-[#f5c84b]'}>
                      [{m.type}]
                    </span>{' '}
                    <span className="text-[#eee8ff] font-semibold">{m.title}</span>
                    <p className="text-[#eee8ff]/40 italic ml-1">{m.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bot Thoughts */}
            {mind.botThoughts.length > 0 && (
              <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-2">
                <SectionHeader title="Thoughts" icon={Brain} color="text-[#9b5cff]" className="mb-1" />
                {mind.botThoughts.slice(-3).map((t, i) => (
                  <p key={i} className="text-[10px] text-[#eee8ff]/50 italic mb-0.5">&ldquo;{t}&rdquo;</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success / Regret Footer */}
        <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-[rgba(128,90,213,0.18)]">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-[9px] uppercase text-[#eee8ff]/50 font-mono font-bold">
              <CheckCircle2 className="w-3 h-3 text-[#38e68b]" /> Success
            </span>
            <p className="text-[10px] text-[#eee8ff]/70 leading-snug">{mind.lastSuccess || 'Establishing presence'}</p>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-[rgba(128,90,213,0.18)] pl-2">
            <span className="flex items-center gap-1 text-[9px] uppercase text-[#eee8ff]/50 font-mono font-bold">
              <AlertTriangle className="w-3 h-3 text-[#ffb84d]" /> Regret
            </span>
            <p className="text-[10px] text-[#eee8ff]/70 leading-snug">{mind.regret || mind.lastMistake || 'None acknowledged'}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
