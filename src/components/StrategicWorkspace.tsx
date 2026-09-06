import { lazy, Suspense } from 'react';
import type { GameState } from '../types/game';
import { useUIStore } from '../stores/uiStore';
import Modal from './ui/Modal';
import SovereignMindPanel from './SovereignMindPanel';
import { WORKSPACE_GROUPS } from './ActionBar';
const EconomyPanel = lazy(() => import('./EconomyPanel'));
const TechTreePanel = lazy(() => import('./TechTreePanel'));
const ScenarioPanel = lazy(() => import('./ScenarioPanel'));
const SquadPanel = lazy(() => import('./SquadPanel'));
const EquipmentPanel = lazy(() => import('./EquipmentPanel'));
const SkillTreePanel = lazy(() => import('./SkillTreePanel'));
const FactionPanel = lazy(() => import('./FactionPanel'));
const DiplomacyPanel = lazy(() => import('./DiplomacyPanel'));
const DungeonPanel = lazy(() => import('./DungeonPanel'));
const RivalPanel = lazy(() => import('./RivalPanel'));
const EventLogPanel = lazy(() => import('./EventLogPanel'));

export default function StrategicWorkspace({ state }: { state: GameState }) {
  const workspace = useUIStore((s) => s.workspace),
    close = useUIStore((s) => s.closeWorkspace);
  const open = workspace != null && workspace !== 'inspector';
  const group = WORKSPACE_GROUPS.find((g) => g.items.some((i) => i.id === workspace));
  const item = group?.items.find((i) => i.id === workspace);
  return (
    <Modal
      open={open}
      onClose={close}
      title={`${group?.name ?? 'Realm'} / ${item?.label ?? 'Workspace'}`}
      size="xl"
      className="strategic-workspace"
    >
      <nav className="workspace-tabs" aria-label={`${group?.name} workspaces`}>
        {group?.items.map((i) => (
          <button
            key={i.id}
            aria-pressed={workspace === i.id}
            onClick={() => useUIStore.getState().openWorkspace(i.id)}
          >
            {i.label}
            <kbd>{i.hotkey}</kbd>
          </button>
        ))}
      </nav>
      <Suspense fallback={<p className="workspace-loading">Opening the instrument…</p>}>
        {workspace === 'sovereign' && (
          <SovereignMindPanel mind={state.sovereignMind} botName="Klÿ-Sovereign" />
        )}
        {workspace === 'economy' && <EconomyPanel />}
        {workspace === 'tech' && <TechTreePanel state={state} />}
        {workspace === 'scenario' && <ScenarioPanel />}
        {workspace === 'squad' && <SquadPanel />}
        {workspace === 'equipment' && <EquipmentPanel />}
        {workspace === 'skill' && <SkillTreePanel />}
        {workspace === 'faction' && <FactionPanel />}
        {workspace === 'diplomacy' && <DiplomacyPanel />}
        {workspace === 'dungeon' && <DungeonPanel />}
        {workspace === 'rival' && <RivalPanel />}
        {workspace === 'events' && (
          <EventLogPanel logs={state.logs} milestones={state.milestones} />
        )}
      </Suspense>
    </Modal>
  );
}
