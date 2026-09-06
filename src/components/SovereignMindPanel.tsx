import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Brain, Target, ShieldAlert } from 'lucide-react';
import type { SovereignMind, GameState } from '../types/game';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { decisionId, resolveDecisionTarget } from '../presentation/events';
import { PHASE_LABELS, clamp01 } from '../presentation/theme';

function Meter({ label, value, tone = '' }: { label: string; value: number; tone?: string }) {
  return (
    <div className={`mind-meter ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{Math.round(value)}%</strong>
      </div>
      <div className="meter-track">
        <i style={{ width: `${clamp01(value / 100) * 100}%` }} />
      </div>
    </div>
  );
}
export default function SovereignMindPanel({
  mind,
  botName,
}: {
  mind: SovereignMind;
  botName: string;
}) {
  const state = useGameStore((s) => s.state) as GameState;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const decisions = [...mind.recentDecisions].reverse();
  const selected = decisions.find((d) => decisionId(d) === selectedId) ?? decisions[0];
  const association = selected ? resolveDecisionTarget(state, selected) : undefined;
  return (
    <div className="mind-workspace">
      <div className="mind-overview">
        <span className="eyebrow">
          <Brain size={14} />
          {botName} · Live decision telemetry
        </span>
        <h2>{PHASE_LABELS[mind.phase]}</h2>
        <p>{mind.currentPlan}</p>
        <div className="mind-meters">
          <Meter label="Confidence" value={mind.confidence} />
          <Meter label="Military readiness" value={mind.militaryReadiness} tone="gold" />
          <Meter label="Spire readiness" value={mind.finalLairReadiness} tone="threat" />
          <Meter label="Fear" value={mind.fearLevel} tone="threat" />
        </div>
      </div>
      <div className="mind-columns">
        <section className="causal-model" aria-label="Current strategic context">
          <span className="eyebrow">Current context</span>
          <div className="causal-node">
            <span>01 / PLAN</span>
            <strong>{mind.currentPlan}</strong>
          </div>
          <ArrowDown className="causal-arrow" size={18} />
          <div className="causal-node constraint">
            <span>02 / RESOURCE CONSTRAINT</span>
            <strong>{mind.savingFor || 'No saving goal recorded'}</strong>
            <small>
              {mind.savingTarget
                ? `${Math.floor(state.resources.gold)} / ${mind.savingTarget} gold · reserve ${mind.emergencyReserve}`
                : `Emergency reserve: ${mind.emergencyReserve} gold`}
            </small>
          </div>
          <ArrowDown className="causal-arrow" size={18} />
          <div className="causal-node chosen">
            <span>03 / NEXT ACTION</span>
            <strong>{mind.nextAction || 'Awaiting a decision'}</strong>
            <p>{mind.reason}</p>
          </div>
          <div className="spire-assessment">
            <ShieldAlert size={19} />
            <p>{mind.spireReadinessText}</p>
          </div>
        </section>
        <section className="decision-workbench">
          <span className="eyebrow">Show me why · Recorded decisions</span>
          {selected ? (
            <>
              <div className="decision-tabs">
                {decisions.slice(0, 8).map((d) => (
                  <button
                    key={decisionId(d)}
                    aria-pressed={decisionId(d) === decisionId(selected)}
                    onClick={() => setSelectedId(decisionId(d))}
                  >
                    <small>
                      DAY {d.day} · {d.actionType}
                    </small>
                    <span>{d.actionLabel}</span>
                  </button>
                ))}
              </div>
              <article className="decision-detail">
                <span className="eyebrow">
                  Day {selected.day} · Recorded confidence {selected.confidence}%
                </span>
                <h3>{selected.actionLabel}</h3>
                <dl>
                  <dt>Reason</dt>
                  <dd>{selected.reason || 'No reason recorded.'}</dd>
                  <dt>Expected benefit</dt>
                  <dd>{selected.expectedBenefit || 'No benefit recorded.'}</dd>
                  <dt>Risk</dt>
                  <dd>{selected.risk || 'No explicit risk recorded.'}</dd>
                  <dt>Resource context at decision</dt>
                  <dd>
                    {selected.goldBefore} gold before
                    {selected.goldAfter != null
                      ? ` → ${selected.goldAfter} after`
                      : ' · after-value not recorded'}
                  </dd>
                </dl>
                {association ? (
                  <button
                    className="instrument-button"
                    onClick={() => {
                      const ui = useUIStore.getState();
                      ui.selectEntity(
                        association.entityId,
                        'entity',
                        association.point.x,
                        association.point.y
                      );
                      ui.setCameraTarget({ ...association.point });
                    }}
                  >
                    <Target size={15} />
                    View {association.label}
                    <ArrowUpRight size={14} />
                  </button>
                ) : (
                  <p className="muted-note">
                    No unique world location is recorded for this decision.
                  </p>
                )}
                {association && (
                  <p className="muted-note">
                    Current object matched by name. This is an inferred association; the recorded
                    decision contains no target ID.
                  </p>
                )}
              </article>
            </>
          ) : (
            <div className="empty-instrument">
              <Brain size={32} />
              <h3>Awaiting the first decision</h3>
              <p>Recorded reasons and expected benefits will appear here as the Sovereign acts.</p>
            </div>
          )}
        </section>
      </div>
      <details className="mind-memory">
        <summary>Strategic memory & historical telemetry</summary>
        <div className="memory-grid">
          {mind.strategicMemory.map((memory) => (
            <article key={memory.id}>
              <span className="eyebrow">
                Day {memory.day} / {memory.type}
              </span>
              <strong>{memory.title}</strong>
              <p>{memory.description}</p>
            </article>
          ))}
        </div>
        <p>
          <b>Last success:</b> {mind.lastSuccess}
        </p>
        <p>
          <b>Last mistake:</b> {mind.lastMistake}
        </p>
        <p>
          <b>Regret:</b> {mind.regret}
        </p>
        <details>
          <summary>Logged thoughts</summary>
          {mind.botThoughts.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </details>
      </details>
    </div>
  );
}
