import { create } from 'zustand';
import type { SaveData } from '../types/game';
import { saveToDB, loadFromDB, getAllSaves, deleteSaveFromDB } from '../persistence/IndexedDBAdapter';

interface SaveStore {
  saves: SaveData[];
  loading: boolean;
  error: string | null;

  refreshSaves: () => Promise<void>;
  save: (data: SaveData) => Promise<void>;
  load: (id: string) => Promise<SaveData | null>;
  deleteSave: (id: string) => Promise<void>;
}

export const useSaveStore = create<SaveStore>((set) => ({
  saves: [],
  loading: false,
  error: null,

  refreshSaves: async () => {
    set({ loading: true, error: null });
    try {
      const saves = await getAllSaves();
      set({ saves, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },

  save: async (data: SaveData) => {
    set({ loading: true, error: null });
    try {
      await saveToDB(data);
      const saves = await getAllSaves();
      set({ saves, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },

  load: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await loadFromDB(id);
      set({ loading: false });
      return data;
    } catch (e) {
      set({ loading: false, error: String(e) });
      return null;
    }
  },

  deleteSave: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteSaveFromDB(id);
      const saves = await getAllSaves();
      set({ saves, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },
}));
