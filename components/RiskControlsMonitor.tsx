'use client';

import { ShieldCheck, ShieldAlert, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RiskControlsData {
  dailyLossLimit: number;
  currentLossUsed: number;
  maxTradesPerDay: number;
  tradesCompletedToday: number;
  maxConcurrentPositions: number;
  currentOpenPositions: number;
  autoSquareOffTime: string; // e.g. "15:15 IST"
  isCircuitBreakerTripped: boolean;
}

interface RiskControlsMonitorProps {
  data?: Partial<RiskControlsData>;
}

export function RiskControlsMonitor({ data = {} }: RiskControlsMonitorProps) {
  const {
    dailyLossLimit = 5000,
    currentLossUsed = 1150,
    maxTradesPerDay = 10,
    tradesCompletedToday = 5,
    maxConcurrentPositions = 3,
    currentOpenPositions = 2,
    autoSquareOffTime = '15:15 IST (3:15 PM)',
    isCircuitBreakerTripped = false,
  } = data;

  const lossPct = Math.min(100, Math.max(0, (currentLossUsed / dailyLossLimit) * 100));
  const tradesPct = Math.min(100, Math.max(0, (tradesCompletedToday / maxTradesPerDay) * 100));
  const positionsPct = Math.min(100, Math.max(0, (currentOpenPositions / maxConcurrentPositions) * 100));

  const isSafe = !isCircuitBreakerTripped && lossPct < 80;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-4.5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg border', isSafe ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400')}>
            {isSafe ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Pre-Trade Risk Controls
            </h3>
            <p className="text-[10px] text-slate-400">Automated capital safety guard</p>
          </div>
        </div>

        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
          isSafe
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        )}>
          {isSafe ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {isSafe ? 'GUARD ACTIVE' : 'LIMIT BREACHED'}
        </span>
      </div>

      {/* Progress Bars for Risk Controls */}
      <div className="space-y-3.5">
        
        {/* 1. Daily Max Loss Limit */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium text-[11px]">Daily Drawdown / Loss</span>
            <span className="font-mono text-slate-300 text-[11px]">
              ₹{currentLossUsed.toLocaleString('en-IN')} / <span className="text-slate-500">₹{dailyLossLimit.toLocaleString('en-IN')}</span> ({lossPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                lossPct < 50 ? 'bg-emerald-500' : lossPct < 80 ? 'bg-amber-500' : 'bg-rose-500'
              )}
              style={{ width: `${lossPct}%` }}
            />
          </div>
        </div>

        {/* 2. Max Trades Per Day */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium text-[11px]">Daily Trades Quota</span>
            <span className="font-mono text-slate-300 text-[11px]">
              {tradesCompletedToday} / <span className="text-slate-500">{maxTradesPerDay} max</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${tradesPct}%` }}
            />
          </div>
        </div>

        {/* 3. Max Concurrent Positions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium text-[11px]">Concurrent Open Positions</span>
            <span className="font-mono text-slate-300 text-[11px]">
              {currentOpenPositions} / <span className="text-slate-500">{maxConcurrentPositions} slots</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${positionsPct}%` }}
            />
          </div>
        </div>

      </div>

      {/* Intraday Auto Square-Off Info */}
      <div className="rounded-lg bg-slate-900/90 border border-slate-800/80 p-2.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>Auto MIS Square-Off:</span>
        </div>
        <span className="font-mono font-bold text-amber-300">
          {autoSquareOffTime}
        </span>
      </div>

    </div>
  );
}

export default RiskControlsMonitor;
