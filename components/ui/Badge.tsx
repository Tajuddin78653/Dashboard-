import { cn } from '@/lib/utils';

export type BadgeStatus =
  | 'pending'
  | 'entered'
  | 'target-hit'
  | 'sl-hit'
  | 'trailing-sl-hit'
  | 'exited'
  | 'cancelled';

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig: Record<
  BadgeStatus,
  { label: string; dotColor: string; chipClass: string }
> = {
  pending: {
    label: 'PENDING',
    dotColor: 'bg-yellow-400',
    chipClass: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  },
  entered: {
    label: 'ENTERED',
    dotColor: 'bg-blue-400',
    chipClass: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  },
  'target-hit': {
    label: 'TARGET HIT',
    dotColor: 'bg-green-400',
    chipClass: 'bg-green-400/10 text-green-400 border-green-400/30',
  },
  'sl-hit': {
    label: 'SL HIT',
    dotColor: 'bg-red-400',
    chipClass: 'bg-red-400/10 text-red-400 border-red-400/30',
  },
  'trailing-sl-hit': {
    label: 'TRAIL SL HIT',
    dotColor: 'bg-emerald-400',
    chipClass: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  },
  exited: {
    label: 'EXITED',
    dotColor: 'bg-slate-400',
    chipClass: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
  },
  cancelled: {
    label: 'CANCELLED',
    dotColor: 'bg-slate-600',
    chipClass: 'bg-slate-600/10 text-slate-500 border-slate-600/30',
  },
};

export function Badge({ status, className }: BadgeProps) {
  // Graceful fallback for unknown statuses
  const config = statusConfig[status] ?? {
    label: status.toUpperCase().replace(/-/g, ' '),
    dotColor: 'bg-slate-400',
    chipClass: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
  };
  const { label, dotColor, chipClass } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider',
        chipClass,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dotColor)} />
      {label}
    </span>
  );
}

export default Badge;
