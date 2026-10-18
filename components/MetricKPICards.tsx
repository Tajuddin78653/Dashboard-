'use client';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardMetricsData {
  dailyRealizedPnl: number;
  dailyRealizedPnlPct: number;
  openUnrealizedPnl: number;
  openUnrealizedPnlPct: number;
  winRatePct: number;
  winCount: number;
  lossCount: number;
  openPositionsCount: number;
  maxPositionsCount: number;
  dailyLossUsed: number;
  dailyLossLimit: number;
}

interface MetricKPICardsProps {
  data?: Partial<DashboardMetricsData>;
  loading?: boolean;
}

export function MetricKPICards({
  data = {},
  loading = false,
}: MetricKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-[#0d1527] p-4 h-[88px] animate-pulse">
            <div className="h-2 w-20 bg-slate-700 rounded mb-3" />
            <div className="h-6 w-28 bg-slate-700 rounded mb-2" />
            <div className="h-1.5 w-full bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const {
    dailyRealizedPnl = 0,
    dailyRealizedPnlPct = 0,
    openUnrealizedPnl = 0,
    openUnrealizedPnlPct = 0,
    winRatePct = 0,
    winCount = 0,
    lossCount = 0,
    openPositionsCount = 0,
    maxPositionsCount = 5,
    dailyLossUsed = 0,
    dailyLossLimit = 5000,
  } = data;

  const isRealizedPositive = dailyRealizedPnl >= 0;
  const isOpenPositive = openUnrealizedPnl >= 0;
  const remainingLossBuffer = Math.max(0, dailyLossLimit - dailyLossUsed);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      
      {/* ── 1. Daily Realized P&L ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1527] p-4 shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Today Realized P&amp;L
          </span>
          <div className={cn('p-1.5 rounded-lg', isRealizedPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
            {isRealizedPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn('text-xl font-mono font-bold tracking-tight', isRealizedPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {isRealizedPositive ? '+' : ''}₹{dailyRealizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className={cn('text-xs font-mono font-semibold flex items-center', isRealizedPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {isRealizedPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isRealizedPositive ? '+' : ''}{dailyRealizedPnlPct.toFixed(2)}%
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          Settled closed positions
        </div>
        <div className={cn('absolute bottom-0 left-0 right-0 h-[2px]', isRealizedPositive ? 'bg-emerald-500' : 'bg-rose-500')} />
      </div>

      {/* ── 2. Open Unrealized P&L ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1527] p-4 shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Open Unrealized P&amp;L
          </span>
          <div className={cn('p-1.5 rounded-lg', isOpenPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn('text-xl font-mono font-bold tracking-tight', isOpenPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {isOpenPositive ? '+' : ''}₹{openUnrealizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className={cn('text-xs font-mono font-semibold flex items-center', isOpenPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {isOpenPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isOpenPositive ? '+' : ''}{openUnrealizedPnlPct.toFixed(2)}%
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          Active positions MTM
        </div>
        <div className={cn('absolute bottom-0 left-0 right-0 h-[2px]', isOpenPositive ? 'bg-emerald-500' : 'bg-rose-500')} />
      </div>

      {/* ── 3. Win Rate (Today) ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1527] p-4 shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Win Rate (Today)
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <PieChart className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-mono font-bold text-white tracking-tight">
            {winRatePct}%
          </p>
          <span className="text-xs font-mono font-semibold text-slate-400">
            ({winCount}W / {lossCount}L)
          </span>
        </div>
        <div className="mt-2 text-[10px] text-indigo-400 font-mono">
          {winCount + lossCount} Total closed trades
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
      </div>

      {/* ── 4. Open Positions / Max Allowed ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1527] p-4 shadow-sm hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Positions Open
          </span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-mono font-bold text-white tracking-tight">
            {openPositionsCount}{' '}
            <span className="text-xs font-normal text-slate-400">/ {maxPositionsCount} Max</span>
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          {maxPositionsCount - openPositionsCount} slot(s) available
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
      </div>

      {/* ── 5. Daily Risk Buffer ── */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1527] p-4 shadow-sm hover:border-slate-700 transition-all col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Daily Risk Buffer
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-mono font-bold text-amber-400 tracking-tight">
            ₹{remainingLossBuffer.toLocaleString('en-IN')}
          </p>
          <span className="text-xs font-mono text-slate-400">
            / ₹{dailyLossLimit.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 font-mono">
          {((remainingLossBuffer / dailyLossLimit) * 100).toFixed(0)}% Buffer remaining
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500" />
      </div>

    </div>
  );
}

export default MetricKPICards;
