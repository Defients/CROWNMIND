import type { GameState, SaveData } from '../types/game';

export function serializeSave(state: GameState, name: string): SaveData {
  return {
    version: Date.now(),
    timestamp: Date.now(),
    config: state.config,
    state: JSON.parse(JSON.stringify(state)),
    name,
  };
}

export function deserializeSave(data: SaveData): GameState {
  return JSON.parse(JSON.stringify(data.state));
}
