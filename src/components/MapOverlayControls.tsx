import { Eye } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import type { OverlayMode } from '../types/ui';
const modes: { mode: OverlayMode; label: string; legend: string }[] = [
  { mode: 'none', label: 'Natural view', legend: 'Click to inspect · drag to pan' },
  {
    mode: 'threat',
    label: 'Threat field',
    legend: 'Dashed areas: relative threat reach, not attack forecasts',
  },
  { mode: 'bounties', label: 'Sovereign bounties', legend: 'Gold diamonds: posted targets' },
  {
    mode: 'heroes',
    label: 'Hero intent',
    legend: 'Cyan traces: recorded movement paths · up to 8',
  },
  { mode: 'fog', label: 'Unobserved realm', legend: 'Hatching: unexplored terrain' },
  { mode: 'resources', label: 'Resource survey', legend: 'Diamonds: observed resource deposits' },
  {
    mode: 'sovereign',
    label: 'Sovereign perception',
    legend: 'Violet: chosen paths · gold hexagon: inferred name association',
  },
  {
    mode: 'diplomacy',
    label: 'Diplomatic field',
    legend: 'Hexagons: standing · green friendly, amber neutral, red hostile',
  },
  { mode: 'dungeons', label: 'Dungeon entrances', legend: 'Violet diamonds: observed entrances' },
];
export default function MapOverlayControls() {
  const mode = useUIStore((s) => s.overlayMode);
  return (
    <div className="observation-controls">
      <label>
        <Eye size={15} />
        <span className="sr-only">Map overlay</span>
        <select
          aria-label="Map overlay"
          value={mode}
          onChange={(e) => useUIStore.getState().setOverlay(e.target.value as OverlayMode)}
        >
          {modes.map((m) => (
            <option key={m.mode} value={m.mode}>
              {m.label}
            </option>
          ))}
        </select>
        <kbd>M</kbd>
      </label>
      <p>{modes.find((m) => m.mode === mode)?.legend}</p>
    </div>
  );
}
