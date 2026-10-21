'use client';

import { useEffect, useState, useCallback } from 'react';
import { Award, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStrategyMetrics, type StrategyMetrics } from '@/lib/api';

export function ScannerPerformanceMatrix() {
  const [metrics, setMetrics] = useState<StrategyMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try { setMetrics(await getStrategyMetrics()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const top = metrics.reduce<StrategyMetrics | null>(
    (best, m) => (!best || (m.win_rate ?? 0) > (best.win_rate ?? 0)) ? m : best, null
  );

  return (
    <div className="cyber-card overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-900/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#ffaa00]/10 border border-[#ffaa00]/20"
            style={{ boxShadow: '0 0 8px rgba(255,170,0,0.15)' }}>
            <Award className="h-4 w-4 text-[#ffaa00]"
              style={{ filter: 'drop-shadow(0 0 4px rgba(255,170,0,0.7))' }} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white tracking-[0.12em] uppercase">Win-Rate Matrix</h3>
            <p className="text-[9px] text-cyan-800 font-mono">Strategy profitability · live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {top && (
            <span className="text-[9px] font-mono text-[#ffaa00] bg-[#ffaa00]/8 border border-[#ffaa00]/20 px-2 py-0.5 rounded">
              ▲ {top.strategy_name}
            </span>
          )}
          <button onClick={fetchMetrics} disabled={loading}
            className="text-slate-700 hover:text-[#00f5ff] transition-colors">
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {loading ? (
          <div className="col-span-2 py-10 text-center text-xs text-cyan-900 font-mono">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-[#00f5ff]" />
            loading strategies…
          </div>
        ) : metrics.length === 0 ? (
          <div className="col-span-2 py-10 text-center text-xs text-cyan-900 font-mono">
            [ no strategy data — run some trades ]
          </div>
        ) : metrics.map((m) => {
          const isProfit = m.net_pnl >= 0;
          const winRate  = m.win_rate ?? 0;
          const barColor = winRate >= 70 ? '#00ff88' : winRate >= 50 ? '#ffaa00' : '#ff2d55';

          return (
            <div key={m.strategy_id}
              className="rounded-lg border border-cyan-900/20 bg-cyber-900/60 p-3 space-y-2.5 hover:border-cyan-800/40 transition-colors"
              style={{ background: 'rgba(5,5,15,0.7)' }}>

              <div className="flex items-center justify-between">
                <span className="font-black text-white text-[11px] truncate max-w-[160px]">{m.strategy_name}</span>
                <div className="flex items-center gap-1">
                  {isProfit
                    ? <TrendingUp className="h-3 w-3 text-[#00ff88]" />
                    : <TrendingDown className="h-3 w-3 text-[#ff2d55]" />}
                  <span className={cn('font-mono font-black text-xs', isProfit ? 'text-[#00ff88]' : 'text-[#ff2d55]')}
                    style={{ textShadow: isProfit ? '0 0 6px rgba(0,255,136,0.5)' : '0 0 6px rgba(255,45,85,0.5)' }}>
                    {isProfit ? '+' : ''}₹{m.net_pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Win Rate bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-600">Win Rate</span>
                  <span className="font-black" style={{ color: barColor }}>{winRate.toFixed(1)}%</span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden"
                  style={{ background: 'rgba(0,245,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(winRate, 100)}%`,
                      background: barColor,
                      boxShadow: `0 0 6px ${barColor}`,
                    }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-mono pt-1 border-t border-cyan-900/15">
                <span>SIG <span className="text-slate-500">{m.total_signals}</span></span>
                <span>TRD <span className="text-slate-500">{m.total_trades}</span></span>
                <span>PF <span className="text-slate-500">{m.profit_factor != null ? m.profit_factor.toFixed(2) : '—'}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScannerPerformanceMatrix;
