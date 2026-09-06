import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 gap-3 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[rgba(128,90,213,0.28)] bg-[#9b5cff]/5" />
        <Icon className="w-6 h-6 text-[#9b5cff] relative z-10" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#f5c84b]">{title}</h3>
        {description && (
          <p className="text-[11px] text-[#eee8ff]/50 max-w-[220px] leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-[10px] font-mono uppercase text-[#9b5cff] hover:text-[#eee8ff] transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
