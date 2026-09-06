import React from 'react';
import { Eye, Skull, Coins, Swords, Cloud, Package, Brain, Ban } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import type { OverlayMode } from '../types/ui';
import Tooltip from './ui/Tooltip';

const overlayModes: { mode: OverlayMode; label: string; icon: typeof Eye }[] = [
  { mode: 'none', label: 'None', icon: Ban },
  { mode: 'threat', label: 'Threat', icon: Skull },
  { mode: 'bounties', label: 'Bounties', icon: Coins },
  { mode: 'heroes', label: 'Heroes', icon: Swords },
  { mode: 'fog', label: 'Fog', icon: Cloud },
  { mode: 'resources', label: 'Resources', icon: Package },
  { mode: 'sovereign', label: 'Sovereign', icon: Brain },
];

export default function MapOverlayControls() {
  const overlayMode = useUIStore((s) => s.overlayMode);
  const setOverlay = useUIStore((s) => s.setOverlay);

  return (
    <div
      className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-[#07040d]/90 border border-[rgba(128,90,213,0.28)] backdrop-blur-md shadow-lg"
      role="toolbar"
      aria-label="Map overlay modes"
    >
      {overlayModes.map(({ mode, label, icon: Icon }) => {
        const isActive = overlayMode === mode;
        return (
          <Tooltip key={mode} content={label} side="bottom">
            <button
              type="button"
              onClick={() => setOverlay(mode)}
              aria-pressed={isActive}
              aria-label={`${label} overlay`}
              className={`p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#9b5cff]/20 text-[#9b5cff]'
                  : 'text-[#eee8ff]/40 hover:text-[#eee8ff]/70 hover:bg-[#1a1028]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
