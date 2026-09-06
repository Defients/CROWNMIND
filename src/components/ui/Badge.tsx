import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  text: string;
  icon?: LucideIcon;
  color?: 'gold' | 'violet' | 'cyan' | 'green' | 'danger' | 'warning' | 'sky' | 'muted';
  className?: string;
}

const colorMap: Record<string, string> = {
  gold: 'border-[#f5c84b]/30 bg-[#f5c84b]/5 text-[#f5c84b]',
  violet: 'border-[#9b5cff]/30 bg-[#9b5cff]/5 text-[#9b5cff]',
  cyan: 'border-[#26f4ff]/30 bg-[#26f4ff]/5 text-[#26f4ff]',
  green: 'border-[#38e68b]/30 bg-[#38e68b]/5 text-[#38e68b]',
  danger: 'border-[#ff4d6d]/30 bg-[#ff4d6d]/5 text-[#ff4d6d]',
  warning: 'border-[#ffb84d]/30 bg-[#ffb84d]/5 text-[#ffb84d]',
  sky: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
  muted: 'border-[rgba(128,90,213,0.28)] bg-[#1a1028] text-[#eee8ff]/60',
};

export default function Badge({ text, icon: Icon, color = 'muted', className = '' }: BadgeProps) {
  return (
    <span
      role="status"
      aria-label={text}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colorMap[color] || colorMap.muted} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
      {text}
    </span>
  );
}
