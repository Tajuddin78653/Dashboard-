import { cn } from '@/lib/utils';
import { InboxIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-4 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 border border-[#1e2d5a]">
        <InboxIcon className="h-6 w-6 text-[#4a5a8a]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {description && (
          <p className="text-xs text-[#4a5a8a]">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
