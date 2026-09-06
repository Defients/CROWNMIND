import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { PixiApp } from '../render/PixiApp';
import HudBar from './HudBar';
import SovereignMindPanel from './SovereignMindPanel';
import RightSidebar from './RightSidebar';
import TechTreePanel from './TechTreePanel';
import ScenarioPanel from './ScenarioPanel';
import MapOverlayControls from './MapOverlayControls';
import MapControls from './MapControls';
import ActionBar from './ActionBar';

export default function GameScreen() {
  const state = useGameStore((s) => s.state);
  const speed = useGameStore((s) => s.speed);
  const tick = useGameStore((s) => s.tick);
  const showTechTree = useUIStore((s) => s.showTechTree);
  const showScenarioPanel = useUIStore((s) => s.showScenarioPanel);
  const overlayMode = useUIStore((s) => s.overlayMode);
  const followSelected = useUIStore((s) => s.followSelected);
  const selection = useUIStore((s) => s.selection);
  const leftCollapsed = useUIStore((s) => s.leftSidebarCollapsed);
  const rightCollapsed = useUIStore((s) => s.rightSidebarCollapsed);
  const leftWidth = useUIStore((s) => s.leftSidebarWidth);
  const rightWidth = useUIStore((s) => s.rightSidebarWidth);
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);
  const setLeftSidebarWidth = useUIStore((s) => s.setLeftSidebarWidth);
  const setRightSidebarWidth = useUIStore((s) => s.setRightSidebarWidth);

  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const initGuardRef = useRef(false);
  const pixiAppRef = useRef<PixiApp | null>(null);
  const [pixiApp, setPixiApp] = useState<PixiApp | null>(null);

  useEffect(() => {
    if (!pixiContainerRef.current || initGuardRef.current) return;
    initGuardRef.current = true;

    const container = pixiContainerRef.current;
    const app = new PixiApp();
    pixiAppRef.current = app;
    app.init(container).then(() => {
      setPixiApp(app);
      const currentState = useGameStore.getState().state;
      if (currentState) {
        app.render(currentState, useUIStore.getState());
      }
    }).catch((err) => {
      console.error('PixiApp init failed:', err);
    });

    return () => {
      // In StrictMode, this cleanup fires immediately after mount, then re-mounts.
      // We don't destroy the app here — it's destroyed when the component truly unmounts
      // (navigating back to setup) via the separate unmount effect below.
    };
  }, []);

  // Destroy PixiApp on real unmount (component removed from DOM)
  useEffect(() => {
    return () => {
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (speed === 0) return;
    const interval = setInterval(() => {
      tick();
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [speed, tick]);

  useEffect(() => {
    if (!pixiApp || !state) return;
    const uiState = useUIStore.getState();
    pixiApp.render(state, uiState);
  }, [state, overlayMode, pixiApp]);

  useEffect(() => {
    if (!pixiApp) return;
    if (followSelected && selection.entityId != null && selection.x != null && selection.y != null) {
      pixiApp.camera.follow({ x: selection.x, y: selection.y });
    } else {
      pixiApp.camera.follow(null);
    }
  }, [pixiApp, followSelected, selection]);

  const resizeRef = useRef<{ side: 'left' | 'right' | null; startX: number; startW: number }>({ side: null, startX: 0, startW: 0 });

  const onResizeStart = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = {
      side,
      startX: e.clientX,
      startW: side === 'left' ? leftWidth : rightWidth,
    };
  }, [leftWidth, rightWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = resizeRef.current;
      if (!r.side) return;
      const delta = e.clientX - r.startX;
      if (r.side === 'left') {
        setLeftSidebarWidth(r.startW + delta);
      } else {
        setRightSidebarWidth(r.startW - delta);
      }
    };
    const onUp = () => { resizeRef.current.side = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setLeftSidebarWidth, setRightSidebarWidth]);

  if (!state) return null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07040d] overflow-hidden font-sans text-[#eee8ff]">
      <div className="p-2 flex-shrink-0 safe-top safe-left safe-right">
        <HudBar state={state} />
      </div>

      <div className="flex-1 flex gap-2 px-2 pb-2 min-h-0 sidebar-desktop">
        {/* Left sidebar */}
        {!leftCollapsed && (
          <>
            <div className="flex flex-col gap-2 flex-shrink-0 overflow-y-auto custom-scrollbar sidebar-left" style={{ width: leftWidth }}>
              <SovereignMindPanel mind={state.sovereignMind} botName="Klÿ-Sovereign" />
              {showTechTree && <TechTreePanel state={state} />}
              {showScenarioPanel && <ScenarioPanel />}
            </div>
            <div
              className="w-1 cursor-col-resize flex-shrink-0 bg-[rgba(128,90,213,0.1)] hover:bg-[rgba(128,90,213,0.3)] transition-colors"
              onMouseDown={onResizeStart('left')}
            />
          </>
        )}
        {leftCollapsed && (
          <button
            onClick={toggleLeftSidebar}
            className="w-6 flex-shrink-0 flex items-center justify-center text-[#9b5cff] hover:text-[#eee8ff] transition-colors"
            title="Expand left panel"
          >
            <span className="text-xs rotate-180" style={{ writingMode: 'vertical-rl' }}>Sovereign</span>
          </button>
        )}

        <div className="flex-1 relative min-w-0">
          <div ref={pixiContainerRef} className="w-full h-full rounded-xl overflow-hidden border border-[rgba(128,90,213,0.18)]" />
          <MapOverlayControls />
          <MapControls pixiApp={pixiApp} />
        </div>

        {/* Right sidebar */}
        {rightCollapsed && (
          <button
            onClick={toggleRightSidebar}
            className="w-6 flex-shrink-0 flex items-center justify-center text-[#9b5cff] hover:text-[#eee8ff] transition-colors"
            title="Expand right panel"
          >
            <span className="text-xs" style={{ writingMode: 'vertical-rl' }}>Panels</span>
          </button>
        )}
        {!rightCollapsed && (
          <>
            <div
              className="w-1 cursor-col-resize flex-shrink-0 bg-[rgba(128,90,213,0.1)] hover:bg-[rgba(128,90,213,0.3)] transition-colors"
              onMouseDown={onResizeStart('right')}
            />
            <div className="flex flex-col flex-shrink-0 min-h-0" style={{ width: rightWidth }}>
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={toggleRightSidebar}
                  className="text-[10px] font-mono uppercase text-[#9b5cff] hover:text-[#eee8ff] transition-colors"
                >
                  Collapse
                </button>
              </div>
              <RightSidebar state={state} />
            </div>
          </>
        )}
      </div>

      <div className="px-2 pb-2 flex-shrink-0 safe-bottom safe-left safe-right">
        <ActionBar />
      </div>
    </div>
  );
}
