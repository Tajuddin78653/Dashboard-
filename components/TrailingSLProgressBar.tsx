'use client';

import { cn } from '@/lib/utils';

interface TrailingSLProgressBarProps {
  entryPrice: number;
  currentPrice: number;
  targetPrice: number;
  initialSL: number;
  currentTrailingSL: number;
}

export function TrailingSLProgressBar({
  entryPrice,
  currentPrice,
  targetPrice,
  initialSL,
  currentTrailingSL,
}: TrailingSLProgressBarProps) {
  // Range is from initialSL to targetPrice
  const totalRange = Math.max(1, targetPrice - initialSL);

  // Position percentages
  const entryPct = Math.min(100, Math.max(0, ((entryPrice - initialSL) / totalRange) * 100));
  const tslPct = Math.min(100, Math.max(0, ((currentTrailingSL - initialSL) / totalRange) * 100));
  const currentPct = Math.min(100, Math.max(0, ((currentPrice - initialSL) / totalRange) * 100));

  const isTSLinProfit = currentTrailingSL >= entryPrice;

  return (
    <div className="w-full space-y-1.5 py-1">
      {/* Top Labels */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-rose-400">SL ₹{initialSL.toFixed(2)}</span>
        <span className={cn('font-semibold', isTSLinProfit ? 'text-emerald-400' : 'text-amber-400')}>
          TSL: ₹{currentTrailingSL.toFixed(2)} {isTSLinProfit && '🔒 (In Profit)'}
        </span>
        <span className="text-emerald-400">Target ₹{targetPrice.toFixed(2)}</span>
      </div>

      {/* Progress Track */}
      <div className="relative h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-visible">
        {/* Fill from Initial SL up to Current TSL (Protected Zone) */}
        <div
          className={cn(
            'absolute top-0 bottom-0 left-0 rounded-l-full opacity-60 transition-all duration-300',
            isTSLinProfit ? 'bg-emerald-500' : 'bg-amber-500'
          )}
          style={{ width: `${tslPct}%` }}
        />

        {/* Fill from TSL up to Current Price (Active Floating Zone) */}
        <div
          className="absolute top-0 bottom-0 bg-indigo-500/50 transition-all duration-300"
          style={{
            left: `${tslPct}%`,
            width: `${Math.max(0, currentPct - tslPct)}%`,
          }}
        />

        {/* Entry Price Marker */}
        <div
          className="absolute top-[-2px] bottom-[-2px] w-[2px] bg-slate-400 z-10"
          style={{ left: `${entryPct}%` }}
          title={`Entry: ₹${entryPrice.toFixed(2)}`}
        />

        {/* Current Trailing SL Marker */}
        <div
          className={cn(
            'absolute top-[-4px] h-4.5 w-1.5 rounded-full z-20 shadow-md transition-all duration-300',
            isTSLinProfit ? 'bg-emerald-400 ring-2 ring-emerald-500/50' : 'bg-amber-400 ring-2 ring-amber-500/50'
          )}
          style={{ left: `${tslPct}%` }}
          title={`Current Trailing Stop Loss: ₹${currentTrailingSL.toFixed(2)}`}
        />

        {/* Current Price Cursor */}
        <div
          className="absolute top-[-5px] h-5 w-2 rounded-full bg-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/50 z-30 transition-all duration-300 animate-pulse"
          style={{ left: `${currentPct}%` }}
          title={`Current Price: ₹${currentPrice.toFixed(2)}`}
        />
      </div>

      {/* Bottom Subtext */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>-Initial Risk</span>
        <span className="text-indigo-300 font-semibold">LTP: ₹{currentPrice.toFixed(2)}</span>
        <span>+Max Reward</span>
      </div>
    </div>
  );
}

export default TrailingSLProgressBar;
