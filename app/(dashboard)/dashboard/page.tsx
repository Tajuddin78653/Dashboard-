'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, BarChart2, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui';
import { DailyPnLChart } from './DailyPnLChart';
import { StrategyPerformanceChart } from './StrategyPerformanceChart';
import DashboardStats from './DashboardStats';
import {
  getMonthlyPnL, getStrategyMetrics, getSignals,
} from '@/lib/api';
import type { MonthlyPnL, StrategyMetrics, SignalResponse } from '@/lib/api';
import type { HistogramPoint, LinePoint } from '@/components/charts/LightweightChart';
import { cn } from '@/lib/utils';

// ─── Helper: convert monthly P&L to cumulative daily-ish equity curve ────────
function monthlyToCumulative(data: MonthlyPnL[]): LinePoint[] {
  let cumulative = 0;
  return data.map((m) => {
    cumulative += m.net_pnl;
    const month = String(m.month).padStart(2, '0');
    return { time: `${new Date().getFullYear()}-${month}-01` as `${number}-${number}-${number}`, value: cumulative };
  });
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  // Daily P&L data (from monthly API)
  const [dailyData, setDailyData]         = useState<LinePoint[]>([]);
  const [stratData, setStratData]         = useState<HistogramPoint[]>([]);
  const [stratMeta, setStratMeta]         = useState<StrategyMetrics[]>([]);
  const [recentSigs, setRecentSigs]       = useState<SignalResponse[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingSigs, setLoadingSigs]     = useState(true);

  useEffect(() => {
    // Fetch monthly P&L for equity curve
    getMonthlyPnL()
      .then((data) => {
        // Cumulative equity curve
        setDailyData(monthlyToCumulative(data));
        // Strategy histogram: use net_pnl per month (simple representation)
        setStratData(
          data.map((m) => ({
            time: `${new Date().getFullYear()}-${String(m.month).padStart(2, '0')}-01` as `${number}-${number}-${number}`,
            value: m.net_pnl,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoadingCharts(false));

    // Strategy metrics for performance bar section
    getStrategyMetrics()
      .then(setStratMeta)
      .catch(() => {});

    // Recent signals (last 10)
    getSignals({ page: '1', page_size: '10' })
      .then((res) => setRecentSigs(res.items))
      .catch(() => {})
      .finally(() => setLoadingSigs(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Row 1: Stat Cards (live — auto-refreshes every 60 s) ────────────── */}
      <DashboardStats />

      {/* ── Row 2: Charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Equity Curve / Cumulative P&L */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <CalendarDays className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Cumulative P&amp;L</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">Monthly from DB</span>
          </div>
          <div className="p-2">
            {loadingCharts
              ? <div className="h-[250px] flex items-center justify-center"><Skeleton className="h-full w-full" /></div>
              : dailyData.length > 0
                ? <DailyPnLChart data={dailyData} />
                : <div className="h-[250px] flex items-center justify-center text-xs text-[#4a5a8a]">No P&L data yet — trades will populate this chart</div>
            }
          </div>
        </Card>

        {/* Strategy Performance */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <BarChart2 className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Strategy Performance</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">Win rate % · live</span>
          </div>
          {/* Strategy win rate pills */}
          <div className="px-4 pb-2 pt-3 flex flex-wrap gap-3">
            {loadingCharts
              ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-28 rounded-lg" />)
              : stratMeta.length === 0
                ? <p className="text-xs text-[#4a5a8a] py-4">No strategy data yet</p>
                : stratMeta.map((s) => (
                  <div key={s.strategy_id} className="flex flex-col items-center rounded-lg border border-[#1e2d5a] bg-navy-800 px-4 py-2 min-w-[90px]">
                    <span className="text-[10px] text-[#4a5a8a] truncate w-full text-center">{s.strategy_name}</span>
                    <span className="text-base font-mono font-bold text-gold-400">
                      {s.win_rate != null ? `${s.win_rate.toFixed(0)}%` : '–'}
                    </span>
                    <span className="text-[9px] text-[#4a5a8a]">{s.total_trades} trades</span>
                  </div>
                ))
            }
          </div>
          <div className="px-2 pb-2">
            {!loadingCharts && stratData.length > 0 && (
              <StrategyPerformanceChart data={stratData} />
            )}
          </div>
        </Card>

      </div>

      {/* ── Row 3: Recent Signals (live) ────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
          <Zap className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Recent Signals</h2>
          <a
            href="/signals"
            className="ml-auto text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            View All →
          </a>
        </div>

        {loadingSigs ? (
          <div className="divide-y divide-[#1e2d5a]/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : recentSigs.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#4a5a8a]">
            No signals yet — they appear here when Chartink fires a webhook
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#1e2d5a] bg-navy-800/60">
                  {['Time', 'Symbol', 'Type', 'Entry Price', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#4a5a8a]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSigs.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-[#1e2d5a]/50 transition-colors hover:bg-navy-700/40',
                      idx % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/30',
                    )}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-300">
                      {new Date(row.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-white">{row.symbol}</td>
                    <td className="px-4 py-2.5">
                      {row.signal_type === 'BUY' ? (
                        <span className="inline-flex items-center gap-1 text-green-400 font-semibold text-xs">
                          <ArrowUpRight className="h-3 w-3" /> BUY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                          <ArrowDownRight className="h-3 w-3" /> SELL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-slate-200">
                      {row.entry_price != null ? `₹${row.entry_price.toLocaleString('en-IN')}` : '–'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge status={row.status as BadgeStatus} />
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
