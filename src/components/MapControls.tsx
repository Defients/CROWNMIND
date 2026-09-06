import React from 'react';
import { ZoomIn, ZoomOut, Crosshair, UserCheck, Locate } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import Tooltip from './ui/Tooltip';
import type { PixiApp } from '../render/PixiApp';

interface MapControlsProps {
  pixiApp: PixiApp | null;
}

export default function MapControls({ pixiApp }: MapControlsProps) {
  const directorMode = useUIStore((s) => s.directorMode);
  const toggleDirectorMode = useUIStore((s) => s.toggleDirectorMode);
  const followSelected = useUIStore((s) => s.followSelected);
  const toggleFollowSelected = useUIStore((s) => s.toggleFollowSelected);

  const handleZoomIn = () => pixiApp?.camera.zoomIn();
  const handleZoomOut = () => pixiApp?.camera.zoomOut();
  const handleRecenter = () => {
    if (pixiApp) {
      pixiApp.camera.panTo(0, 0);
      pixiApp.camera.follow(null);
    }
  };

  return (
    <div
      className="absolute bottom-2 right-2 z-20 flex flex-col gap-1 px-1.5 py-1.5 rounded-xl bg-[#07040d]/90 border border-[rgba(128,90,213,0.28)] backdrop-blur-md shadow-lg"
      role="toolbar"
      aria-label="Map controls"
    >
      <Tooltip content="Zoom In" side="left">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="p-1.5 rounded-lg text-[#eee8ff]/50 hover:text-[#eee8ff] hover:bg-[#1a1028] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content="Zoom Out" side="left">
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="p-1.5 rounded-lg text-[#eee8ff]/50 hover:text-[#eee8ff] hover:bg-[#1a1028] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>
      <div className="h-px bg-[rgba(128,90,213,0.18)] my-0.5" />
      <Tooltip content="Recenter Map" side="left">
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recenter map"
          className="p-1.5 rounded-lg text-[#eee8ff]/50 hover:text-[#eee8ff] hover:bg-[#1a1028] transition-colors"
        >
          <Locate className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content={followSelected ? 'Following Selected (On)' : 'Follow Selected (Off)'} side="left">
        <button
          type="button"
          onClick={toggleFollowSelected}
          aria-pressed={followSelected}
          aria-label="Toggle follow selected"
          className={`p-1.5 rounded-lg transition-colors ${
            followSelected
              ? 'bg-[#26f4ff]/20 text-[#26f4ff]'
              : 'text-[#eee8ff]/50 hover:text-[#eee8ff] hover:bg-[#1a1028]'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content={directorMode ? 'Director Mode (On)' : 'Director Mode (Off)'} side="left">
        <button
          type="button"
          onClick={toggleDirectorMode}
          aria-pressed={directorMode}
          aria-label="Toggle director mode"
          className={`p-1.5 rounded-lg transition-colors ${
            directorMode
              ? 'bg-[#9b5cff]/20 text-[#9b5cff]'
              : 'text-[#eee8ff]/50 hover:text-[#eee8ff] hover:bg-[#1a1028]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}
