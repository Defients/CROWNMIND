import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, Zap, Save, Keyboard } from 'lucide-react';
import Modal from './ui/Modal';
import Toggle from './ui/Toggle';
import Slider from './ui/Slider';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useToast } from '../stores/toastStore';
import type { SettingsState } from '../types/ui';

const DEFAULT_SETTINGS: SettingsState = {
  graphicsQuality: 'high',
  animationSpeed: 1,
  autoSave: false,
  autoSaveInterval: 30,
  keyBindings: {
    pause: 'Space',
    speed1: '1',
    speed2: '2',
    speed4: '4',
    techTree: 'T',
    squad: 'S',
    economy: 'E',
    faction: 'F',
    directorMode: 'R',
    followSelected: 'H',
    closeOverlay: 'Escape',
  },
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem('astrizda-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: SettingsState): void {
  try {
    localStorage.setItem('astrizda-settings', JSON.stringify(settings));
  } catch {}
}

export function getSettings(): SettingsState {
  return loadSettings();
}

export default function SettingsModal() {
  const showSettings = useUIStore((s) => s.showSettings);
  const toggleSettings = useUIStore((s) => s.toggleSettings);
  const toast = useToast();

  const [settings, setSettings] = useState<SettingsState>(loadSettings);

  useEffect(() => {
    const saved = loadSettings();
    useSettingsStore
      .getState()
      .setGraphicsQuality(
        ['low', 'medium', 'high'].includes(saved.graphicsQuality) ? saved.graphicsQuality : 'medium'
      );
    useSettingsStore
      .getState()
      .setAnimationSpeed(
        Number.isFinite(saved.animationSpeed) ? Math.max(0.5, Math.min(3, saved.animationSpeed)) : 1
      );
  }, []);

  useEffect(() => {
    if (showSettings) {
      setSettings(loadSettings());
    }
  }, [showSettings]);

  const handleSave = () => {
    saveSettings(settings);
    useSettingsStore.getState().setGraphicsQuality(settings.graphicsQuality);
    useSettingsStore.getState().setAnimationSpeed(settings.animationSpeed);
    toast.success('Settings saved');
    toggleSettings();
  };

  const qualityOptions: { value: 'low' | 'medium' | 'high'; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <Modal open={showSettings} onClose={toggleSettings} title="Settings" size="md">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <SectionHeader title="Graphics Quality" icon={Monitor} color="text-[#26f4ff]" />
          <div className="flex gap-1.5" role="radiogroup" aria-label="Graphics quality">
            {qualityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={settings.graphicsQuality === opt.value}
                onClick={() => setSettings((s) => ({ ...s, graphicsQuality: opt.value }))}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                  settings.graphicsQuality === opt.value
                    ? 'border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#eee8ff]'
                    : 'border-[rgba(128,90,213,0.18)] bg-[#07040d] text-[#eee8ff]/50 hover:text-[#eee8ff]/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionHeader title="Animation Speed" icon={Zap} color="text-[#f5c84b]" />
          <Slider
            label="Speed Multiplier"
            value={settings.animationSpeed}
            min={0.5}
            max={3}
            step={0.5}
            onChange={(v) => setSettings((s) => ({ ...s, animationSpeed: v }))}
            valueSuffix="x"
          />
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader title="Auto-Save" icon={Save} color="text-[#38e68b]" />
          <Toggle
            label="Enable Auto-Save"
            description="Automatically save game at regular intervals"
            checked={settings.autoSave}
            onChange={(v) => setSettings((s) => ({ ...s, autoSave: v }))}
          />
          {settings.autoSave && (
            <Slider
              label="Interval"
              value={settings.autoSaveInterval}
              min={10}
              max={120}
              step={10}
              onChange={(v) => setSettings((s) => ({ ...s, autoSaveInterval: v }))}
              valueSuffix="s"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <SectionHeader title="Keyboard Shortcuts" icon={Keyboard} color="text-[#9b5cff]" />
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            {Object.entries(settings.keyBindings).map(([action, key]) => (
              <div
                key={action}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#07040d] border border-[rgba(128,90,213,0.18)]"
              >
                <span className="text-[#eee8ff]/60 capitalize">
                  {action.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1a1028] border border-[rgba(128,90,213,0.28)] text-[#f5c84b] text-[9px]">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-[rgba(128,90,213,0.18)]">
          <Button variant="primary" size="md" fullWidth onClick={handleSave} icon={Save}>
            Save Settings
          </Button>
          <Button variant="ghost" size="md" onClick={toggleSettings}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
