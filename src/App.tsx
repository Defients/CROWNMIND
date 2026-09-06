import React from 'react';
import { useGameStore } from './stores/gameStore';
import GameSetupScreen from './components/GameSetupScreen';
import GameScreen from './components/GameScreen';
import RunReportOverlay from './components/RunReportOverlay';
import ToastProvider from './components/ToastProvider';
import SettingsModal from './components/SettingsModal';
import SaveLoadModal from './components/SaveLoadModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const gameState = useGameStore((s) => s.state);
  const status = useGameStore((s) => s.status);
  const resetToSetup = useGameStore((s) => s.resetToSetup);

  useKeyboardShortcuts();

  if (status === 'setup' || !gameState) {
    return (
      <>
        <GameSetupScreen />
        <ToastProvider />
      </>
    );
  }

  if (status === 'won' || status === 'lost') {
    return (
      <>
        <GameScreen />
        <RunReportOverlay
          report={status === 'won' ? gameState.winReport : gameState.lossReport}
          isWin={status === 'won'}
          onRestart={resetToSetup}
          seedString={gameState.config.seedString}
        />
        <ToastProvider />
        <SettingsModal />
        <SaveLoadModal />
      </>
    );
  }

  return (
    <>
      <GameScreen />
      <ToastProvider />
      <SettingsModal />
      <SaveLoadModal />
    </>
  );
}
