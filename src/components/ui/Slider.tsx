import React, { useId } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  valueSuffix?: string;
  disabled?: boolean;
  className?: string;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueSuffix = '',
  disabled = false,
  className = '',
}: SliderProps) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[10px] font-mono uppercase text-[#eee8ff]/60">
          {label}
        </label>
        <span className="text-[10px] font-mono font-bold text-[#f5c84b]">
          {value}{valueSuffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className={`w-full accent-[#9b5cff] ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      />
    </div>
  );
}
