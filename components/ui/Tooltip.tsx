'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionStyles: Record<NonNullable<TooltipProps['position']>, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<NonNullable<TooltipProps['position']>, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-navy-700',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-navy-700',
  left:   'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-navy-700',
  right:  'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-navy-700',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-[60] whitespace-nowrap rounded-md bg-navy-700 px-2.5 py-1.5',
            'text-xs text-slate-100 shadow-lg border border-[#1e2d5a] animate-fade-in',
            positionStyles[position],
            className,
          )}
        >
          {content}
          {/* Arrow */}
          <span
            className={cn(
              'absolute h-0 w-0 border-4',
              arrowStyles[position],
            )}
          />
        </span>
      )}
    </span>
  );
}

export default Tooltip;
