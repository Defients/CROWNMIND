import { create } from 'zustand';
import type { Dungeon, Expedition } from '../types/dungeons';

interface DungeonStore {
  dungeons: Dungeon[];
  expeditions: Expedition[];
  selectedDungeonId: string | null;

  setDungeons: (dungeons: Dungeon[]) => void;
  setExpeditions: (expeditions: Expedition[]) => void;
  selectDungeon: (id: string | null) => void;
  reset: () => void;
}

export const useDungeonStore = create<DungeonStore>((set) => ({
  dungeons: [],
  expeditions: [],
  selectedDungeonId: null,

  setDungeons: (dungeons) => set({ dungeons }),
  setExpeditions: (expeditions) => set({ expeditions }),
  selectDungeon: (id) => set({ selectedDungeonId: id }),
  reset: () => set({ dungeons: [], expeditions: [], selectedDungeonId: null }),
}));
