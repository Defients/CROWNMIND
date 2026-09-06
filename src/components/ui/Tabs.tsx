import React, { useState, useId, useCallback } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ items, activeKey, onChange, className = '' }: TabsProps) {
  const idBase = useId();
  const [focusedIndex, setFocusedIndex] = useState(() =>
    Math.max(0, items.findIndex((i) => i.key === activeKey))
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const count = items.length;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (focusedIndex + 1) % count;
        setFocusedIndex(next);
        onChange(items[next].key);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (focusedIndex - 1 + count) % count;
        setFocusedIndex(prev);
        onChange(items[prev].key);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
        onChange(items[0].key);
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = count - 1;
        setFocusedIndex(last);
        onChange(items[last].key);
      }
    },
    [focusedIndex, items, onChange]
  );

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-0.5 overflow-x-auto custom-scrollbar ${className}`}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, i) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            id={`${idBase}-tab-${item.key}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              setFocusedIndex(i);
              onChange(item.key);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-[#9b5cff]/20 border-[#9b5cff]/50 text-[#9b5cff]'
                : 'bg-transparent border-transparent text-[#eee8ff]/40 hover:text-[#eee8ff]/70'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
