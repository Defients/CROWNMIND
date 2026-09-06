import { create } from 'zustand';
import type { Treaty, Quest } from '../types/diplomacy';

interface DiplomacyStore {
  treaties: Treaty[];
  quests: Quest[];
  selectedFactionId: number | null;

  setTreaties: (treaties: Treaty[]) => void;
  setQuests: (quests: Quest[]) => void;
  selectFaction: (id: number | null) => void;
  reset: () => void;
}

export const useDiplomacyStore = create<DiplomacyStore>((set) => ({
  treaties: [],
  quests: [],
  selectedFactionId: null,

  setTreaties: (treaties) => set({ treaties }),
  setQuests: (quests) => set({ quests }),
  selectFaction: (id) => set({ selectedFactionId: id }),
  reset: () => set({ treaties: [], quests: [], selectedFactionId: null }),
}));
