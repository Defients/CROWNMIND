import React from 'react';

interface ProgressMeterProps {
  label: string;
  value: number;
  max?: number;
  colorThresholds?: { low: string; mid: string; high: string };
  invertColors?: boolean;
  showValue?: boolean;
  valueSuffix?: string;
  className?: string;
}

export default function ProgressMeter({
  label,
  value,
  max = 100,
  colorThresholds,
  invertColors = false,
  showValue = true,
  valueSuffix = '',
  className = '',
}: ProgressMeterProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const defaultColors = { low: 'bg-[#38e68b]', mid: 'bg-[#ffb84d]', high: 'bg-[#ff4d6d]' };
  const colors = colorThresholds || defaultColors;

  let barColor = colors.low;
  if (invertColors) {
    if (pct > 70) barColor = colors.high;
    else if (pct > 40) barColor = colors.mid;
  } else {
    if (pct > 70) barColor = colors.low;
    else if (pct > 40) barColor = colors.mid;
    else barColor = colors.high;
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#eee8ff]/60 uppercase">{label}</span>
        {showValue && (
          <span className="font-bold text-[#eee8ff]">
            {Math.round(value)}{valueSuffix}
          </span>
        )}
      </div>
      <div
        className="w-full bg-[#07040d] h-1.5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
