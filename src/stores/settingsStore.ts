import { create } from 'zustand';
import type { SettingsState } from '../types/ui';

interface SettingsStore extends SettingsState {
  setGraphicsQuality: (q: 'low' | 'medium' | 'high') => void;
  setAnimationSpeed: (s: number) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  graphicsQuality: 'high',
  animationSpeed: 1,
  autoSave: true,
  autoSaveInterval: 30,
  keyBindings: {
    pause: 'Space',
    speed1: '1',
    speed2: '2',
    speed4: '4',
    toggleTech: 't',
    toggleEconomy: 'e',
    toggleSquad: 'g',
  },

  setGraphicsQuality: (q) => set({ graphicsQuality: q }),
  setAnimationSpeed: (s) => set({ animationSpeed: s }),
  setAutoSave: (enabled) => set({ autoSave: enabled }),
  setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
}));
