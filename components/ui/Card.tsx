import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Shows a gold left-border accent */
  accent?: boolean;
}

export function Card({ children, className, accent = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#1e2d5a] bg-navy-900 p-4',
        accent && 'card-accent-gold',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
