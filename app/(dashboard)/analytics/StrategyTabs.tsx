'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Percent, TrendingDown, RefreshCw } from 'lucide-react';
import { StatCard, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getStrategyMetrics } from '@/lib/api';
import type { StrategyMetrics } from '@/lib/api';

export function StrategyTabs() {
  const [metrics, setMetrics]   = useState<StrategyMetrics[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    getStrategyMetrics()
      .then((data) => {
        setMetrics(data);
        if (data.length > 0) setActiveId(data[0].strategy_id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = metrics.find((m) => m.strategy_id === activeId);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/40 p-8 text-center text-sm text-[#4a5a8a]">
        No strategy data yet — trades will appear here after the scheduler runs
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Pill Tab Selector ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((m) => (
          <button
            key={m.strategy_id}
            onClick={() => setActiveId(m.strategy_id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeId === m.strategy_id
                ? 'bg-gold-500 text-navy-900 font-bold'
                : 'bg-navy-800 text-[#4a5a8a] hover:bg-navy-700 hover:text-slate-200',
            )}
          >
            {m.strategy_name}
          </button>
        ))}
      </div>

      {/* ── Key Metrics Row ────────────────────────────────────────────────── */}
      {active && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Win Rate"
            value={active.win_rate != null ? `${active.win_rate.toFixed(1)}%` : '–'}
            icon={Target}
          />
          <StatCard
            label="Profit Factor"
            value={active.profit_factor != null ? active.profit_factor.toFixed(2) : '–'}
            icon={TrendingUp}
          />
          <StatCard
            label="Avg Return"
            value={active.avg_return != null ? `${active.avg_return.toFixed(2)}%` : '–'}
            icon={Percent}
          />
          <StatCard
            label="Net P&L"
            value={`₹${active.net_pnl.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={TrendingDown}
            className={active.net_pnl >= 0 ? '[&_p]:text-green-400' : '[&_p]:text-red-400'}
          />
        </div>
      )}
    </div>
  );
}
