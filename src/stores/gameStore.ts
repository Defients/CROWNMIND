import { create } from 'zustand';
import type { GameState, GameConfig, GameStatus } from '../types/game';
import { initializeGame } from '../utils/worldGenerator';
import { simulateTick } from '../systems/simulationRunner';
import { useDiplomacyStore } from './diplomacyStore';
import { useDungeonStore } from './dungeonStore';

interface GameStore {
  state: GameState | null;
  status: GameStatus;
  speed: number;

  newGame: (config: GameConfig) => void;
  loadGame: (state: GameState) => void;
  tick: () => void;
  setSpeed: (speed: number) => void;
  setStatus: (status: GameStatus) => void;
  resetToSetup: () => void;
}

function syncSubStores(state: GameState): void {
  useDiplomacyStore.getState().setTreaties(state.treaties ?? []);
  useDiplomacyStore.getState().setQuests(state.quests ?? []);
  useDungeonStore.getState().setDungeons(state.dungeons ?? []);
  useDungeonStore.getState().setExpeditions(state.expeditions ?? []);
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  status: 'setup',
  speed: 1,

  newGame: (config: GameConfig) => {
    const state = initializeGame(config);
    state.gameStatus = 'playing';
    syncSubStores(state);
    set({ state, status: 'playing', speed: 3 });
  },

  loadGame: (state: GameState) => {
    syncSubStores(state);
    set({ state, status: state.gameStatus, speed: state.gameSpeed });
  },

  tick: () => {
    const { state, status } = get();
    if (!state || status !== 'playing') return;
    const newState = simulateTick(state);
    syncSubStores(newState);
    set({ state: newState, status: newState.gameStatus });
  },

  setSpeed: (speed: number) => {
    set({ speed });
    const { state } = get();
    if (state) {
      set({ state: { ...state, gameSpeed: speed } });
    }
  },

  setStatus: (status: GameStatus) => {
    set({ status });
  },

  resetToSetup: () => {
    useDiplomacyStore.getState().reset();
    useDungeonStore.getState().reset();
    set({ state: null, status: 'setup', speed: 1 });
  },
}));
