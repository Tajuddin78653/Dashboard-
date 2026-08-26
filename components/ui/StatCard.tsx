import { cn } from '@/lib/utils';
import { ElementType } from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ElementType;
  delta?: number;
  deltaLabel?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  accent = false,
  className,
}: StatCardProps) {
  const isPositive = delta !== undefined && delta >= 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div
      className={cn(
        'rounded-lg border border-[#1e2d5a] bg-navy-900 p-4 flex flex-col gap-3',
        accent && 'card-accent-gold',
        className,
      )}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#4a5a8a]">
          {label}
        </span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-500/10 border border-gold-500/20">
            <Icon className="h-4 w-4 text-gold-500" />
          </span>
        )}
      </div>

      {/* Value */}
      <p className="font-mono text-2xl font-bold text-white leading-none tracking-tight">
        {value}
      </p>

      {/* Delta */}
      {delta !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive && (
            <TrendingUpIcon className="h-3.5 w-3.5 text-success flex-shrink-0" />
          )}
          {isNegative && (
            <TrendingDownIcon className="h-3.5 w-3.5 text-danger flex-shrink-0" />
          )}
          <span
            className={cn(
              'text-xs font-semibold font-mono',
              isPositive && 'text-success',
              isNegative && 'text-danger',
            )}
          >
            {isPositive ? '+' : ''}
            {delta.toFixed(2)}%
          </span>
          {deltaLabel && (
            <span className="text-xs text-[#4a5a8a]">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
