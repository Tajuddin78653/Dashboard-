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
  autoSquareOffTime: string;
  isCircuitBreakerTripped: boolean;
}

interface RiskControlsMonitorProps {
  data?: Partial<RiskControlsData>;
}

export function RiskControlsMonitor({ data = {} }: RiskControlsMonitorProps) {
  const {
    dailyLossLimit           = 5000,
    currentLossUsed          = 0,
    maxTradesPerDay          = 10,
    tradesCompletedToday     = 0,
    maxConcurrentPositions   = 3,
    currentOpenPositions     = 0,
    autoSquareOffTime        = '15:15 IST',
    isCircuitBreakerTripped  = false,
  } = data;

  const lossPct       = Math.min(100, (currentLossUsed / dailyLossLimit) * 100);
  const tradesPct     = Math.min(100, (tradesCompletedToday / maxTradesPerDay) * 100);
  const positionsPct  = Math.min(100, (currentOpenPositions / maxConcurrentPositions) * 100);
  const isSafe        = !isCircuitBreakerTripped && lossPct < 80;

  const bars = [
    {
      label: 'Daily Drawdown',
      value: `₹${currentLossUsed.toLocaleString('en-IN')}`,
      limit: `₹${dailyLossLimit.toLocaleString('en-IN')}`,
      pct: lossPct,
      color: lossPct < 50 ? '#00ff88' : lossPct < 80 ? '#ffaa00' : '#ff2d55',
      glow:  lossPct < 50 ? '#00ff88' : lossPct < 80 ? '#ffaa00' : '#ff2d55',
    },
    {
      label: 'Trades Quota',
      value: `${tradesCompletedToday}`,
      limit: `${maxTradesPerDay} max`,
      pct: tradesPct,
      color: '#7c3aed',
      glow:  '#a855f7',
    },
    {
      label: 'Open Positions',
      value: `${currentOpenPositions}`,
      limit: `${maxConcurrentPositions} slots`,
      pct: positionsPct,
      color: '#00f5ff',
      glow:  '#00f5ff',
    },
  ];

  return (
    <div className="cyber-card p-4 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-900/30">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'p-1.5 rounded-lg border',
            isSafe
              ? 'bg-emerald-500/10 border-emerald-500/20 text-[#00ff88]'
              : 'bg-rose-500/10 border-rose-500/20 text-[#ff2d55]'
          )}>
            {isSafe
              ? <ShieldCheck className="h-4 w-4" />
              : <ShieldAlert className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white tracking-[0.12em] uppercase">
              Risk Controls
            </h3>
            <p className="text-[9px] text-cyan-700 font-mono">Capital safety guard · live</p>
          </div>
        </div>
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider border',
          isSafe
            ? 'bg-emerald-500/10 border-emerald-500/30 text-[#00ff88]'
            : 'bg-rose-500/10 border-rose-500/30 text-[#ff2d55]'
        )} style={{ boxShadow: isSafe ? '0 0 8px rgba(0,255,136,0.3)' : '0 0 8px rgba(255,45,85,0.3)' }}>
          {isSafe
            ? <><CheckCircle2 className="h-3 w-3" /> ARMED</>
            : <><AlertTriangle className="h-3 w-3" /> TRIPPED</>}
        </span>
      </div>

      {/* Progress bars */}
      <div className="space-y-3.5">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 tracking-wide">{bar.label}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: bar.color }}>
                {bar.value} <span className="text-slate-600 font-normal">/ {bar.limit}</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cyan-950/80 overflow-hidden"
              style={{ boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${bar.pct}%`,
                  background: bar.color,
                  boxShadow: `0 0 8px ${bar.glow}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Auto square-off */}
      <div className="rounded-lg bg-amber-950/20 border border-amber-900/30 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-600">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold">Auto MIS Square-Off</span>
        </div>
        <span className="font-mono font-black text-[10px] text-[#ffaa00]"
          style={{ textShadow: '0 0 8px rgba(255,170,0,0.6)' }}>
          {autoSquareOffTime}
        </span>
      </div>
    </div>
  );
}

export default RiskControlsMonitor;
