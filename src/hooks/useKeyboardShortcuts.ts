import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import type { OverlayMode } from '../types/ui';

const overlayCycle: OverlayMode[] = ['none', 'threat', 'bounties', 'heroes', 'fog', 'resources', 'sovereign', 'diplomacy', 'dungeons'];

export function useKeyboardShortcuts() {
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const status = useGameStore((s) => s.status);
  const setStatus = useGameStore((s) => s.setStatus);

  const toggleTechTree = useUIStore((s) => s.toggleTechTree);
  const toggleSquadPanel = useUIStore((s) => s.toggleSquadPanel);
  const toggleEconomyPanel = useUIStore((s) => s.toggleEconomyPanel);
  const toggleFactionPanel = useUIStore((s) => s.toggleFactionPanel);
  const toggleDiplomacyPanel = useUIStore((s) => s.toggleDiplomacyPanel);
  const toggleDungeonPanel = useUIStore((s) => s.toggleDungeonPanel);
  const toggleEquipmentPanel = useUIStore((s) => s.toggleEquipmentPanel);
  const toggleSkillTreePanel = useUIStore((s) => s.toggleSkillTreePanel);
  const toggleRivalPanel = useUIStore((s) => s.toggleRivalPanel);
  const toggleScenarioPanel = useUIStore((s) => s.toggleScenarioPanel);
  const toggleDirectorMode = useUIStore((s) => s.toggleDirectorMode);
  const toggleFollowSelected = useUIStore((s) => s.toggleFollowSelected);
  const toggleSettings = useUIStore((s) => s.toggleSettings);
  const toggleSaveLoad = useUIStore((s) => s.toggleSaveLoad);
  const setOverlay = useUIStore((s) => s.setOverlay);
  const overlayMode = useUIStore((s) => s.overlayMode);

  const showSettings = useUIStore((s) => s.showSettings);
  const showSaveLoad = useUIStore((s) => s.showSaveLoad);
  const showTechTree = useUIStore((s) => s.showTechTree);
  const showSquadPanel = useUIStore((s) => s.showSquadPanel);
  const showEconomyPanel = useUIStore((s) => s.showEconomyPanel);
  const showFactionPanel = useUIStore((s) => s.showFactionPanel);
  const showDiplomacyPanel = useUIStore((s) => s.showDiplomacyPanel);
  const showDungeonPanel = useUIStore((s) => s.showDungeonPanel);
  const showEquipmentPanel = useUIStore((s) => s.showEquipmentPanel);
  const showSkillTreePanel = useUIStore((s) => s.showSkillTreePanel);
  const showRivalPanel = useUIStore((s) => s.showRivalPanel);
  const showScenarioPanel = useUIStore((s) => s.showScenarioPanel);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (status !== 'playing' && status !== 'paused') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (status === 'playing') {
            setStatus('paused');
            setSpeed(0);
          } else if (status === 'paused') {
            setStatus('playing');
            setSpeed(speed > 0 ? speed : 1);
          }
          break;
        case '1':
          e.preventDefault();
          setSpeed(1);
          if (status === 'paused') setStatus('playing');
          break;
        case '2':
          e.preventDefault();
          setSpeed(2);
          if (status === 'paused') setStatus('playing');
          break;
        case '4':
          e.preventDefault();
          setSpeed(4);
          if (status === 'paused') setStatus('playing');
          break;
        case 'Escape':
          if (showSettings) { toggleSettings(); return; }
          if (showSaveLoad) { toggleSaveLoad(); return; }
          if (showTechTree) { toggleTechTree(); return; }
          if (showSquadPanel) { toggleSquadPanel(); return; }
          if (showEconomyPanel) { toggleEconomyPanel(); return; }
          if (showFactionPanel) { toggleFactionPanel(); return; }
          if (showDiplomacyPanel) { toggleDiplomacyPanel(); return; }
          if (showDungeonPanel) { toggleDungeonPanel(); return; }
          if (showEquipmentPanel) { toggleEquipmentPanel(); return; }
          if (showSkillTreePanel) { toggleSkillTreePanel(); return; }
          if (showRivalPanel) { toggleRivalPanel(); return; }
          if (showScenarioPanel) { toggleScenarioPanel(); return; }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          toggleTechTree();
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          toggleEquipmentPanel();
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          toggleEconomyPanel();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFactionPanel();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          toggleDiplomacyPanel();
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          toggleDungeonPanel();
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          toggleSkillTreePanel();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          toggleRivalPanel();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          toggleScenarioPanel();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleSquadPanel();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          toggleDirectorMode();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          toggleFollowSelected();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          {
            const idx = overlayCycle.indexOf(overlayMode);
            const next = overlayCycle[(idx + 1) % overlayCycle.length];
            setOverlay(next);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    speed, setSpeed, status, setStatus,
    toggleTechTree, toggleSquadPanel, toggleEconomyPanel, toggleFactionPanel,
    toggleDiplomacyPanel, toggleDungeonPanel, toggleEquipmentPanel, toggleSkillTreePanel,
    toggleRivalPanel, toggleScenarioPanel,
    toggleDirectorMode, toggleFollowSelected, toggleSettings, toggleSaveLoad,
    setOverlay, overlayMode,
    showSettings, showSaveLoad, showTechTree, showSquadPanel, showEconomyPanel, showFactionPanel,
    showDiplomacyPanel, showDungeonPanel, showEquipmentPanel, showSkillTreePanel, showRivalPanel, showScenarioPanel,
  ]);
}
