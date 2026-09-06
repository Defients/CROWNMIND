import type { ComponentType } from './Component';

export class EventBus {
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  on(event: string, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: (payload: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, payload: any): void {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const gameEvents = new EventBus();
