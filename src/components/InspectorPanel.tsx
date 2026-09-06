import React from 'react';
import type { GameState, GameMode } from '../types/game';
import {
  Shield,
  Heart,
  Swords,
  Coins,
  Compass,
  Hammer,
  Sparkles,
  Skull,
  Target,
  Zap,
  Lock,
  Eye,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import Panel from './ui/Panel';
import Badge from './ui/Badge';
import ProgressMeter from './ui/ProgressMeter';
import SectionHeader from './ui/SectionHeader';
import { useUIStore } from '../stores/uiStore';

interface InspectorPanelProps {
  state: GameState;
  onCastSpell?: (
    spellName: 'rallySpark' | 'zeeyaMend' | 'astryxFlare',
    targetX: number,
    targetY: number
  ) => void;
  onPlaceManualBounty?: (
    type: string,
    targetId: string,
    x: number,
    y: number,
    amount: number
  ) => void;
  gameMode?: GameMode;
}

export default function InspectorPanel({
  state,
  onCastSpell,
  onPlaceManualBounty,
  gameMode = 'coSovereign',
}: InspectorPanelProps) {
  const selection = useUIStore((s) => s.selection);
  const canInteract = gameMode !== 'observer' && !!onCastSpell;

  if (selection.entityId == null) {
    return (
      <Panel
        as="section"
        ariaLabel="Tactical inspector - no selection"
        glow="subtle"
        className="flex flex-col justify-center items-center p-6 text-center"
      >
        <div className="relative w-12 h-12 mb-3" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border border-[#9b5cff]/30 bg-[#9b5cff]/5" />
          <Compass className="w-6 h-6 text-[#9b5cff] absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#f5c84b]">
          Tactical Inspector
        </h3>
        <p className="text-[11px] text-[#eee8ff]/50 mt-2 max-w-[200px] leading-relaxed">
          Click any tile, hero, monster, building, or lair on the map to inspect details and issue
          tactical commands.
        </p>
        <div className="mt-4 flex flex-col gap-1.5 text-[10px] text-[#eee8ff]/40 font-mono">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3 h-3" aria-hidden="true" /> Audit any entity
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" aria-hidden="true" /> Cast tactical spells
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="w-3 h-3" aria-hidden="true" /> Commission bounties
          </span>
        </div>
      </Panel>
    );
  }

  const entity = state.world.entities[selection.entityId];
  if (!entity) {
    return (
      <Panel
        as="section"
        ariaLabel="Inspector - entity not found"
        glow="subtle"
        className="p-4 text-center"
      >
        <p className="text-[11px] text-[#eee8ff]/50">Entity not found.</p>
      </Panel>
    );
  }

  const pos = entity.Position as import('../engine/Component').PositionComponent | undefined;
  const health = entity.Health as import('../engine/Component').HealthComponent | undefined;
  const combat = entity.Combat as import('../engine/Component').CombatComponent | undefined;
  const heroAI = entity.HeroAI as import('../engine/Component').HeroAIComponent | undefined;
  const monsterAI = entity.MonsterAI as
    import('../engine/Component').MonsterAIComponent | undefined;
  const building = entity.Building as import('../engine/Component').BuildingComponent | undefined;
  const lair = entity.Lair as import('../engine/Component').LairComponent | undefined;
  const name = entity.Name as import('../engine/Component').NameComponent | undefined;

  const entityName = name?.name ?? 'Unknown';
  const x = pos?.x ?? 0;
  const y = pos?.y ?? 0;

  return (
    <Panel
      as="section"
      ariaLabel={`Inspector: ${entityName}`}
      glow="subtle"
      className="flex flex-col p-3 gap-3 overflow-hidden"
    >
      <div className="flex items-start justify-between border-b border-[rgba(128,90,213,0.28)] pb-2">
        <div>
          <h3 className="text-sm font-bold text-[#f5c84b] font-mono flex items-center gap-1.5 flex-wrap">
            {entityName}
          </h3>
          <p className="text-[11px] text-[#eee8ff]/60 italic">
            {heroAI
              ? heroAI.heroClass
              : monsterAI
                ? 'Monster'
                : building
                  ? building.buildingType
                  : lair
                    ? 'Lair'
                    : 'Entity'}
          </p>
        </div>
        {heroAI && <Badge text={`Lvl ${heroAI.level}`} color="violet" />}
        {monsterAI && <Badge text={`Lvl ${monsterAI.level}`} color="danger" />}
      </div>

      {health && (
        <ProgressMeter
          label="HP"
          value={health.hp}
          max={health.maxHp}
          showValue
          valueSuffix={`/${health.maxHp}`}
        />
      )}

      {combat && (
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-1.5 text-center">
            <span className="text-[9px] text-[#eee8ff]/50 block font-mono">ATK</span>
            <span className="font-mono font-bold text-[#ff4d6d] text-sm">{combat.attack}</span>
          </div>
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-1.5 text-center">
            <span className="text-[9px] text-[#eee8ff]/50 block font-mono">DEF</span>
            <span className="font-mono font-bold text-[#38e68b] text-sm">{combat.defense}</span>
          </div>
          <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-1.5 text-center">
            <span className="text-[9px] text-[#eee8ff]/50 block font-mono">SPD</span>
            <span className="font-mono font-bold text-[#9b5cff] text-sm">
              {combat.speed.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {heroAI && (
        <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-2 flex flex-col gap-1.5">
          <SectionHeader title="Personality" icon={TrendingUp} color="text-[#26f4ff]" />
          <ProgressMeter label="Courage" value={heroAI.courage} showValue valueSuffix="%" />
          <ProgressMeter label="Greed" value={heroAI.greed} showValue valueSuffix="%" />
          <ProgressMeter label="Caution" value={heroAI.caution} showValue valueSuffix="%" />
        </div>
      )}

      {heroAI && heroAI.specialization && (
        <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-2">
          <span className="text-[9px] font-mono text-[#eee8ff]/50 uppercase">Specialization</span>
          <p className="text-[11px] text-[#f5c84b] font-bold">{heroAI.specialization}</p>
        </div>
      )}

      <div className="bg-[#07040d] border border-[rgba(128,90,213,0.18)] rounded-md p-2 text-xs flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-[#eee8ff]/40" />
        <span className="font-mono text-[#eee8ff]/70">
          ({x.toFixed(1)}, {y.toFixed(1)})
        </span>
      </div>

      {lair && (
        <div className="bg-gradient-to-r from-[#1a1028] to-[#07040d]/80 border-l-2 border-[#9b5cff] p-2.5 rounded-r-lg">
          <span className="text-[10px] font-mono uppercase text-[#f5c84b] font-bold block">
            Lair Threat
          </span>
          <p className="font-mono font-bold text-[#ffb84d] mt-0.5 text-sm">{lair.threatLevel}</p>
        </div>
      )}

      {canInteract && (
        <div className="border-t border-[rgba(128,90,213,0.28)] pt-3 flex flex-col gap-2.5 flex-shrink-0">
          <SectionHeader title="Tactical Spells" icon={Zap} color="text-[#f5c84b]" />
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onCastSpell('rallySpark', x, y)}
              aria-label="Cast Rally Spark spell"
              className="flex flex-col items-center gap-1 p-2 rounded-md border border-[#f5c84b]/30 bg-[#f5c84b]/5 hover:bg-[#f5c84b]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c84b]/50"
            >
              <Sparkles className="w-4 h-4 text-[#f5c84b]" aria-hidden="true" />
              <span className="text-[9px] font-mono text-[#f5c84b]">Rally</span>
            </button>
            <button
              type="button"
              onClick={() => onCastSpell('zeeyaMend', x, y)}
              aria-label="Cast Zeeya Mend spell"
              className="flex flex-col items-center gap-1 p-2 rounded-md border border-[#38e68b]/30 bg-[#38e68b]/5 hover:bg-[#38e68b]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38e68b]/50"
            >
              <Heart className="w-4 h-4 text-[#38e68b]" aria-hidden="true" />
              <span className="text-[9px] font-mono text-[#38e68b]">Mend</span>
            </button>
            <button
              type="button"
              onClick={() => onCastSpell('astryxFlare', x, y)}
              aria-label="Cast Astryx Flare spell"
              className="flex flex-col items-center gap-1 p-2 rounded-md border border-[#9b5cff]/30 bg-[#9b5cff]/5 hover:bg-[#9b5cff]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
            >
              <Target className="w-4 h-4 text-[#9b5cff]" aria-hidden="true" />
              <span className="text-[9px] font-mono text-[#9b5cff]">Flare</span>
            </button>
          </div>
        </div>
      )}

      {!canInteract && (
        <div className="text-center py-4 flex flex-col items-center gap-2">
          <Lock className="w-5 h-5 text-[rgba(128,90,213,0.4)]" />
          <p className="text-[11px] text-[#eee8ff]/60 font-mono">
            {gameMode === 'observer'
              ? 'Observer mode · inspection available'
              : 'Tactical spell controls are not connected in this build.'}
          </p>
        </div>
      )}
    </Panel>
  );
}
