import { ArrowUpRight, Brain, ShieldAlert } from 'lucide-react';
import type { GameState } from '../types/game';
import { useUIStore } from '../stores/uiStore';
import { PHASE_LABELS, clamp01 } from '../presentation/theme';

export default function SovereignLens({ state }: { state: GameState }) {
  const mind = state.sovereignMind;
  return (
    <button
      className="sovereign-lens"
      onClick={() => useUIStore.getState().openWorkspace('sovereign')}
      aria-label="Open Sovereign cognition"
    >
      <div className="lens-heading">
        <span>
          <Brain size={14} />
          SOVEREIGN MIND
        </span>
        <ArrowUpRight size={17} />
      </div>
      <div className="lens-phase">{PHASE_LABELS[mind.phase]}</div>
      <p>{mind.nextAction || mind.currentPlan}</p>
      <div className="lens-meter">
        <span>Readiness</span>
        <div>
          <i style={{ width: `${clamp01(mind.militaryReadiness / 100) * 100}%` }} />
        </div>
        <b>{Math.round(mind.militaryReadiness)}%</b>
      </div>
      <footer>
        <span>{Math.round(mind.confidence)}% confidence</span>
        <span>
          <ShieldAlert size={11} />
          {Math.round(mind.fearLevel)}% fear
        </span>
      </footer>
    </button>
  );
}
