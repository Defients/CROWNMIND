import React, { useMemo } from 'react';
import { Clock, Coins, Trees, Mountain, Wheat, Gem, Users, Pause, Play, FastForward, Settings, Save, Gamepad2, Star, Heart, Sparkles } from 'lucide-react';
import type { GameState } from '../types/game';
import { RESOURCE_LABELS, RESOURCE_COLORS } from '../types/resources';
import { SEASONS, WEATHER_TYPES } from '../types/world';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import Tooltip from './ui/Tooltip';

interface HudBarProps {
  state: GameState;
}

const resourceIcons: Record<string, typeof Coins> = {
  gold: Coins,
  wood: Trees,
  stone: Mountain,
  food: Wheat,
  mana: Gem,
  population: Users,
};

export default function HudBar({ state }: HudBarProps) {
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const toggleSaveLoad = useUIStore((s) => s.toggleSaveLoad);
  const toggleSettings = useUIStore((s) => s.toggleSettings);

  const seasonInfo = SEASONS[state.season.current];
  const weatherInfo = WEATHER_TYPES[state.weather.current];

  const liveHeroes = useMemo(() => {
    if (!state.world.entities) return 0;
    return Object.entries(state.world.entities).filter(([, comps]) => {
      const heroAI = Object.values(comps).find(c => c.type === 'HeroAI');
      const health = Object.values(comps).find(c => c.type === 'Health');
      return heroAI && health && (health as { hp: number }).hp > 0;
    }).length;
  }, [state]);

  const modeBadgeColor = state.config.gameMode === 'observer' ? 'sky' : state.config.gameMode === 'sandbox' ? 'warning' : 'violet';
  const diffBadgeColor = state.config.difficulty === 'easy' ? 'green' : state.config.difficulty === 'hard' ? 'danger' : 'muted';

  return (
    <div className="bg-[#120b1c] border border-[rgba(128,90,213,0.28)] rounded-xl glow-subtle flex items-center gap-2 px-2.5 py-1.5 font-sans">
      {/* Logo + badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 bg-[#f5c84b] rounded-md flex items-center justify-center text-[#07040d] font-serif font-bold text-sm glow-gold flex-shrink-0">C</div>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
          modeBadgeColor === 'sky' ? 'border-sky-500/30 bg-sky-500/5 text-sky-400' :
          modeBadgeColor === 'warning' ? 'border-[#ffb84d]/30 bg-[#ffb84d]/5 text-[#ffb84d]' :
          'border-[#9b5cff]/30 bg-[#9b5cff]/5 text-[#9b5cff]'
        }`}>
          <Gamepad2 className="w-2.5 h-2.5" />
          {state.config.gameMode === 'observer' ? 'Obs' : state.config.gameMode === 'sandbox' ? 'Sand' : 'Co-Sov'}
        </span>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
          diffBadgeColor === 'green' ? 'border-[#38e68b]/30 bg-[#38e68b]/5 text-[#38e68b]' :
          diffBadgeColor === 'danger' ? 'border-[#ff4d6d]/30 bg-[#ff4d6d]/5 text-[#ff4d6d]' :
          'border-[rgba(128,90,213,0.28)] bg-[#1a1028] text-[#eee8ff]/60'
        }`}>
          <Star className="w-2.5 h-2.5" />
          {state.config.difficulty === 'easy' ? 'Easy' : state.config.difficulty === 'hard' ? 'Hard' : 'Std'}
        </span>
      </div>

      <div className="w-px h-5 bg-[rgba(128,90,213,0.18)] flex-shrink-0" />

      {/* Day */}
      <Tooltip content={`Day ${state.day} of ${state.config.timeLimit}`} side="bottom">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#f5c84b]/30 bg-[#f5c84b]/5 flex-shrink-0">
          <Clock className="w-3 h-3 text-[#f5c84b]" />
          <span className="font-mono text-xs font-bold text-[#f5c84b]">{state.day}/{state.config.timeLimit}</span>
        </div>
      </Tooltip>

      {/* Resources - compact */}
      <div className="flex items-center gap-1">
        {(['gold', 'wood', 'stone', 'food', 'mana', 'population'] as const).map(res => {
          const Icon = resourceIcons[res];
          const value = state.resources[res] ?? 0;
          const cap = state.resourceCapacity[res] ?? 9999;
          return (
            <Tooltip key={res} content={`${RESOURCE_LABELS[res]}: ${value}${cap < 9999 ? ` / ${cap}` : ''}`} side="bottom">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border" style={{ borderColor: `${RESOURCE_COLORS[res]}30`, background: `${RESOURCE_COLORS[res]}05` }}>
                <Icon className="w-3 h-3" style={{ color: RESOURCE_COLORS[res] }} />
                <span className="font-mono text-xs font-bold" style={{ color: RESOURCE_COLORS[res] }}>{value}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <div className="w-px h-5 bg-[rgba(128,90,213,0.18)] flex-shrink-0" />

      {/* Stability + Threat compact */}
      <Tooltip content={`Stability: ${Math.round(state.realmStability)}% | Threat: ${Math.round(state.threatPressure)}%`} side="bottom">
        <div className="flex flex-col gap-0.5 px-2 py-0.5 rounded-md border border-[rgba(128,90,213,0.28)] bg-[#1a1028] min-w-[80px]">
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-[#38e68b]/60">Stab</span>
            <span className="font-bold text-[#38e68b]">{Math.round(state.realmStability)}%</span>
          </div>
          <div className="w-full bg-[#07040d] h-0.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#38e68b] transition-all duration-500 rounded-full" style={{ width: `${state.realmStability}%` }} />
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-[#ff4d6d]/60">Threat</span>
            <span className="font-bold text-[#ff4d6d]">{Math.round(state.threatPressure)}%</span>
          </div>
          <div className="w-full bg-[#07040d] h-0.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#ff4d6d] transition-all duration-500 rounded-full" style={{ width: `${state.threatPressure}%` }} />
          </div>
        </div>
      </Tooltip>

      {/* Heroes */}
      <Tooltip content={`Heroes alive: ${liveHeroes}`} side="bottom">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#9b5cff]/30 bg-[#9b5cff]/5 flex-shrink-0">
          <Heart className="w-3 h-3 text-[#9b5cff]" />
          <span className="font-mono text-xs font-bold text-[#9b5cff]">{liveHeroes}</span>
        </div>
      </Tooltip>

      {/* Favor */}
      {state.config.gameMode === 'coSovereign' && (
        <Tooltip content={`Sovereign Favor: ${state.sovereignFavor} / ${state.maxFavor}`} side="bottom">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#26f4ff]/30 bg-[#26f4ff]/5 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-[#26f4ff]" />
            <span className="font-mono text-xs font-bold text-[#26f4ff]">{state.sovereignFavor}</span>
          </div>
        </Tooltip>
      )}

      {/* Season + Weather */}
      <Tooltip content={`${seasonInfo.label} · ${weatherInfo.label}`} side="bottom">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-[rgba(128,90,213,0.28)] bg-[#1a1028] flex-shrink-0">
          <span className="text-[9px] font-mono text-[#eee8ff]/60">{seasonInfo.label}</span>
          <span className="text-[9px] font-mono text-[#eee8ff]/40">·</span>
          <span className="text-[9px] font-mono text-[#eee8ff]/60">{weatherInfo.label}</span>
        </div>
      </Tooltip>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Speed controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0" role="group" aria-label="Simulation speed">
        <button type="button" onClick={() => setSpeed(0)} aria-pressed={speed === 0} aria-label="Pause" className={`p-1 rounded-md border transition-all ${speed === 0 ? 'border-[#ff4d6d]/40 bg-[#ff4d6d]/10 text-[#ff4d6d]' : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}>
          <Pause className="w-3 h-3" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setSpeed(1)} aria-pressed={speed === 1} aria-label="Normal speed" className={`p-1 rounded-md border transition-all ${speed === 1 ? 'border-[#38e68b]/40 bg-[#38e68b]/10 text-[#38e68b]' : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}>
          <Play className="w-3 h-3" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setSpeed(2)} aria-pressed={speed === 2} aria-label="Double speed" className={`p-1 rounded-md border transition-all ${speed === 2 ? 'border-[#f5c84b]/40 bg-[#f5c84b]/10 text-[#f5c84b]' : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}>
          <FastForward className="w-3 h-3" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setSpeed(4)} aria-pressed={speed === 4} aria-label="Quadruple speed" className={`px-1.5 py-1 rounded-md border transition-all text-[9px] font-mono font-bold ${speed === 4 ? 'border-[#f5c84b]/40 bg-[#f5c84b]/10 text-[#f5c84b]' : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}>
          4x
        </button>
      </div>

      <button type="button" onClick={toggleSaveLoad} aria-label="Save & Load" className="p-1 rounded-md border border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50">
        <Save className="w-3 h-3" aria-hidden="true" />
      </button>
      <button type="button" onClick={toggleSettings} aria-label="Settings" className="p-1 rounded-md border border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50">
        <Settings className="w-3 h-3" aria-hidden="true" />
      </button>

      {state.activeEvent && (
        <div className="ml-2 bg-gradient-to-r from-[#1a1028] via-[#120b1c] to-[#1a1028] border border-[#9b5cff]/40 rounded-lg px-2 py-1 flex items-center gap-1.5 glow-violet">
          <Sparkles className="w-3 h-3 text-[#f5c84b] animate-pulse" />
          <span className="text-[9px] uppercase font-mono tracking-widest font-bold text-[#f5c84b]">Event:</span>
          <span className="text-[10px] font-serif italic text-white">{state.activeEvent.title}</span>
        </div>
      )}
    </div>
  );
}
