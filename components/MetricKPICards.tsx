'use client';

import {
  TrendingUp, TrendingDown, DollarSign,
  PieChart, ShieldAlert, Layers, ArrowUpRight, ArrowDownRight,
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

export function MetricKPICards({ data = {}, loading = false }: MetricKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="cyber-card p-4 h-[96px] animate-pulse">
            <div className="h-2 w-16 bg-cyan-900/40 rounded mb-3" />
            <div className="h-7 w-28 bg-cyan-900/30 rounded mb-2" />
            <div className="h-1.5 w-full bg-cyan-900/20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const {
    dailyRealizedPnl    = 0,
    dailyRealizedPnlPct = 0,
    openUnrealizedPnl   = 0,
    openUnrealizedPnlPct = 0,
    winRatePct          = 0,
    winCount            = 0,
    lossCount           = 0,
    openPositionsCount  = 0,
    maxPositionsCount   = 5,
    dailyLossUsed       = 0,
    dailyLossLimit      = 5000,
  } = data;

  const isRealizedPos = dailyRealizedPnl >= 0;
  const isOpenPos     = openUnrealizedPnl >= 0;
  const bufferPct     = Math.max(0, ((dailyLossLimit - dailyLossUsed) / dailyLossLimit) * 100);
  const slotsPct      = (openPositionsCount / maxPositionsCount) * 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

      {/* ── 1. Daily Realized P&L ── */}
      <div className={cn(
        'cyber-card p-4 group hover:scale-[1.02] transition-transform duration-200 scanlines',
        isRealizedPos ? 'glow-border-green' : 'glow-border-red'
      )}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-500/70">Today Realized</span>
          <div className={cn('p-1 rounded', isRealizedPos ? 'bg-emerald-500/10 text-[#00ff88]' : 'bg-rose-500/10 text-[#ff2d55]')}>
            {isRealizedPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          </div>
        </div>
        <p className={cn(
          'text-2xl font-mono font-black tracking-tight leading-none',
          isRealizedPos ? 'text-[#00ff88] text-glow-green' : 'text-[#ff2d55] text-glow-red'
        )}>
          {isRealizedPos ? '+' : ''}₹{Math.abs(dailyRealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {isRealizedPos ? <ArrowUpRight className="h-3 w-3 text-[#00ff88]" /> : <ArrowDownRight className="h-3 w-3 text-[#ff2d55]" />}
          <span className={cn('text-[10px] font-mono font-bold', isRealizedPos ? 'text-[#00ff88]/70' : 'text-[#ff2d55]/70')}>
            {isRealizedPos ? '+' : ''}{dailyRealizedPnlPct.toFixed(2)}%
          </span>
        </div>
        {/* Bottom glow bar */}
        <div className={cn('absolute bottom-0 left-0 right-0 h-[2px]', isRealizedPos ? 'bg-[#00ff88]' : 'bg-[#ff2d55]')}
          style={{ boxShadow: isRealizedPos ? '0 0 8px #00ff88' : '0 0 8px #ff2d55' }} />
      </div>

      {/* ── 2. Open Unrealized P&L ── */}
      <div className={cn(
        'cyber-card p-4 group hover:scale-[1.02] transition-transform duration-200',
        isOpenPos ? 'glow-border-green' : 'glow-border-red'
      )}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-500/70">Open MTM</span>
          <div className={cn('p-1 rounded', isOpenPos ? 'bg-emerald-500/10 text-[#00ff88]' : 'bg-rose-500/10 text-[#ff2d55]')}>
            <DollarSign className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className={cn(
          'text-2xl font-mono font-black tracking-tight leading-none',
          isOpenPos ? 'text-[#00ff88] text-glow-green' : 'text-[#ff2d55] text-glow-red'
        )}>
          {isOpenPos ? '+' : ''}₹{Math.abs(openUnrealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {isOpenPos ? <ArrowUpRight className="h-3 w-3 text-[#00ff88]" /> : <ArrowDownRight className="h-3 w-3 text-[#ff2d55]" />}
          <span className={cn('text-[10px] font-mono font-bold', isOpenPos ? 'text-[#00ff88]/70' : 'text-[#ff2d55]/70')}>
            {isOpenPos ? '+' : ''}{openUnrealizedPnlPct.toFixed(2)}%
          </span>
        </div>
        <div className={cn('absolute bottom-0 left-0 right-0 h-[2px]', isOpenPos ? 'bg-[#00ff88]' : 'bg-[#ff2d55]')}
          style={{ boxShadow: isOpenPos ? '0 0 8px #00ff88' : '0 0 8px #ff2d55' }} />
      </div>

      {/* ── 3. Win Rate ── */}
      <div className="cyber-card p-4 glow-border-purple hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-500/70">Win Rate</span>
          <div className="p-1 rounded bg-purple-500/10 text-[#a855f7]">
            <PieChart className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="text-2xl font-mono font-black tracking-tight leading-none text-[#a855f7] text-glow-purple">
          {winRatePct}%
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono text-[#00ff88]/70 font-bold">{winCount}W</span>
          <span className="text-[10px] text-cyan-800">/</span>
          <span className="text-[10px] font-mono text-[#ff2d55]/70 font-bold">{lossCount}L</span>
        </div>
        {/* Mini arc bar */}
        <div className="mt-2 h-1 w-full rounded-full bg-cyan-950 overflow-hidden">
          <div className="h-full bg-[#a855f7] rounded-full transition-all duration-700"
            style={{ width: `${winRatePct}%`, boxShadow: '0 0 6px #a855f7' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#a855f7]"
          style={{ boxShadow: '0 0 8px #a855f7' }} />
      </div>

      {/* ── 4. Open Positions ── */}
      <div className="cyber-card p-4 glow-border-cyan hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-500/70">Positions</span>
          <div className="p-1 rounded bg-cyan-500/10 text-[#00f5ff]">
            <Layers className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl font-mono font-black tracking-tight leading-none text-[#00f5ff] text-glow-cyan">
            {openPositionsCount}
          </p>
          <span className="text-sm font-mono text-cyan-700">/ {maxPositionsCount}</span>
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-cyan-950 overflow-hidden">
          <div className="h-full bg-[#00f5ff] rounded-full transition-all duration-700"
            style={{ width: `${slotsPct}%`, boxShadow: '0 0 6px #00f5ff' }} />
        </div>
        <span className="text-[10px] font-mono text-cyan-600 mt-1 block">
          {maxPositionsCount - openPositionsCount} slot{maxPositionsCount - openPositionsCount !== 1 ? 's' : ''} free
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f5ff]"
          style={{ boxShadow: '0 0 8px #00f5ff' }} />
      </div>

      {/* ── 5. Daily Risk Buffer ── */}
      <div className={cn(
        'cyber-card p-4 hover:scale-[1.02] transition-transform duration-200 col-span-2 lg:col-span-1',
        bufferPct > 50 ? 'glow-border-amber' : 'glow-border-red'
      )}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-500/70">Risk Buffer</span>
          <div className={cn('p-1 rounded', bufferPct > 50 ? 'bg-amber-500/10 text-[#ffaa00]' : 'bg-rose-500/10 text-[#ff2d55]')}>
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className={cn('text-2xl font-mono font-black tracking-tight leading-none',
          bufferPct > 50 ? 'text-[#ffaa00] text-glow-amber' : 'text-[#ff2d55] text-glow-red'
        )}>
          ₹{(dailyLossLimit - dailyLossUsed).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        <div className="mt-2 h-1 w-full rounded-full bg-cyan-950 overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-700',
            bufferPct > 70 ? 'bg-[#00ff88]' : bufferPct > 40 ? 'bg-[#ffaa00]' : 'bg-[#ff2d55]'
          )}
            style={{ width: `${bufferPct}%`, boxShadow: bufferPct > 50 ? '0 0 6px #ffaa00' : '0 0 6px #ff2d55' }} />
        </div>
        <span className="text-[10px] font-mono text-amber-600/70 mt-1 block">{bufferPct.toFixed(0)}% remaining</span>
        <div className={cn('absolute bottom-0 left-0 right-0 h-[2px]', bufferPct > 50 ? 'bg-[#ffaa00]' : 'bg-[#ff2d55]')}
          style={{ boxShadow: bufferPct > 50 ? '0 0 8px #ffaa00' : '0 0 8px #ff2d55' }} />
      </div>

    </div>
  );
}

export default MetricKPICards;
