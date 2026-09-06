import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function IconButton({ icon: Icon, onClick, title, active = false, disabled = false, className = '', id }: IconButtonProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`p-1.5 rounded-md border transition-all cursor-pointer ${
        disabled
          ? 'border-[rgba(128,90,213,0.15)] text-[#eee8ff]/20 cursor-not-allowed'
          : active
          ? 'border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#9b5cff] glow-violet'
          : 'border-[rgba(128,90,213,0.28)] bg-[#1a1028] text-[#eee8ff]/60 hover:text-[#eee8ff] hover:border-[#9b5cff]/40'
      } ${className}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  );
}
