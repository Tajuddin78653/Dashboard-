'use client';

import { useState } from 'react';
import { MetricKPICards } from '@/components/MetricKPICards';
import { CaptainStrategySelector, StrategyConfig, PRESET_STRATEGIES } from '@/components/CaptainStrategySelector';
import { RiskControlsMonitor } from '@/components/RiskControlsMonitor';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { ChartinkSignalFeed } from '@/components/ChartinkSignalFeed';
import { ClosedTradesJournal } from '@/components/ClosedTradesJournal';
import { ScannerPerformanceMatrix } from '@/components/ScannerPerformanceMatrix';
import { useTradingMode } from '@/lib/trading-mode-context';

export default function DashboardPage() {
  const { paperTrading } = useTradingMode();
  const [activeStrategy, setActiveStrategy] = useState<StrategyConfig>(PRESET_STRATEGIES.smart);

  const handleStrategyChange = (newStrategy: StrategyConfig) => {
    setActiveStrategy(newStrategy);
    console.log('Strategy switched to:', newStrategy.name);
  };

  const handleManualExit = async (tradeId: string) => {
    console.log('Manual market exit executed for trade:', tradeId);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      
      {/* ── Row 1: Executive Metric KPI Cards ── */}
      <MetricKPICards />

      {/* ── Row 2: Captain Strategy Selector & Pre-Trade Risk Controls ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <CaptainStrategySelector
            activeStrategyKey="smart"
            onStrategyChange={handleStrategyChange}
          />
        </div>
        <div className="lg:col-span-5">
          <RiskControlsMonitor />
        </div>
      </div>

      {/* ── Row 3: Live Open Positions with Dynamic Trailing SL ── */}
      <OpenPositionsCard
        isPaperMode={paperTrading}
        onManualExit={handleManualExit}
      />

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
