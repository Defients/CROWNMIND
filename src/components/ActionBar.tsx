import { useEffect } from 'react';
import { Beaker, Users2, BarChart3, Handshake, Castle, Sword, GitBranch, Crown, Target, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import Tooltip from './ui/Tooltip';

interface ActionButton {
  key: string;
  hotkey: string;
  label: string;
  icon: typeof Beaker;
  toggle: () => void;
  active: boolean;
  color: string;
}

export default function ActionBar() {
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
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);

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

  const buttons: ActionButton[] = [
    { key: 'tech', hotkey: 't', label: 'Tech Tree', icon: Beaker, toggle: toggleTechTree, active: showTechTree, color: '#9b5cff' },
    { key: 'squad', hotkey: 's', label: 'Squads', icon: Users2, toggle: toggleSquadPanel, active: showSquadPanel, color: '#26f4ff' },
    { key: 'econ', hotkey: 'e', label: 'Economy', icon: BarChart3, toggle: toggleEconomyPanel, active: showEconomyPanel, color: '#f5c84b' },
    { key: 'faction', hotkey: 'f', label: 'Factions', icon: Users2, toggle: toggleFactionPanel, active: showFactionPanel, color: '#9b5cff' },
    { key: 'diplo', hotkey: 'd', label: 'Diplomacy', icon: Handshake, toggle: toggleDiplomacyPanel, active: showDiplomacyPanel, color: '#50c878' },
    { key: 'dungeon', hotkey: 'g', label: 'Dungeons', icon: Castle, toggle: toggleDungeonPanel, active: showDungeonPanel, color: '#daa520' },
    { key: 'equip', hotkey: 'q', label: 'Equipment', icon: Sword, toggle: toggleEquipmentPanel, active: showEquipmentPanel, color: '#9b5cff' },
    { key: 'skill', hotkey: 'k', label: 'Skill Trees', icon: GitBranch, toggle: toggleSkillTreePanel, active: showSkillTreePanel, color: '#26f4ff' },
    { key: 'rival', hotkey: 'v', label: 'Rivals', icon: Crown, toggle: toggleRivalPanel, active: showRivalPanel, color: '#ff4d6d' },
    { key: 'scenario', hotkey: 'j', label: 'Scenario', icon: Target, toggle: toggleScenarioPanel, active: showScenarioPanel, color: '#50c878' },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toLowerCase();
      const btn = buttons.find((b) => b.hotkey === key);
      if (btn) {
        e.preventDefault();
        btn.toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [buttons]);

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-[#120b1c] border border-[rgba(128,90,213,0.28)] rounded-xl glow-subtle">
      {/* Sidebar toggles */}
      <Tooltip content="Toggle left sidebar" side="top">
        <button
          type="button"
          onClick={toggleLeftSidebar}
          aria-label="Toggle left sidebar"
          className="p-1.5 rounded-md border border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
        >
          <PanelLeftClose className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>

      <div className="w-px h-5 bg-[rgba(128,90,213,0.18)] flex-shrink-0" />

      {/* Panel buttons */}
      <div className="flex items-center gap-0.5 flex-1 justify-center">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <Tooltip key={btn.key} content={`${btn.label} (${btn.hotkey.toUpperCase()})`} side="top">
              <button
                type="button"
                onClick={btn.toggle}
                aria-pressed={btn.active}
                aria-label={`Toggle ${btn.label}`}
                className={`p-1.5 rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50 ${
                  btn.active
                    ? ''
                    : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]'
                }`}
                style={btn.active ? { borderColor: `${btn.color}66`, background: `${btn.color}1a`, color: btn.color } : undefined}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </Tooltip>
          );
        })}
      </div>

      <div className="w-px h-5 bg-[rgba(128,90,213,0.18)] flex-shrink-0" />

      <Tooltip content="Toggle right sidebar" side="top">
        <button
          type="button"
          onClick={toggleRightSidebar}
          aria-label="Toggle right sidebar"
          className="p-1.5 rounded-md border border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
        >
          <PanelRightClose className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}
