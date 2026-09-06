import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'gold' | 'violet' | 'cyan' | 'danger' | 'subtle' | 'none';
  id?: string;
  as?: 'div' | 'section' | 'aside' | 'article';
  ariaLabel?: string;
}

export default function Panel({ children, className = '', glow = 'subtle', id, as: Tag = 'div', ariaLabel }: PanelProps) {
  const glowClass = glow === 'none' ? '' : `glow-${glow}`;
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      className={`bg-[#120b1c] border border-[rgba(128,90,213,0.28)] rounded-xl ${glowClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
