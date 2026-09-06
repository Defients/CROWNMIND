import { ZoomIn, ZoomOut, Crosshair, Locate, Clapperboard } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import type { PixiApp } from '../render/PixiApp';
export default function MapControls({ pixiApp }: { pixiApp: PixiApp | null }) {
  const director = useUIStore((s) => s.directorMode),
    follow = useUIStore((s) => s.followSelected),
    id = useUIStore((s) => s.selection.entityId);
  return (
    <div className="map-navigation" role="toolbar" aria-label="Map controls">
      <button disabled={!pixiApp} onClick={() => pixiApp?.camera.zoomOut()} aria-label="Zoom out">
        <ZoomOut size={17} />
      </button>
      <button disabled={!pixiApp} onClick={() => pixiApp?.camera.zoomIn()} aria-label="Zoom in">
        <ZoomIn size={17} />
      </button>
      <button
        disabled={!pixiApp}
        onClick={() => pixiApp?.recenter()}
        aria-label="Recenter on Pyahhold"
        title="Return to Pyahhold"
      >
        <Locate size={17} />
      </button>
      <button
        disabled={id == null}
        onClick={useUIStore.getState().toggleFollowSelected}
        aria-pressed={follow}
        aria-label="Follow selected"
        title="H · Follow selected"
      >
        <Crosshair size={17} />
        <span>Follow</span>
      </button>
      <button
        onClick={useUIStore.getState().toggleDirectorMode}
        aria-pressed={director}
        aria-label="Director mode"
        title="R · Director mode"
      >
        <Clapperboard size={17} />
        <span>Director</span>
      </button>
    </div>
  );
}
