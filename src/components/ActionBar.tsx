import { Landmark, Swords, Globe2, Brain, ChevronUp, Compass } from 'lucide-react';
import { useUIStore, type Workspace } from '../stores/uiStore';

export const WORKSPACE_GROUPS: {
  name: string;
  icon: typeof Brain;
  items: { id: Workspace; label: string; hotkey: string }[];
}[] = [
  {
    name: 'Realm',
    icon: Landmark,
    items: [
      { id: 'economy', label: 'Economy', hotkey: 'E' },
      { id: 'tech', label: 'Technology', hotkey: 'T' },
      { id: 'scenario', label: 'Objectives', hotkey: 'J' },
    ],
  },
  {
    name: 'Forces',
    icon: Swords,
    items: [
      { id: 'squad', label: 'Squads', hotkey: 'S' },
      { id: 'equipment', label: 'Equipment', hotkey: 'Q' },
      { id: 'skill', label: 'Skills', hotkey: 'K' },
    ],
  },
  {
    name: 'World',
    icon: Globe2,
    items: [
      { id: 'faction', label: 'Factions', hotkey: 'F' },
      { id: 'diplomacy', label: 'Diplomacy', hotkey: 'D' },
      { id: 'dungeon', label: 'Dungeons', hotkey: 'G' },
      { id: 'rival', label: 'Rivals', hotkey: 'V' },
    ],
  },
  {
    name: 'Mind',
    icon: Brain,
    items: [
      { id: 'sovereign', label: 'Cognition', hotkey: 'C' },
      { id: 'events', label: 'Chronicle', hotkey: 'L' },
    ],
  },
];
export default function ActionBar() {
  const workspace = useUIStore((s) => s.workspace);
  return (
    <nav className="command-dock" aria-label="Strategic workspaces">
      <button
        className="roster-control"
        aria-pressed={workspace === 'inspector'}
        onClick={() =>
          useUIStore.getState().openWorkspace(workspace === 'inspector' ? null : 'inspector')
        }
      >
        <Compass size={18} />
        <span>Inspect realm</span>
      </button>
      {WORKSPACE_GROUPS.map((group) => (
        <div className="command-group" key={group.name}>
          <span className="command-group-name">
            <group.icon size={14} />
            {group.name}
          </span>
          <div>
            {group.items.map((item) => (
              <button
                key={item.id}
                aria-pressed={workspace === item.id}
                title={`${item.label} (${item.hotkey})`}
                onClick={() =>
                  useUIStore.getState().openWorkspace(workspace === item.id ? null : item.id)
                }
              >
                {item.label}
                <kbd>{item.hotkey}</kbd>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="dock-hint">
        <ChevronUp size={14} />
        <span>Explore. Observe. Understand.</span>
      </div>
    </nav>
  );
}
