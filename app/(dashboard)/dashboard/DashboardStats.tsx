'use client';

import { useEffect, useState, useCallback } from 'react';
import { Zap, TrendingUp, IndianRupee, Target } from 'lucide-react';
import { StatCard, Skeleton } from '@/components/ui';
import { getAnalyticsSummary } from '@/lib/api';
import type { SummaryStats } from '@/lib/api';

const FALLBACK: SummaryStats = {
  total_signals: 0, today_signals: 0, open_trades: 0, today_pnl: 0, overall_win_rate: null,
};

export default function DashboardStats() {
  const [stats, setStats]     = useState<SummaryStats>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    getAnalyticsSummary()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initial fetch
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Auto-refresh every 60 s
  useEffect(() => {
    const id = setInterval(fetchStats, 60_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  const pnlPositive = stats.today_pnl >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Today's signals — the number the user cares about most */}
      <StatCard
        label="Today's Signals"
        value={stats.today_signals.toLocaleString('en-IN')}
        icon={Zap}
        deltaLabel={`${stats.total_signals.toLocaleString('en-IN')} lifetime`}
      />
      <StatCard
        label="Open Trades"
        value={stats.open_trades.toString()}
        icon={TrendingUp}
      />
      <StatCard
        label="Today P&L"
        value={`₹${Math.abs(stats.today_pnl).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
        icon={IndianRupee}
        delta={pnlPositive ? undefined : -1}
        deltaLabel={pnlPositive ? 'profit today' : 'loss today'}
        className={pnlPositive ? '[&_p]:text-green-400' : '[&_p]:text-red-400'}
      />
      <StatCard
        label="Win Rate"
        value={stats.overall_win_rate != null ? `${stats.overall_win_rate.toFixed(1)}%` : '–'}
        icon={Target}
      />
    </div>
  );
}
