import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUIStore, type Workspace } from '../stores/uiStore';
import type { OverlayMode } from '../types/ui';
const overlayCycle: OverlayMode[] = [
  'none',
  'threat',
  'bounties',
  'heroes',
  'fog',
  'resources',
  'sovereign',
  'diplomacy',
  'dungeons',
];
const workspaces: Record<string, Workspace> = {
  t: 'tech',
  s: 'squad',
  e: 'economy',
  f: 'faction',
  d: 'diplomacy',
  g: 'dungeon',
  q: 'equipment',
  k: 'skill',
  v: 'rival',
  j: 'scenario',
  c: 'sovereign',
  l: 'events',
};
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
      const ui = useUIStore.getState(),
        game = useGameStore.getState(),
        key = e.key.toLowerCase();
      if (game.status !== 'playing' && game.status !== 'paused') return;
      if (key === 'escape') {
        if (ui.showSettings || ui.showSaveLoad) return;
        ui.closeWorkspace();
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      if (ui.showSettings || ui.showSaveLoad) return;
      if (key === ' ' && !target.closest('button, a')) {
        e.preventDefault();
        const paused = game.status === 'paused' || game.speed === 0;
        game.setSpeed(paused ? 1 : 0);
        game.setStatus(paused ? 'playing' : 'paused');
      } else if (['1', '2', '4'].includes(key)) {
        e.preventDefault();
        game.setSpeed(Number(key));
        game.setStatus('playing');
      } else if (workspaces[key]) {
        e.preventDefault();
        ui.openWorkspace(ui.workspace === workspaces[key] ? null : workspaces[key]);
      } else if (key === 'r') ui.toggleDirectorMode();
      else if (key === 'h') ui.toggleFollowSelected();
      else if (key === 'm')
        ui.setOverlay(
          overlayCycle[(overlayCycle.indexOf(ui.overlayMode) + 1) % overlayCycle.length]
        );
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
