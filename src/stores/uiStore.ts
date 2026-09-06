import { create } from 'zustand';
import type { UISelectionState, PanelType, OverlayMode } from '../types/ui';

export type RightSidebarTab = 'inspector' | 'economy' | 'military' | 'diplomacy' | 'events';

export type UIState = {
  selection: UISelectionState;
  activePanel: PanelType;
  overlayMode: OverlayMode;
  cameraTarget: { x: number; y: number } | null;
  showSaveLoad: boolean;
  showSettings: boolean;
  showTechTree: boolean;
  showSquadPanel: boolean;
  showEconomyPanel: boolean;
  showFactionPanel: boolean;
  showDiplomacyPanel: boolean;
  showDungeonPanel: boolean;
  showEquipmentPanel: boolean;
  showSkillTreePanel: boolean;
  showRivalPanel: boolean;
  showScenarioPanel: boolean;
  zoom: number;
  directorMode: boolean;
  followSelected: boolean;
  rightSidebarTab: RightSidebarTab;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
};

interface UIStore extends UIState {
  selectEntity: (entityId: number | null, selectionType: string | null, x?: number, y?: number) => void;
  setPanel: (panel: PanelType) => void;
  setOverlay: (mode: OverlayMode) => void;
  setCameraTarget: (target: { x: number; y: number } | null) => void;
  toggleSaveLoad: () => void;
  toggleSettings: () => void;
  toggleTechTree: () => void;
  toggleSquadPanel: () => void;
  toggleEconomyPanel: () => void;
  toggleFactionPanel: () => void;
  toggleDiplomacyPanel: () => void;
  toggleDungeonPanel: () => void;
  toggleEquipmentPanel: () => void;
  toggleSkillTreePanel: () => void;
  toggleRivalPanel: () => void;
  toggleScenarioPanel: () => void;
  setZoom: (zoom: number) => void;
  toggleDirectorMode: () => void;
  toggleFollowSelected: () => void;
  setRightSidebarTab: (tab: RightSidebarTab) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarWidth: (w: number) => void;
  setRightSidebarWidth: (w: number) => void;
  reset: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selection: { entityId: null, selectionType: null },
  activePanel: 'inspector',
  overlayMode: 'none',
  cameraTarget: null,
  showSaveLoad: false,
  showSettings: false,
  showTechTree: false,
  showSquadPanel: false,
  showEconomyPanel: false,
  showFactionPanel: false,
  showDiplomacyPanel: false,
  showDungeonPanel: false,
  showEquipmentPanel: false,
  showSkillTreePanel: false,
  showRivalPanel: false,
  showScenarioPanel: false,
  zoom: 14,
  directorMode: true,
  followSelected: false,
  rightSidebarTab: 'inspector',
  leftSidebarCollapsed: false,
  rightSidebarCollapsed: false,
  leftSidebarWidth: 288,
  rightSidebarWidth: 288,

  selectEntity: (entityId, selectionType, x, y) =>
    set({ selection: { entityId, selectionType, x, y } }),

  setPanel: (panel) => set({ activePanel: panel }),
  setOverlay: (mode) => set({ overlayMode: mode }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  toggleSaveLoad: () => set((s) => ({ showSaveLoad: !s.showSaveLoad })),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  toggleTechTree: () => set((s) => ({ showTechTree: !s.showTechTree })),
  toggleSquadPanel: () => set((s) => ({ showSquadPanel: !s.showSquadPanel })),
  toggleEconomyPanel: () => set((s) => ({ showEconomyPanel: !s.showEconomyPanel })),
  toggleFactionPanel: () => set((s) => ({ showFactionPanel: !s.showFactionPanel })),
  toggleDiplomacyPanel: () => set((s) => ({ showDiplomacyPanel: !s.showDiplomacyPanel })),
  toggleDungeonPanel: () => set((s) => ({ showDungeonPanel: !s.showDungeonPanel })),
  toggleEquipmentPanel: () => set((s) => ({ showEquipmentPanel: !s.showEquipmentPanel })),
  toggleSkillTreePanel: () => set((s) => ({ showSkillTreePanel: !s.showSkillTreePanel })),
  toggleRivalPanel: () => set((s) => ({ showRivalPanel: !s.showRivalPanel })),
  toggleScenarioPanel: () => set((s) => ({ showScenarioPanel: !s.showScenarioPanel })),
  setZoom: (zoom) => set({ zoom }),
  toggleDirectorMode: () => set((s) => ({ directorMode: !s.directorMode })),
  toggleFollowSelected: () => set((s) => ({ followSelected: !s.followSelected })),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
  toggleLeftSidebar: () => set((s) => ({ leftSidebarCollapsed: !s.leftSidebarCollapsed })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarCollapsed: !s.rightSidebarCollapsed })),
  setLeftSidebarWidth: (w) => set({ leftSidebarWidth: Math.max(200, Math.min(480, w)) }),
  setRightSidebarWidth: (w) => set({ rightSidebarWidth: Math.max(200, Math.min(480, w)) }),
  reset: () => set({
    selection: { entityId: null, selectionType: null },
    activePanel: 'inspector',
    overlayMode: 'none',
    cameraTarget: null,
    showSaveLoad: false,
    showSettings: false,
    showTechTree: false,
    showSquadPanel: false,
    showEconomyPanel: false,
    showFactionPanel: false,
    showDiplomacyPanel: false,
    showDungeonPanel: false,
    showEquipmentPanel: false,
    showSkillTreePanel: false,
    showRivalPanel: false,
    showScenarioPanel: false,
    zoom: 14,
    directorMode: true,
    followSelected: false,
    rightSidebarTab: 'inspector',
    leftSidebarCollapsed: false,
    rightSidebarCollapsed: false,
    leftSidebarWidth: 288,
    rightSidebarWidth: 288,
  }),
}));
