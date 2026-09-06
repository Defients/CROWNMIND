import type { GameState, SovereignPhaseType } from '../types/game';

export const INK = {
  void: 0x07040d,
  text: 0xeee8ff,
  gold: 0xf5c84b,
  violet: 0x9b5cff,
  cyan: 0x26f4ff,
  green: 0x38e68b,
  threat: 0xff4d6d,
  warning: 0xffb84d,
} as const;
export const PHASE_LABELS: Record<SovereignPhaseType, string> = {
  opening: 'Establishing the realm',
  scouting: 'Reading the unknown',
  stabilizing: 'Securing the foundation',
  expanding: 'Extending influence',
  fortifying: 'Preparing the defenses',
  hunting: 'Hunting the threat',
  spirePreparation: 'Preparing for Veylthyr',
  finalAssault: 'The final convergence',
  emergency: 'Defending Pyahhold',
};
export const QUALITY = {
  low: { dpr: 1, particles: 24, weather: 35, effects: 8, detail: false },
  medium: { dpr: 1.5, particles: 60, weather: 90, effects: 14, detail: true },
  high: { dpr: 2, particles: 100, weather: 160, effects: 20, detail: true },
} as const;
export type Quality = keyof typeof QUALITY;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

/** Stateless cosmetic noise. Never shares or advances a simulation RNG. */
export function noise(id: number, salt = 0): number {
  let n = Math.imul(id ^ salt, 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
export function deriveTheme(state: GameState) {
  const phase = state.sovereignMind.phase;
  const spire =
    state.spireEntityId == null ? undefined : state.world.entities[state.spireEntityId]?.Lair;
  const discovered = spire?.type === 'Lair' && spire.isDiscovered && !spire.isDestroyed;
  return {
    phase,
    label: PHASE_LABELS[phase],
    cognitionIntensity: clamp01(state.sovereignMind.confidence / 100),
    threatIntensity: clamp01(state.threatPressure / 100),
    corruptionIntensity: discovered
      ? phase === 'finalAssault'
        ? 0.85
        : phase === 'spirePreparation'
          ? 0.55
          : 0.16
      : 0,
    ambientTempo: phase === 'emergency' ? 1.25 : 0.7,
  };
}
