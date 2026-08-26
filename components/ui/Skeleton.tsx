import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  /** Number of stacked skeleton lines to render */
  lines?: number;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded bg-navy-700',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:animate-[shimmer_1.5s_infinite]',
        className,
      )}
    />
  );
}

export function Skeleton({ className, lines }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            className={cn('h-4 w-full', i === lines - 1 && 'w-3/4', className)}
          />
        ))}
      </div>
    );
  }

  return <SkeletonLine className={cn('h-4 w-full', className)} />;
}

export default Skeleton;
