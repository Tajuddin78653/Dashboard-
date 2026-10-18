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

  // ── Real KPI data ───────────────────────────────────────────────────────────
  const [kpiData, setKpiData]       = useState<Partial<DashboardMetricsData>>({});
  const [kpiLoading, setKpiLoading] = useState(true);
  const [riskData, setRiskData]     = useState<Partial<RiskControlsData>>({});

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Summary stats from API
      const summary = await getAnalyticsSummary();

      // 2. Open trades for unrealized P&L + position count
      const openTrades = await getOpenTrades();
      const openPnl = openTrades.reduce((sum: number, t: any) => sum + (t.mtm ?? 0), 0);
      const openPnlPct = openTrades.length > 0
        ? openTrades.reduce((sum: number, t: any) => sum + (t.pnl_pct ?? 0), 0) / openTrades.length
        : 0;

      // 3. Today's closed trades for win/loss count
      const closed = await getTrades({ page_size: '200', status: 'closed' });
      const today = new Date().toISOString().split('T')[0];
      const todayClosed = (closed.items ?? []).filter(
        (t: any) => t.exit_time && t.exit_time.startsWith(today)
      );
      const wins  = todayClosed.filter((t: any) => (t.net_pnl ?? 0) > 0).length;
      const losses = todayClosed.filter((t: any) => (t.net_pnl ?? 0) <= 0).length;
      const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

      const todayLoss = todayClosed
        .filter((t: any) => (t.net_pnl ?? 0) < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.net_pnl ?? 0), 0);

      // KPI cards data
      const metrics: Partial<DashboardMetricsData> = {
        dailyRealizedPnl:       summary.today_pnl ?? 0,
        dailyRealizedPnlPct:    0,                   // no % in API — derived from capital if needed
        openUnrealizedPnl:      openPnl,
        openUnrealizedPnlPct:   parseFloat(openPnlPct.toFixed(2)),
        winRatePct:             winRate,
        winCount:               wins,
        lossCount:              losses,
        openPositionsCount:     openTrades.length,
        maxPositionsCount:      5,                   // from risk config — hardcoded fallback
        dailyLossUsed:          todayLoss,
        dailyLossLimit:         5000,
      };
      setKpiData(metrics);

      // Risk monitor data
      const risk: Partial<RiskControlsData> = {
        dailyLossLimit:          5000,
        currentLossUsed:         todayLoss,
        maxTradesPerDay:         10,
        tradesCompletedToday:    todayClosed.length,
        maxConcurrentPositions:  5,
        currentOpenPositions:    openTrades.length,
        autoSquareOffTime:       '15:15 IST (3:15 PM)',
        isCircuitBreakerTripped: todayLoss >= 5000,
      };
      setRiskData(risk);

    } catch (err) {
      console.error('[Dashboard] fetchDashboardData error:', err);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  // Load on mount + refresh every 60s
  useEffect(() => {
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, 60_000);
    return () => clearInterval(id);
  }, [fetchDashboardData]);

  const handleStrategyChange = (newStrategy: StrategyConfig) => {
    setActiveStrategy(newStrategy);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* ── Row 1: Executive Metric KPI Cards (real data) ── */}
      <MetricKPICards data={kpiData} loading={kpiLoading} />

      {/* ── Row 2: Captain Strategy Selector & Pre-Trade Risk Controls ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <CaptainStrategySelector
            activeStrategyKey="smart"
            onStrategyChange={handleStrategyChange}
          />
        </div>
        <div className="lg:col-span-5">
          <RiskControlsMonitor data={riskData} />
        </div>
      </div>

      {/* ── Row 3: Live Open Positions with Dynamic Trailing SL ── */}
      <OpenPositionsCard isPaperMode={paperTrading} />

      {/* ── Row 4: Chartink Signals Feed & Scanner Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <ChartinkSignalFeed />
        </div>
        <div className="lg:col-span-6">
          <ScannerPerformanceMatrix />
        </div>
      </div>

      {/* ── Row 5: Closed Positions & Execution Audit Journal ── */}
      <ClosedTradesJournal />

    </div>
  );
}
