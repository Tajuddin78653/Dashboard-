'use client';

import { useEffect, useState, useCallback } from 'react';
import { Award, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStrategyMetrics, type StrategyMetrics } from '@/lib/api';

export function ScannerPerformanceMatrix() {
  const [metrics, setMetrics] = useState<StrategyMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStrategyMetrics();
      setMetrics(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const topPerformer = metrics.reduce<StrategyMetrics | null>((best, m) =>
    (!best || (m.win_rate ?? 0) > (best.win_rate ?? 0)) ? m : best, null
  );

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
            <p className="text-[10px] text-slate-400">Strategy &amp; alert profitability · live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {topPerformer && (
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Top: {topPerformer.strategy_name}
            </span>
          )}
          <button onClick={fetchMetrics} disabled={loading} className="text-slate-500 hover:text-slate-300">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-2 py-10 text-center text-xs text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" /> Loading strategy data…
          </div>
        ) : metrics.length === 0 ? (
          <div className="col-span-2 py-10 text-center text-xs text-slate-500">
            No strategy data yet — run some trades and come back
          </div>
        ) : metrics.map((m) => {
          const isProfitable = m.net_pnl >= 0;
          const winRate = m.win_rate ?? 0;
          return (
            <div key={m.strategy_id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate max-w-[180px]">{m.strategy_name}</span>
                <span className={cn('font-mono font-bold text-xs', isProfitable ? 'text-emerald-400' : 'text-rose-400')}>
                  {isProfitable ? '+' : ''}₹{m.net_pnl.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Win Rate Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Win Rate</span>
                  <span className="font-bold text-white">{winRate.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500',
                      winRate >= 70 ? 'bg-emerald-500' : winRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    style={{ width: `${Math.min(winRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer metrics */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                <span>Signals: {m.total_signals}</span>
                <span>Trades: {m.total_trades}</span>
                <span>PF: {m.profit_factor != null ? m.profit_factor.toFixed(2) : '—'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScannerPerformanceMatrix;
