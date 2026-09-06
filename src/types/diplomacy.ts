import type { EntityId } from '../engine/Entity';
import type { ItemDrop } from './equipment';

export type FactionStanding = number;

export type TreatyType = 'trade' | 'alliance' | 'nonAggression' | 'war';

export interface Treaty {
  id: string;
  type: TreatyType;
  factionId: EntityId;
  establishedDay: number;
  duration: number;
}

export type DiplomaticAction = 'gift' | 'proposeTrade' | 'proposeAlliance' | 'declareWar' | 'requestAid' | 'proposeNonAggression';

export interface QuestReward {
  gold?: number;
  mana?: number;
  items?: ItemDrop[];
  standingChange?: number;
  techUnlock?: string;
}

export interface Quest {
  id: string;
  factionId: EntityId;
  type: string;
  description: string;
  objective: string;
  reward: QuestReward;
  status: 'available' | 'active' | 'completed' | 'failed';
  dayIssued: number;
  dayExpires: number;
}

export function getStandingLabel(standing: number): string {
  if (standing <= -20) return 'Hostile';
  if (standing <= 20) return 'Neutral';
  if (standing <= 60) return 'Friendly';
  return 'Allied';
}

export function isHostile(standing: number): boolean {
  return standing <= -20;
}

export function isAllied(standing: number): boolean {
  return standing > 60;
}

export function isFriendly(standing: number): boolean {
  return standing > 20 && standing <= 60;
}
