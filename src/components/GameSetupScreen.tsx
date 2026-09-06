import React, { useState } from 'react';
import {
  Swords,
  Eye,
  Gamepad2,
  Star,
  Map as MapIcon,
  Mountain,
  Sprout,
  Snowflake,
  Clock,
  Dices,
  Play,
  Save,
  Upload,
} from 'lucide-react';
import type { GameConfig, MapSize, Difficulty, GameMode } from '../types/game';
import type { Biome } from '../types/world';
import { MAP_SIZES, MAP_SIZE_LABELS, DEFAULT_TIME_LIMIT } from '../types/game';
import { BIOMES, BIOME_LIST } from '../types/world';
import { useGameStore } from '../stores/gameStore';
import { useSaveStore } from '../stores/saveStore';
import { deserializeSave } from '../persistence/SaveSerializer';
import { hashSeed } from '../utils/rng';
import RealmPreview from './RealmPreview';

const biomeIcons: Record<Biome, typeof Mountain> = {
  temperate: Sprout,
  arid: Mountain,
  tundra: Snowflake,
};

export default function GameSetupScreen() {
  const newGame = useGameStore((s) => s.newGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const refreshSaves = useSaveStore((s) => s.refreshSaves);
  const saves = useSaveStore((s) => s.saves);
  const loadSave = useSaveStore((s) => s.load);

  const [seedString, setSeedString] = useState(() => Math.random().toString(36).substring(2, 10));
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [gameMode, setGameMode] = useState<GameMode>('observer');
  const [biome, setBiome] = useState<Biome>('temperate');
  const [mapSize, setMapSize] = useState<MapSize>('standard');
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [showSaves, setShowSaves] = useState(false);

  const handleStart = () => {
    const config: GameConfig = {
      seed: hashSeed(seedString),
      seedString,
      difficulty,
      gameMode,
      biome,
      mapSize,
      timeLimit,
    };
    newGame(config);
  };

  const handleLoadSave = async (id: string) => {
    const data = await loadSave(id);
    if (data) {
      loadGame(deserializeSave(data));
    }
  };

  React.useEffect(() => {
    if (showSaves) refreshSaves();
  }, [showSaves, refreshSaves]);

  return (
    <div className="awakening-screen" data-biome={biome}>
      <section className="awakening-vista">
        <span className="eyebrow">VEYLTHYR RISING / PRESENTATION ENGINE II</span>
        <h1>CROWNMIND</h1>
        <p className="awakening-thesis">
          A kingdom alive.
          <br />A mind within it.
        </p>
        <RealmPreview seed={seedString} biome={biome} difficulty={difficulty} />
        <div className="awakening-note">
          <span>THE LIVING SOVEREIGN TABLE</span>
          <p>
            The Sovereign builds, reasons, and leads. Witness its decisions. Read their
            consequences. Survive the shadow of Veylthyr.
          </p>
        </div>
        <div className="awakening-meta">
          <span>{BIOMES[biome].label} realm</span>
          <span>
            {MAP_SIZES[mapSize]} × {MAP_SIZES[mapSize]} tiles
          </span>
          <span>{timeLimit} days</span>
        </div>
      </section>
      <div className="awakening-config custom-scrollbar">
        <div className="awakening-heading">
          <span className="eyebrow">01 / Bind a realm</span>
          <h2>Awaken the Sovereign</h2>
          <p>Choose the world this intelligence will inherit.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="seed-input"
              className="text-[10px] font-mono uppercase text-[#eee8ff]/60 mb-1.5 block"
            >
              Kingdom identity / seed
            </label>
            <div className="flex gap-2">
              <input
                id="seed-input"
                type="text"
                value={seedString}
                onChange={(e) => setSeedString(e.target.value)}
                aria-label="World seed"
                className="flex-1 bg-[#07040d] border border-[rgba(128,90,213,0.28)] rounded-lg px-3 py-2 text-sm font-mono text-[#eee8ff] outline-none focus:border-[#9b5cff]/50 focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
              />
              <button
                type="button"
                onClick={() => setSeedString(Math.random().toString(36).substring(2, 10))}
                aria-label="Randomize seed"
                className="px-3 py-2 bg-[#1a1028] border border-[rgba(128,90,213,0.28)] rounded-lg text-[#eee8ff]/60 hover:text-[#eee8ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
              >
                <Dices className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#eee8ff]/60 mb-1.5 block">
                Game Mode
              </label>
              <div className="flex flex-col gap-1">
                {(
                  [
                    { value: 'observer', label: 'Observer', icon: Eye, desc: 'Watch the AI play' },
                    {
                      value: 'coSovereign',
                      label: 'Co-Sovereign',
                      icon: Swords,
                      desc: 'Interact with spells & bounties',
                    },
                    {
                      value: 'sandbox',
                      label: 'Sandbox',
                      icon: Gamepad2,
                      desc: 'Unrestricted simulation',
                    },
                  ] as const
                ).map(({ value, label, icon: Icon, desc }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setGameMode(value)}
                    aria-pressed={gameMode === value}
                    aria-label={`${label} mode: ${desc}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                      gameMode === value
                        ? 'border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#eee8ff]'
                        : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]/80'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{label}</span>
                      <span className="text-[9px] opacity-60">{desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#eee8ff]/60 mb-1.5 block">
                Difficulty
              </label>
              <div className="flex flex-col gap-1">
                {(
                  [
                    { value: 'easy', label: 'Easy', icon: Star, color: 'text-[#38e68b]' },
                    { value: 'standard', label: 'Standard', icon: Star, color: 'text-[#ffb84d]' },
                    { value: 'hard', label: 'Hard', icon: Star, color: 'text-[#ff4d6d]' },
                  ] as const
                ).map(({ value, label, icon: Icon, color }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setDifficulty(value)}
                    aria-pressed={difficulty === value}
                    aria-label={`${label} difficulty`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                      difficulty === value
                        ? 'border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#eee8ff]'
                        : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]/80'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}
                  >
                    <Icon
                      className={`w-4 h-4 ${difficulty === value ? color : ''}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#eee8ff]/60 mb-1.5 block">
                Biome
              </label>
              <div className="flex gap-1">
                {BIOME_LIST.map((b) => {
                  const Icon = biomeIcons[b];
                  return (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setBiome(b)}
                      aria-pressed={biome === b}
                      aria-label={`${BIOMES[b].label} biome`}
                      className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg border transition-all ${
                        biome === b
                          ? 'border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#eee8ff]'
                          : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]/80'
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span className="text-[9px] font-mono">{BIOMES[b].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#eee8ff]/60 mb-1.5 block">
                Map Size
              </label>
              <div className="flex gap-1">
                {(['small', 'standard', 'large'] as MapSize[]).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setMapSize(s)}
                    aria-pressed={mapSize === s}
                    aria-label={`${MAP_SIZE_LABELS[s]} map`}
                    className={`flex-1 px-2 py-2 rounded-lg border text-center transition-all ${
                      mapSize === s
                        ? 'border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#eee8ff]'
                        : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]/80'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}
                  >
                    <MapIcon className="w-4 h-4 mx-auto mb-0.5" aria-hidden="true" />
                    <span className="text-[9px] font-mono">{MAP_SIZE_LABELS[s].split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="time-limit-slider"
              className="text-[10px] font-mono uppercase text-[#eee8ff]/60 mb-1.5 block"
            >
              Time Limit: {timeLimit} days
            </label>
            <input
              id="time-limit-slider"
              type="range"
              min={30}
              max={120}
              step={10}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              aria-label="Time limit in days"
              className="w-full accent-[#9b5cff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50 rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStart}
            aria-label="Awaken CROWNMIND"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#f5c84b] text-[#07040d] rounded-xl font-bold text-sm hover:bg-[#ffd96b] transition-colors glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c84b]/50"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            Awaken CROWNMIND
          </button>
          <button
            type="button"
            onClick={() => setShowSaves(!showSaves)}
            aria-label="Load saved game"
            aria-expanded={showSaves}
            className="px-4 py-3 bg-[#1a1028] border border-[rgba(128,90,213,0.28)] rounded-xl text-[#eee8ff]/70 hover:text-[#eee8ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs ml-2">Load</span>
          </button>
        </div>

        {showSaves && (
          <div className="border-t border-[rgba(128,90,213,0.18)] pt-4">
            <h3 className="text-xs font-mono uppercase text-[#eee8ff]/60 mb-2">Saved Games</h3>
            {saves.length === 0 ? (
              <p className="text-xs text-[#eee8ff]/40">No saves found.</p>
            ) : (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                {saves.map((save) => (
                  <button
                    type="button"
                    key={save.version}
                    onClick={() => handleLoadSave(String(save.version))}
                    aria-label={`Load save ${save.name}, day ${save.state.day}`}
                    className="flex items-center gap-2 px-3 py-2 bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-lg text-left hover:border-[#9b5cff]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
                  >
                    <Upload className="w-3 h-3 text-[#26f4ff]" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#eee8ff]">{save.name}</span>
                      <span className="text-[9px] text-[#eee8ff]/40 font-mono">
                        Day {save.state.day} — {save.config.difficulty} —{' '}
                        {new Date(save.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
