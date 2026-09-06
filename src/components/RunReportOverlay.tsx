import React from 'react';
import type { WinReport, LossReport } from '../types/game';
import {
  Award,
  ShieldAlert,
  RotateCcw,
  Skull,
  Coins,
  Sparkles,
  CheckCircle2,
  XCircle,
  Heart,
  TrendingUp,
  Brain,
} from 'lucide-react';

interface RunReportOverlayProps {
  report: WinReport | LossReport | null;
  isWin: boolean;
  onRestart: () => void;
  seedString: string;
}

export default function RunReportOverlay({ report, isWin, onRestart, seedString }: RunReportOverlayProps) {
  if (!report) return null;

  const winReport = isWin ? (report as WinReport) : null;
  const lossReport = !isWin ? (report as LossReport) : null;

  const dayEnd = winReport?.dayWon ?? lossReport?.dayLost ?? 0;
  const cause = lossReport?.causeOfCollapse ?? '';
  const strategy = winReport?.finalStrategy ?? lossReport?.biggestStrategicFailure ?? '';
  const sovereignThought = winReport?.finalSovereignThought ?? lossReport?.finalBotThought ?? '';
  const heroesOfRun = winReport?.heroesOfTheRun ?? lossReport?.heroesOfTheRun ?? [];
  const majorDecisions = winReport?.majorDecisions ?? lossReport?.majorDecisions ?? [];
  const buildingsBuilt = winReport?.buildingsBuilt ?? lossReport?.buildingsBuilt ?? [];
  const lairsCleared = winReport?.lairsCleared ?? lossReport?.lairsCleared ?? [];
  const playerInterventions = winReport?.playerInterventions ?? lossReport?.playerInterventions ?? 0;
  const mode = winReport?.mode ?? lossReport?.mode ?? 'coSovereign';
  const difficulty = winReport?.difficulty ?? lossReport?.difficulty ?? 'standard';

  return (
    <div className="fixed inset-0 z-50 bg-[#0a050f]/90 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-label={isWin ? 'Victory report' : 'Defeat report'}>
      <div
        className={`border-2 rounded-2xl p-6 w-full max-w-xl shadow-[0_0_50px_rgba(138,43,226,0.3)] relative overflow-hidden bg-[#150d1f] ${
          isWin ? 'border-[#ffd700]/50' : 'border-rose-500/40'
        }`}
      >
        <div className={`absolute top-0 inset-x-0 h-1.5 ${isWin ? 'bg-[#ffd700]' : 'bg-rose-500'}`} aria-hidden="true" />

        <div className="flex items-center gap-3 mb-4">
          {isWin ? (
            <Award className="w-8 h-8 text-[#ffd700]" aria-hidden="true" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-rose-500" aria-hidden="true" />
          )}
          <div>
            <h2 className={`text-xl font-bold ${isWin ? 'text-[#ffd700]' : 'text-rose-400'}`}>
              {isWin ? 'Victory' : 'Defeat'}
            </h2>
            <p className="text-[11px] text-[#eee8ff]/50 font-mono">
              Seed: {seedString} • Day {dayEnd} • {mode} • {difficulty}
            </p>
          </div>
        </div>

        {!isWin && cause && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mb-3">
            <span className="text-[10px] font-mono uppercase text-rose-400/70">Cause</span>
            <p className="text-sm text-rose-200">{cause}</p>
          </div>
        )}

        {isWin && strategy && (
          <div className="bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-lg p-3 mb-3">
            <span className="text-[10px] font-mono uppercase text-[#ffd700]/70">Final Strategy</span>
            <p className="text-sm text-[#ffd700]/90">{strategy}</p>
          </div>
        )}

        {sovereignThought && (
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.28)] rounded-lg p-3 mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#9b5cff] mb-1">
              <Brain className="w-3 h-3" /> Sovereign Thought
            </span>
            <p className="text-xs text-[#eee8ff]/70 italic">&ldquo;{sovereignThought}&rdquo;</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-lg p-3">
            <span className="text-[10px] font-mono uppercase text-[#eee8ff]/50 block mb-1">Player Interventions</span>
            <span className="text-lg font-bold text-[#f5c84b] font-mono">{playerInterventions}</span>
          </div>
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-lg p-3">
            <span className="text-[10px] font-mono uppercase text-[#eee8ff]/50 block mb-1">Lairs Cleared</span>
            <span className="text-lg font-bold text-[#9b5cff] font-mono">{lairsCleared.length}</span>
          </div>
        </div>

        {heroesOfRun.length > 0 && (
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-lg p-3 mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#38e68b] mb-1">
              <Heart className="w-3 h-3" /> Heroes of the Run
            </span>
            <div className="flex flex-wrap gap-1.5">
              {heroesOfRun.map((h, i) => (
                <span key={i} className="text-[11px] text-[#eee8ff]/80 bg-[#1a1028] border border-[rgba(128,90,213,0.18)] rounded px-2 py-0.5">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {majorDecisions.length > 0 && (
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-lg p-3 mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#26f4ff] mb-1">
              <TrendingUp className="w-3 h-3" /> Major Decisions
            </span>
            <ul className="flex flex-col gap-1">
              {majorDecisions.slice(-5).map((d, i) => (
                <li key={i} className="text-[11px] text-[#eee8ff]/60 italic">&bull; {d}</li>
              ))}
            </ul>
          </div>
        )}

        {buildingsBuilt.length > 0 && (
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-lg p-3 mb-3">
            <span className="text-[10px] font-mono uppercase text-[#eee8ff]/50 mb-1 block">Buildings Constructed</span>
            <div className="flex flex-wrap gap-1.5">
              {buildingsBuilt.map((b, i) => (
                <span key={i} className="text-[11px] text-[#eee8ff]/70 bg-[#1a1028] border border-[rgba(128,90,213,0.18)] rounded px-2 py-0.5">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRestart}
          aria-label="Return to setup screen"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[#9b5cff]/40 bg-[#9b5cff]/10 hover:bg-[#9b5cff]/20 text-[#9b5cff] font-bold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Return to Setup</span>
        </button>
      </div>
    </div>
  );
}
