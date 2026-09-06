import React from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ lines = 3, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-md"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#120b1c] border border-[rgba(128,90,213,0.18)] rounded-xl p-3 flex flex-col gap-2 ${className}`} aria-hidden="true">
      <div className="skeleton h-4 w-24 rounded-md" />
      <div className="skeleton h-3 w-full rounded-md" />
      <div className="skeleton h-3 w-3/4 rounded-md" />
    </div>
  );
}
