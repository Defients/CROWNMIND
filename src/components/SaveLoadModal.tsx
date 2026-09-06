import React, { useState, useEffect, useCallback } from 'react';
import { Save, Upload, Trash2, Calendar, Clock, HardDrive, AlertCircle } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Tabs from './ui/Tabs';
import EmptyState from './ui/EmptyState';
import { SkeletonCard } from './ui/SkeletonLoader';
import { useUIStore } from '../stores/uiStore';
import { useSaveStore } from '../stores/saveStore';
import { useGameStore } from '../stores/gameStore';
import { useToast } from '../stores/toastStore';
import { serializeSave, deserializeSave } from '../persistence/SaveSerializer';
import type { SaveData } from '../types/game';

export default function SaveLoadModal() {
  const showSaveLoad = useUIStore((s) => s.showSaveLoad);
  const toggleSaveLoad = useUIStore((s) => s.toggleSaveLoad);
  const { saves, loading, error, refreshSaves, save: saveGame, load: loadGame, deleteSave } = useSaveStore();
  const gameState = useGameStore((s) => s.state);
  const loadGameState = useGameStore((s) => s.loadGame);
  const toast = useToast();

  const [tab, setTab] = useState<'save' | 'load'>('save');
  const [saveName, setSaveName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (showSaveLoad) {
      refreshSaves();
      setSaveName(`Day ${gameState?.day ?? 0} - ${new Date().toLocaleDateString()}`);
    }
  }, [showSaveLoad, refreshSaves, gameState?.day]);

  const handleSave = useCallback(async () => {
    if (!gameState) return;
    if (!saveName.trim()) {
      toast.error('Please enter a save name');
      return;
    }
    try {
      const data = serializeSave(gameState, saveName.trim());
      await saveGame(data);
      toast.success(`Saved "${saveName.trim()}"`);
      setSaveName('');
    } catch (e) {
      toast.error('Failed to save game');
    }
  }, [gameState, saveName, saveGame, toast]);

  const handleLoad = useCallback(async (id: string) => {
    try {
      const data = await loadGame(id);
      if (data) {
        loadGameState(deserializeSave(data));
        toast.success(`Loaded "${data.name}"`);
        toggleSaveLoad();
      } else {
        toast.error('Save not found');
      }
    } catch (e) {
      toast.error('Failed to load game');
    }
  }, [loadGame, loadGameState, toast, toggleSaveLoad]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteSave(id);
      toast.info('Save deleted');
      setConfirmDelete(null);
    } catch (e) {
      toast.error('Failed to delete save');
    }
  }, [deleteSave, toast]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal open={showSaveLoad} onClose={toggleSaveLoad} title="Save & Load" size="md">
      <div className="flex flex-col gap-4">
        <Tabs
          items={[
            { key: 'save', label: 'Save' },
            { key: 'load', label: 'Load' },
          ]}
          activeKey={tab}
          onChange={(k) => setTab(k as 'save' | 'load')}
        />

        {tab === 'save' && (
          <div className="flex flex-col gap-3">
            {!gameState ? (
              <EmptyState
                icon={AlertCircle}
                title="No Active Game"
                description="Start a game before saving."
              />
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="save-name" className="text-[10px] font-mono uppercase text-[#eee8ff]/60">
                    Save Name
                  </label>
                  <input
                    id="save-name"
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="px-3 py-2 rounded-lg bg-[#07040d] border border-[rgba(128,90,213,0.28)] text-xs font-mono text-[#eee8ff] focus:border-[#9b5cff]/50 outline-none"
                    placeholder="Enter save name..."
                    maxLength={50}
                  />
                </div>
                <Button variant="primary" fullWidth icon={Save} onClick={handleSave}>
                  Save Game
                </Button>
              </>
            )}
          </div>
        )}

        {tab === 'load' && (
          <div className="flex flex-col gap-2">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ff4d6d]/5 border border-[#ff4d6d]/30 text-[#ff4d6d] text-[10px] font-mono">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-2">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : saves.length === 0 ? (
              <EmptyState
                icon={HardDrive}
                title="No Saves Found"
                description="Saved games will appear here."
              />
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {saves.map((save: SaveData) => (
                  <div
                    key={save.version}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#07040d] border border-[rgba(128,90,213,0.18)] hover:border-[#9b5cff]/30 transition-colors"
                  >
                    <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                      <span className="text-xs font-mono text-[#eee8ff] truncate">{save.name}</span>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-[#eee8ff]/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDate(save.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Day {save.state?.day ?? '?'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {confirmDelete === String(save.version) ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(String(save.version))}
                            className="px-2 py-1 rounded-md bg-[#ff4d6d]/20 border border-[#ff4d6d]/40 text-[#ff4d6d] text-[9px] font-mono uppercase hover:bg-[#ff4d6d]/30"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded-md bg-[#1a1028] border border-[rgba(128,90,213,0.28)] text-[#eee8ff]/60 text-[9px] font-mono uppercase hover:text-[#eee8ff]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleLoad(String(save.version))}
                            aria-label={`Load ${save.name}`}
                            className="p-1.5 rounded-md bg-[#9b5cff]/10 border border-[#9b5cff]/30 text-[#9b5cff] hover:bg-[#9b5cff]/20 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(String(save.version))}
                            aria-label={`Delete ${save.name}`}
                            className="p-1.5 rounded-md bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 text-[#ff4d6d] hover:bg-[#ff4d6d]/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
