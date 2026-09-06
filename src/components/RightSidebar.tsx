import React from 'react';
import { useUIStore, type RightSidebarTab } from '../stores/uiStore';
import type { GameState } from '../types/game';
import Tabs from './ui/Tabs';
import InspectorPanel from './InspectorPanel';
import EconomyPanel from './EconomyPanel';
import SquadPanel from './SquadPanel';
import EquipmentPanel from './EquipmentPanel';
import SkillTreePanel from './SkillTreePanel';
import FactionPanel from './FactionPanel';
import DiplomacyPanel from './DiplomacyPanel';
import DungeonPanel from './DungeonPanel';
import RivalPanel from './RivalPanel';
import EventLogPanel from './EventLogPanel';

interface RightSidebarProps {
  state: GameState;
}

const TAB_ITEMS = [
  { key: 'inspector', label: 'Inspect' },
  { key: 'economy', label: 'Econ' },
  { key: 'military', label: 'Army' },
  { key: 'diplomacy', label: 'Diplo' },
  { key: 'events', label: 'Log' },
];

export default function RightSidebar({ state }: RightSidebarProps) {
  const tab = useUIStore((s) => s.rightSidebarTab);
  const setTab = useUIStore((s) => s.setRightSidebarTab);
  const showSquadPanel = useUIStore((s) => s.showSquadPanel);
  const showEquipmentPanel = useUIStore((s) => s.showEquipmentPanel);
  const showSkillTreePanel = useUIStore((s) => s.showSkillTreePanel);
  const showFactionPanel = useUIStore((s) => s.showFactionPanel);
  const showDiplomacyPanel = useUIStore((s) => s.showDiplomacyPanel);
  const showDungeonPanel = useUIStore((s) => s.showDungeonPanel);
  const showRivalPanel = useUIStore((s) => s.showRivalPanel);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 mb-1">
        <Tabs
          items={TAB_ITEMS}
          activeKey={tab}
          onChange={(k) => setTab(k as RightSidebarTab)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
        {tab === 'inspector' && (
          <>
            <InspectorPanel
              state={state}
              onCastSpell={() => {}}
              onPlaceManualBounty={() => {}}
              gameMode={state.config.gameMode}
            />
            {showEquipmentPanel && <EquipmentPanel />}
            {showSkillTreePanel && <SkillTreePanel />}
          </>
        )}

        {tab === 'economy' && <EconomyPanel />}

        {tab === 'military' && (
          <>
            {showSquadPanel && <SquadPanel />}
            {showDungeonPanel && <DungeonPanel />}
          </>
        )}

        {tab === 'diplomacy' && (
          <>
            {showFactionPanel && <FactionPanel />}
            {showDiplomacyPanel && <DiplomacyPanel />}
            {showRivalPanel && <RivalPanel />}
          </>
        )}

        {tab === 'events' && (
          <EventLogPanel logs={state.logs} milestones={state.milestones} />
        )}
      </div>
    </div>
  );
}
