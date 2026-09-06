import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { usePresentationStore } from '../stores/presentationStore';
import { PixiApp } from '../render/PixiApp';
import { deriveTheme } from '../presentation/theme';
import HudBar from './HudBar';
import SovereignLens from './SovereignLens';
import StrategicWorkspace from './StrategicWorkspace';
import ContextInspector from './ContextInspector';
import MapOverlayControls from './MapOverlayControls';
import MapControls from './MapControls';
import ActionBar from './ActionBar';

export default function GameScreen() {
  const state = useGameStore((s) => s.state),
    speed = useGameStore((s) => s.speed),
    status = useGameStore((s) => s.status);
  const workspace = useUIStore((s) => s.workspace);
  const events = usePresentationStore((s) => s.events),
    directorStatus = usePresentationStore((s) => s.directorStatus);
  const container = useRef<HTMLDivElement>(null),
    [pixi, setPixi] = useState<PixiApp | null>(null);
  const [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!container.current) return;
    let active = true;
    const app = new PixiApp();
    setError('');
    setPixi(null);
    useUIStore.getState().reset();
    usePresentationStore.getState().reset();
    app
      .init(container.current)
      .then(() => {
        if (!active) return;
        setPixi(app);
        if (import.meta.env.DEV) Object.assign(window, { __crownmindPresentation: app });
        const state = useGameStore.getState().state;
        if (state) app.render(state, useUIStore.getState());
      })
      .catch((err) => {
        app.destroy();
        if (active) {
          setError(String(err));
          console.error('Presentation initialization failed', err);
        }
      });
    return () => {
      active = false;
      app.destroy();
      if (import.meta.env.DEV) Reflect.deleteProperty(window, '__crownmindPresentation');
    };
  }, [attempt, state?.config]);
  useEffect(() => {
    if (speed <= 0 || status !== 'playing') return;
    const timer = window.setInterval(() => useGameStore.getState().tick(), 1000 / speed);
    return () => window.clearInterval(timer);
  }, [speed, status]);
  useEffect(() => {
    if (!pixi) return;
    const render = () => {
      const state = useGameStore.getState().state;
      if (state) pixi.render(state, useUIStore.getState());
    };
    render();
    const unsubscribeGame = useGameStore.subscribe(render),
      unsubscribeUI = useUIStore.subscribe(render);
    return () => {
      unsubscribeGame();
      unsubscribeUI();
    };
  }, [pixi]);
  if (!state) return null;
  const theme = deriveTheme(state),
    latest = events[0];
  return (
    <main
      className="sovereign-table"
      data-phase={theme.phase}
      style={{ '--corruption': theme.corruptionIntensity } as CSSProperties}
    >
      <HudBar state={state} />
      <section className="world-stage" aria-label="Living Sovereign Table">
        <div ref={container} className="world-canvas" />
        <div className="cartographic-frame" aria-hidden="true">
          <span className="frame-north">N</span>
          <span className="frame-title">THE LIVING SOVEREIGN TABLE</span>
          <span className="frame-coordinate">
            PYAHHOLD / {state.config.seedString.toUpperCase()}
          </span>
        </div>
        {!pixi && !error && <div className="renderer-loading">Awakening the living realm…</div>}
        {error && (
          <div className="renderer-loading">
            <strong>The world display could not start.</strong>
            <p>{error}</p>
            <button
              className="instrument-button"
              onClick={() => {
                setPixi(null);
                setAttempt((n) => n + 1);
              }}
            >
              Retry display
            </button>
          </div>
        )}
        <SovereignLens state={state} />
        <MapOverlayControls />
        {state.raidWarning?.active && (
          <div className="raid-signal" role="status">
            ⚠ RAID WARNING · {state.raidWarning.monsterCount} hostiles ·{' '}
            {state.raidWarning.sourceLairName}
          </div>
        )}
        {latest && (
          <button
            className={`world-signal ${latest.priority >= 80 ? 'critical' : ''}`}
            onClick={() => {
              if (latest.target) useUIStore.getState().setCameraTarget({ ...latest.target });
              else
                useUIStore
                  .getState()
                  .openWorkspace(latest.kind === 'decision' ? 'sovereign' : 'events');
            }}
          >
            <span className="eyebrow">
              <Sparkles size={12} />
              Day {latest.day} / {latest.kind}
            </span>
            <strong>{latest.title}</strong>
            <small>{latest.detail}</small>
            <ArrowUpRight size={15} />
          </button>
        )}
        <div className="director-caption">
          <span className="status-dot" />
          {directorStatus}
        </div>
        <MapControls pixiApp={pixi} />
        {workspace === 'inspector' && <ContextInspector state={state} />}
      </section>
      <ActionBar />
      <StrategicWorkspace state={state} />
    </main>
  );
}
