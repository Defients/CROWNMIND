import React, { useId } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: ToggleProps) {
  const id = useId();
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex flex-col min-w-0">
        <label htmlFor={id} className="text-[11px] font-mono text-[#eee8ff]/80 cursor-pointer">
          {label}
        </label>
        {description && (
          <span className="text-[9px] text-[#eee8ff]/40 font-mono">{description}</span>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-[#9b5cff]/40' : 'bg-[#07040d] border border-[rgba(128,90,213,0.28)]'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-5 bg-[#9b5cff]' : 'translate-x-0.5 bg-[#eee8ff]/40'
          }`}
        />
      </button>
    </div>
  );
}
