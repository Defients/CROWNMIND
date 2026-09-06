import {
  Crown,
  Coins,
  Trees,
  Mountain,
  Wheat,
  Gem,
  Users,
  Pause,
  Play,
  Settings,
  Save,
  ShieldAlert,
} from 'lucide-react';
import type { GameState } from '../types/game';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { SEASONS, WEATHER_TYPES } from '../types/world';
import { RESOURCE_LABELS } from '../types/resources';

const resources = [
  { key: 'gold', icon: Coins },
  { key: 'wood', icon: Trees },
  { key: 'stone', icon: Mountain },
  { key: 'food', icon: Wheat },
  { key: 'mana', icon: Gem },
  { key: 'population', icon: Users },
] as const;
const modes: Record<string, string> = {
  observer: 'Observer',
  coSovereign: 'Co-Sovereign',
  sandbox: 'Sandbox',
  endless: 'Endless',
  dailyChallenge: 'Daily challenge',
  rivalSovereigns: 'Rival sovereigns',
  campaign: 'Campaign',
};
export default function HudBar({ state }: { state: GameState }) {
  const speed = useGameStore((s) => s.speed),
    status = useGameStore((s) => s.status);
  const paused = status === 'paused' || speed === 0,
    ended = status === 'won' || status === 'lost';
  const changeSpeed = (value: number) => {
    if (ended) return;
    useGameStore.getState().setSpeed(value);
    useGameStore.getState().setStatus(value === 0 ? 'paused' : 'playing');
  };
  return (
    <header className="sovereign-hud">
      <div className="brand-lockup">
        <Crown size={25} aria-hidden="true" />
        <div>
          <strong>CROWNMIND</strong>
          <span>VEYLTHYR RISING</span>
        </div>
      </div>
      <div className="hud-day">
        <span className="eyebrow">
          Day {state.config.gameMode === 'endless' ? '∞' : `/ ${state.config.timeLimit}`}
        </span>
        <strong>{String(state.day).padStart(2, '0')}</strong>
        <small>
          {SEASONS[state.season.current].label} · {WEATHER_TYPES[state.weather.current].label}
        </small>
      </div>
      <div className="hud-resources" aria-label="Realm resources">
        {resources.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className={`resource-value ${key === 'gold' ? 'resource-gold' : ''} ${state.resources[key] < 10 && key !== 'population' ? 'resource-low' : ''}`}
            title={`${RESOURCE_LABELS[key]}: ${Math.floor(state.resources[key])} / ${state.resourceCapacity[key]}`}
          >
            <Icon size={15} aria-hidden="true" />
            <span className="sr-only">{RESOURCE_LABELS[key]} </span>
            <strong>{Math.floor(state.resources[key])}</strong>
            <small>{key}</small>
          </div>
        ))}
      </div>
      <div className="hud-pressure" title={`Realm stability ${Math.round(state.realmStability)}%`}>
        <ShieldAlert size={15} />
        <div>
          <span className="eyebrow">Threat</span>
          <strong>
            {Math.round(state.threatPressure)}
            <small>%</small>
          </strong>
        </div>
      </div>
      <div className="hud-mode">
        <span>{modes[state.config.gameMode]}</span>
        <small>{state.config.difficulty}</small>
      </div>
      <div className="time-controls" role="group" aria-label="Simulation speed">
        <button
          disabled={ended}
          onClick={() => changeSpeed(paused ? 1 : 0)}
          aria-label={paused ? 'Resume simulation' : 'Pause simulation'}
          title="Space · Pause / resume"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        {[1, 2, 4].map((value) => (
          <button
            disabled={ended}
            key={value}
            aria-label={`Set speed ${value}x`}
            aria-pressed={!paused && speed === value}
            onClick={() => changeSpeed(value)}
          >
            {value}×
          </button>
        ))}
        {![0, 1, 2, 4].includes(speed) && <span className="custom-speed">{speed}×</span>}
      </div>
      <button
        className="icon-control"
        aria-label="Save or load game"
        onClick={useUIStore.getState().toggleSaveLoad}
      >
        <Save size={17} />
      </button>
      <button
        className="icon-control"
        aria-label="Open settings"
        onClick={useUIStore.getState().toggleSettings}
      >
        <Settings size={17} />
      </button>
    </header>
  );
}
