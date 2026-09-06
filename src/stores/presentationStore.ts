import { create } from 'zustand';
import type { PresentationEvent } from '../presentation/events';

interface PresentationStore {
  events: PresentationEvent[];
  directorStatus: string;
  publish: (events: PresentationEvent[]) => void;
  setDirectorStatus: (status: string) => void;
  reset: () => void;
}
export const usePresentationStore = create<PresentationStore>((set) => ({
  events: [],
  directorStatus: 'Observing the realm',
  publish: (events) => {
    if (events.length) set((s) => ({ events: [...events, ...s.events].slice(0, 32) }));
  },
  setDirectorStatus: (directorStatus) =>
    set((s) => (s.directorStatus === directorStatus ? s : { directorStatus })),
  reset: () => set({ events: [], directorStatus: 'Observing the realm' }),
}));
