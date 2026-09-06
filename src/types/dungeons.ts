import type { EntityId } from '../engine/Entity';
import type { ItemDrop } from './equipment';

export type DungeonStatus = 'unexplored' | 'inProgress' | 'cleared' | 'failed';
export type DungeonRoomType = 'combat' | 'treasure' | 'trap' | 'shrine' | 'boss' | 'exit';

export interface DungeonRoom {
  id: string;
  type: DungeonRoomType;
  isCleared: boolean;
  monsters: EntityId[];
  rewards: ItemDrop[];
  connections: number[];
}

export interface Dungeon {
  id: string;
  entranceEntityId: EntityId;
  level: number;
  rooms: DungeonRoom[];
  status: DungeonStatus;
  currentRoomIndex: number;
  seed: number;
}

export interface Expedition {
  id: string;
  dungeonId: string;
  squadHeroIds: EntityId[];
  progress: number;
  loot: ItemDrop[];
  isActive: boolean;
  startedDay: number;
}

export interface DungeonConfig {
  minRooms: number;
  maxRooms: number;
  levelRange: [number, number];
}
