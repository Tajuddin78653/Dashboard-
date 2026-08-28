'use client';

import { useEffect, useState } from 'react';
import { BarChart2, CalendarDays, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { StrategyTabs } from './StrategyTabs';
import { MonthlyPnLChart } from './MonthlyPnLChart';
import { EquityCurveChart } from './EquityCurveChart';
import { getMonthlyPnL, getEquityCurve, getStrategyMetrics } from '@/lib/api';
import type { StrategyMetrics } from '@/lib/api';
import type { HistogramPoint, LinePoint } from '@/components/charts/LightweightChart';
import type { Time } from 'lightweight-charts';
import { CHART_COLORS } from '@/lib/design-tokens';

export default function AnalyticsPage() {
  const [monthlyData, setMonthlyData] = useState<HistogramPoint[]>([]);
  const [equityData, setEquityData]   = useState<LinePoint[]>([]);
  const [strategies, setStrategies]   = useState<StrategyMetrics[]>([]);
  const [loading, setLoading]         = useState(true);
  const [year] = useState(new Date().getFullYear());

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      getMonthlyPnL(year),
      getEquityCurve(),
      getStrategyMetrics(),
    ])
      .then(([monthly, equity, strats]) => {
        setMonthlyData(
          monthly.map((m) => ({
            time: `${year}-${String(m.month).padStart(2, '0')}-01` as Time,
            value: m.net_pnl,
            color: m.net_pnl >= 0 ? CHART_COLORS.profit : CHART_COLORS.loss,
          }))
        );
        setEquityData(
          equity.map((e) => ({
            time: e.date as Time,
            value: e.cumulative_pnl,
          }))
        );
        setStrategies(strats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Best value helpers
  const best = (field: keyof StrategyMetrics, higherBetter = true): string => {
    if (strategies.length === 0) return '';
    const vals = strategies.map((s) => Number(s[field] ?? 0));
    const target = higherBetter ? Math.max(...vals) : Math.min(...vals);
    const idx = vals.indexOf(target);
    return strategies[idx]?.strategy_id ?? '';
  };

  const bestWinRate     = best('win_rate');
  const bestPF          = best('profit_factor');
  const bestNetPnl      = best('net_pnl');
  const bestSignals     = best('total_signals');
  const bestDrawdown    = best('max_drawdown', false);   // lower is better

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
            <BarChart2 className="h-5 w-5 text-gold-500" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Strategy Analytics</h1>
            <p className="text-xs text-[#4a5a8a]">Live performance metrics from DB</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* ── Strategy Tab Selector + Key Metrics (client, live) ───────────────── */}
      <StrategyTabs />

      {/* ── Charts Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Monthly P&L Bar Chart */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <CalendarDays className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Monthly P&amp;L</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">{year} · from DB</span>
          </div>
          <div className="p-2">
            {loading
              ? <Skeleton className="h-[260px] w-full" />
              : monthlyData.length > 0
                ? <MonthlyPnLChart data={monthlyData} />
                : <div className="h-[260px] flex items-center justify-center text-xs text-[#4a5a8a]">No closed trades yet</div>
            }
          </div>
        </Card>

        {/* Equity Curve Line Chart */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Equity Curve</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">Cumulative net P&L · live</span>
          </div>
          <div className="p-2">
            {loading
              ? <Skeleton className="h-[260px] w-full" />
              : equityData.length > 0
                ? <EquityCurveChart data={equityData} />
                : <div className="h-[260px] flex items-center justify-center text-xs text-[#4a5a8a]">No closed trades yet</div>
            }
          </div>
        </Card>

      </div>

      {/* ── Strategy Comparison Table ─────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
          <BarChart2 className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Strategy Comparison</h2>
          <span className="ml-auto text-xs text-[#4a5a8a]">All strategies · live from DB</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
          </div>
        ) : strategies.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#4a5a8a]">
            No trade data yet — run some trades and come back
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full table-auto border-collapse text-sm">
              <thead className="bg-navy-800 border-b border-[#1e2d5a]">
                <tr>
                  {['Strategy', 'Signals', 'Trades', 'Winners', 'Losers', 'Win Rate', 'Net P&L', 'Status'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#4a5a8a] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d5a] bg-navy-900">
                {strategies.map((row, ri) => (
                  <tr
                    key={row.strategy_id}
                    className={cn(
                      'transition-colors duration-75 hover:bg-navy-800',
                      ri % 2 === 1 && 'bg-navy-800/40',
                    )}
                  >
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {row.strategy_name}
                    </td>
                    <td className={cn('px-4 py-3 font-mono whitespace-nowrap', bestSignals === row.strategy_id ? 'text-gold-400 font-bold' : 'text-slate-200')}>
                      {row.total_signals}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200 whitespace-nowrap">
                      {row.total_trades}
                    </td>
                    <td className="px-4 py-3 font-mono text-green-400 whitespace-nowrap">
                      {row.winners}
                    </td>
                    <td className="px-4 py-3 font-mono text-red-400 whitespace-nowrap">
                      {row.losers}
                    </td>
                    <td className={cn('px-4 py-3 font-mono whitespace-nowrap', bestWinRate === row.strategy_id ? 'text-gold-400 font-bold' : 'text-slate-200')}>
                      {row.win_rate != null ? `${row.win_rate.toFixed(1)}%` : '–'}
                    </td>
                    <td className={cn('px-4 py-3 font-mono whitespace-nowrap font-semibold',
                      bestNetPnl === row.strategy_id ? 'text-gold-400 font-bold' :
                      row.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {row.net_pnl >= 0 ? '+' : ''}₹{row.net_pnl.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
