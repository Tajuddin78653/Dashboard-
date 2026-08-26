'use client';

import { useEffect, useState } from 'react';
import { Zap, TrendingUp, IndianRupee, Target } from 'lucide-react';
import { StatCard, Skeleton } from '@/components/ui';
import { getAnalyticsSummary, SummaryStats } from '@/lib/api';

const FALLBACK: SummaryStats = {
  total_signals: 0, open_trades: 0, today_pnl: 0, overall_win_rate: null,
};

export default function DashboardStats() {
  const [stats, setStats] = useState<SummaryStats>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <StatCard
        label="Total Signals"
        value={stats.total_signals.toLocaleString('en-IN')}
        icon={Zap}
        delta={undefined}
      />
      <StatCard
        label="Open Trades"
        value={stats.open_trades.toString()}
        icon={TrendingUp}
        delta={undefined}
      />
      <StatCard
        label="Today P&L"
        value={`₹${Math.abs(stats.today_pnl).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
        icon={IndianRupee}
        delta={pnlPositive ? undefined : -1}
        deltaLabel={pnlPositive ? 'profit' : 'loss'}
      />
      <StatCard
        label="Win Rate"
        value={stats.overall_win_rate != null ? `${stats.overall_win_rate}%` : '—'}
        icon={Target}
        delta={undefined}
      />
    </div>
  );
}
