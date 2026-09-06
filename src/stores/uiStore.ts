import { create } from 'zustand';
import type { UISelectionState, PanelType, OverlayMode } from '../types/ui';

export type Workspace = PanelType | 'events';
const visibility = (workspace: Workspace | null) => ({
  showTechTree: workspace === 'tech',
  showSquadPanel: workspace === 'squad',
  showEconomyPanel: workspace === 'economy',
  showFactionPanel: workspace === 'faction',
  showDiplomacyPanel: workspace === 'diplomacy',
  showDungeonPanel: workspace === 'dungeon',
  showEquipmentPanel: workspace === 'equipment',
  showSkillTreePanel: workspace === 'skill',
  showRivalPanel: workspace === 'rival',
  showScenarioPanel: workspace === 'scenario',
});
const initial = {
  selection: { entityId: null, selectionType: null } as UISelectionState,
  activePanel: 'inspector' as PanelType,
  workspace: null as Workspace | null,
  overlayMode: 'none' as OverlayMode,
  cameraTarget: null as { x: number; y: number } | null,
  showSaveLoad: false,
  showSettings: false,
  ...visibility(null),
  zoom: 36,
  directorMode: true,
  followSelected: false,
};
export type UIState = typeof initial;
interface UIStore extends UIState {
  selectEntity: (id: number | null, type: string | null, x?: number, y?: number) => void;
  openWorkspace: (workspace: Workspace | null) => void;
  closeWorkspace: () => void;
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
  reset: () => void;
}
export const useUIStore = create<UIStore>((set, get) => {
  const open = (workspace: Workspace | null) => set({ workspace, ...visibility(workspace) });
  const toggle = (workspace: Workspace) => open(get().workspace === workspace ? null : workspace);
  return {
    ...initial,
    selectEntity: (entityId, selectionType, x, y) =>
      set({
        selection: { entityId, selectionType, x, y },
        workspace: selectionType ? 'inspector' : null,
        ...visibility(null),
        followSelected: false,
      }),
    openWorkspace: open,
    closeWorkspace: () => open(null),
    setPanel: (panel) => open(panel),
    setOverlay: (overlayMode) => set({ overlayMode }),
    setCameraTarget: (cameraTarget) => set({ cameraTarget }),
    toggleSaveLoad: () => set((s) => ({ showSaveLoad: !s.showSaveLoad })),
    toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
    toggleTechTree: () => toggle('tech'),
    toggleSquadPanel: () => toggle('squad'),
    toggleEconomyPanel: () => toggle('economy'),
    toggleFactionPanel: () => toggle('faction'),
    toggleDiplomacyPanel: () => toggle('diplomacy'),
    toggleDungeonPanel: () => toggle('dungeon'),
    toggleEquipmentPanel: () => toggle('equipment'),
    toggleSkillTreePanel: () => toggle('skill'),
    toggleRivalPanel: () => toggle('rival'),
    toggleScenarioPanel: () => toggle('scenario'),
    setZoom: (zoom) => set({ zoom }),
    toggleDirectorMode: () => set((s) => ({ directorMode: !s.directorMode })),
    toggleFollowSelected: () =>
      set((s) => ({ followSelected: s.selection.entityId != null && !s.followSelected })),
    reset: () => set({ ...initial, selection: { entityId: null, selectionType: null } }),
  };
});
