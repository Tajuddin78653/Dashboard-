'use client';

import { useEffect, useState, useCallback } from 'react';
import { MetricKPICards, DashboardMetricsData } from '@/components/MetricKPICards';
import { CaptainStrategySelector, StrategyConfig, PRESET_STRATEGIES } from '@/components/CaptainStrategySelector';
import { RiskControlsMonitor, RiskControlsData } from '@/components/RiskControlsMonitor';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { ChartinkSignalFeed } from '@/components/ChartinkSignalFeed';
import { ClosedTradesJournal } from '@/components/ClosedTradesJournal';
import { ScannerPerformanceMatrix } from '@/components/ScannerPerformanceMatrix';
import { useTradingMode } from '@/lib/trading-mode-context';
import { getAnalyticsSummary, getOpenTrades, getTrades } from '@/lib/api';

export default function DashboardPage() {
  const { paperTrading } = useTradingMode();
  const [activeStrategy, setActiveStrategy] = useState<StrategyConfig>(PRESET_STRATEGIES.smart);

  const [kpiData, setKpiData]       = useState<Partial<DashboardMetricsData>>({});
  const [kpiLoading, setKpiLoading] = useState(true);
  const [riskData, setRiskData]     = useState<Partial<RiskControlsData>>({});

  const fetchDashboardData = useCallback(async () => {
    try {
      const summary    = await getAnalyticsSummary();
      const openTrades = await getOpenTrades();
      const openPnl    = openTrades.reduce((sum: number, t: any) => sum + (t.mtm ?? 0), 0);
      const openPnlPct = openTrades.length > 0
        ? openTrades.reduce((sum: number, t: any) => sum + (t.pnl_pct ?? 0), 0) / openTrades.length : 0;

      const closed  = await getTrades({ page_size: '200', status: 'closed' });
      const today   = new Date().toISOString().split('T')[0];
      const todayClosed = (closed.items ?? []).filter(
        (t: any) => t.exit_time && t.exit_time.startsWith(today)
      );
      const wins    = todayClosed.filter((t: any) => (t.net_pnl ?? 0) > 0).length;
      const losses  = todayClosed.filter((t: any) => (t.net_pnl ?? 0) <= 0).length;
      const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
      const todayLoss = todayClosed
        .filter((t: any) => (t.net_pnl ?? 0) < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.net_pnl ?? 0), 0);

      setKpiData({
        dailyRealizedPnl:     summary.today_pnl ?? 0,
        dailyRealizedPnlPct:  0,
        openUnrealizedPnl:    openPnl,
        openUnrealizedPnlPct: parseFloat(openPnlPct.toFixed(2)),
        winRatePct:           winRate,
        winCount:             wins,
        lossCount:            losses,
        openPositionsCount:   openTrades.length,
        maxPositionsCount:    5,
        dailyLossUsed:        todayLoss,
        dailyLossLimit:       5000,
      });

      setRiskData({
        dailyLossLimit:          5000,
        currentLossUsed:         todayLoss,
        maxTradesPerDay:         10,
        tradesCompletedToday:    todayClosed.length,
        maxConcurrentPositions:  5,
        currentOpenPositions:    openTrades.length,
        autoSquareOffTime:       '15:15 IST',
        isCircuitBreakerTripped: todayLoss >= 5000,
      });
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, 60_000);
    return () => clearInterval(id);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-3 animate-fade-in pb-12">

      {/* ── Row 1: KPI Cards ─────────────────────────────────────────────── */}
      <MetricKPICards data={kpiData} loading={kpiLoading} />

      {/* ── Row 2: Bento Grid — Strategy | Risk ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-7">
          <CaptainStrategySelector
            activeStrategyKey="smart"
            onStrategyChange={setActiveStrategy}
          />
        </div>
        <div className="lg:col-span-5">
          <RiskControlsMonitor data={riskData} />
        </div>
      </div>

      {/* ── Row 3: Open Positions (full width hero) ───────────────────────── */}
      <OpenPositionsCard isPaperMode={paperTrading} />

      {/* ── Row 4: Bento Grid — Signal Feed | Win-Rate Matrix ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-6">
          <ChartinkSignalFeed />
        </div>
        <div className="lg:col-span-6">
          <ScannerPerformanceMatrix />
        </div>
      </div>

      {/* ── Row 5: Closed Trades Journal (full width) ─────────────────────── */}
      <ClosedTradesJournal />

    </div>
  );
}
