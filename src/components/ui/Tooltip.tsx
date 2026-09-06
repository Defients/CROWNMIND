import React, { useState, useId } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const sideClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

export default function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const id = useId();

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span aria-describedby={show ? id : undefined}>{children}</span>
      {show && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-[200] px-2 py-1 rounded-md bg-[#07040d] border border-[rgba(128,90,213,0.28)] text-[10px] font-mono text-[#eee8ff]/80 whitespace-nowrap pointer-events-none ${sideClasses[side]}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
