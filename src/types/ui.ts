export interface UISelectionState {
  entityId: number | null;
  selectionType: string | null;
  x?: number;
  y?: number;
}

export type PanelType = 'inspector' | 'tech' | 'economy' | 'squad' | 'faction' | 'sovereign' | 'diplomacy' | 'dungeon' | 'equipment' | 'skill' | 'rival' | 'scenario';
export type OverlayMode = 'none' | 'threat' | 'bounties' | 'heroes' | 'fog' | 'resources' | 'sovereign' | 'diplomacy' | 'dungeons';

export interface UIState {
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
}

export interface SettingsState {
  graphicsQuality: 'low' | 'medium' | 'high';
  animationSpeed: number;
  autoSave: boolean;
  autoSaveInterval: number;
  keyBindings: Record<string, string>;
}
