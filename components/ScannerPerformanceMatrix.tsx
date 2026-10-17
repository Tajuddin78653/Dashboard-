'use client';

import { BarChart3, TrendingUp, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScannerMetric {
  scannerName: string;
  totalAlerts: number;
  tradesExecuted: number;
  winRate: number;
  netPnl: number;
  avgReturnPct: number;
}

const MOCK_SCANNERS: ScannerMetric[] = [
  {
    scannerName: '15 Min Bullish Breakout',
    totalAlerts: 14,
    tradesExecuted: 6,
    winRate: 83.3,
    netPnl: 4820.0,
    avgReturnPct: 1.25,
  },
  {
    scannerName: 'VWAP Cross + High Vol',
    totalAlerts: 9,
    tradesExecuted: 4,
    winRate: 75.0,
    netPnl: 3100.0,
    avgReturnPct: 1.1,
  },
  {
    scannerName: 'Supertrend Buy Intraday',
    totalAlerts: 11,
    tradesExecuted: 5,
    winRate: 60.0,
    netPnl: 1450.0,
    avgReturnPct: 0.65,
  },
  {
    scannerName: 'RSI Reversal Pullback',
    totalAlerts: 7,
    tradesExecuted: 3,
    winRate: 33.3,
    netPnl: -520.0,
    avgReturnPct: -0.25,
  },
];

interface ScannerPerformanceMatrixProps {
  scanners?: ScannerMetric[];
}

export function ScannerPerformanceMatrix({ scanners = MOCK_SCANNERS }: ScannerPerformanceMatrixProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#090f1e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Chartink Scanner Win-Rate Matrix
            </h3>
            <p className="text-[10px] text-slate-400">Strategy &amp; alert profitability breakdown</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          Top Performer: 15m Breakout
        </span>
      </div>

      {/* Grid of Scanner Cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scanners.map((item) => {
          const isProfitable = item.netPnl >= 0;
          return (
            <div
              key={item.scannerName}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate max-w-[180px]">
                  {item.scannerName}
                </span>
                <span className={cn('font-mono font-bold text-xs', isProfitable ? 'text-emerald-400' : 'text-rose-400')}>
                  {isProfitable ? '+' : ''}₹{item.netPnl.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Win Rate Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Win Rate</span>
                  <span className="font-bold text-white">{item.winRate.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      item.winRate >= 70 ? 'bg-emerald-500' : item.winRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    style={{ width: `${item.winRate}%` }}
                  />
                </div>
              </div>

              {/* Metrics footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                <span>Alerts: {item.totalAlerts}</span>
                <span>Trades: {item.tradesExecuted}</span>
                <span>Avg: {item.avgReturnPct > 0 ? '+' : ''}{item.avgReturnPct.toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScannerPerformanceMatrix;
