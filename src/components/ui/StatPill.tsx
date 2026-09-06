import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatPillProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: 'gold' | 'violet' | 'cyan' | 'green' | 'danger' | 'warning' | 'muted';
  className?: string;
}

const colorMap: Record<string, { text: string; border: string; bg: string; icon: string }> = {
  gold: { text: 'text-[#f5c84b]', border: 'border-[#f5c84b]/30', bg: 'bg-[#f5c84b]/5', icon: 'text-[#f5c84b]' },
  violet: { text: 'text-[#9b5cff]', border: 'border-[#9b5cff]/30', bg: 'bg-[#9b5cff]/5', icon: 'text-[#9b5cff]' },
  cyan: { text: 'text-[#26f4ff]', border: 'border-[#26f4ff]/30', bg: 'bg-[#26f4ff]/5', icon: 'text-[#26f4ff]' },
  green: { text: 'text-[#38e68b]', border: 'border-[#38e68b]/30', bg: 'bg-[#38e68b]/5', icon: 'text-[#38e68b]' },
  danger: { text: 'text-[#ff4d6d]', border: 'border-[#ff4d6d]/30', bg: 'bg-[#ff4d6d]/5', icon: 'text-[#ff4d6d]' },
  warning: { text: 'text-[#ffb84d]', border: 'border-[#ffb84d]/30', bg: 'bg-[#ffb84d]/5', icon: 'text-[#ffb84d]' },
  muted: { text: 'text-[#eee8ff]', border: 'border-[rgba(128,90,213,0.28)]', bg: 'bg-[#1a1028]', icon: 'text-[#eee8ff]/70' },
};

export default function StatPill({ icon: Icon, label, value, color = 'muted', className = '' }: StatPillProps) {
  const c = colorMap[color] || colorMap.muted;
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border ${c.border} ${c.bg} ${className}`} aria-label={`${label}: ${value}`}>
      <Icon className={`w-3.5 h-3.5 ${c.icon} flex-shrink-0`} aria-hidden="true" />
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-mono uppercase opacity-60">{label}</span>
        <span className={`text-sm font-mono font-bold ${c.text}`}>{value}</span>
      </div>
    </div>
  );
}
