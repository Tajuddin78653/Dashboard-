import { CalendarDays, BarChart2, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui';
import { DailyPnLChart } from './DailyPnLChart';
import { StrategyPerformanceChart } from './StrategyPerformanceChart';
import { RecentSignalsTable } from './RecentSignalsTable';
import DashboardStats from './DashboardStats';

// ─── Mock P&L line data (last 30 trading days) ────────────────────────────────
export const dailyPnLData = [
  { time: '2025-01-02', value: 4200 },
  { time: '2025-01-03', value: -1800 },
  { time: '2025-01-06', value: 3100 },
  { time: '2025-01-07', value: 5600 },
  { time: '2025-01-08', value: -2200 },
  { time: '2025-01-09', value: 7800 },
  { time: '2025-01-10', value: 3400 },
  { time: '2025-01-13', value: -900 },
  { time: '2025-01-14', value: 6100 },
  { time: '2025-01-15', value: 8900 },
  { time: '2025-01-16', value: -3100 },
  { time: '2025-01-17', value: 4700 },
  { time: '2025-01-20', value: 9200 },
  { time: '2025-01-21', value: 2300 },
  { time: '2025-01-22', value: -1400 },
  { time: '2025-01-23', value: 11400 },
  { time: '2025-01-24', value: 6800 },
  { time: '2025-01-27', value: -2700 },
  { time: '2025-01-28', value: 13200 },
  { time: '2025-01-29', value: 7500 },
  { time: '2025-01-30', value: -1100 },
  { time: '2025-01-31', value: 16300 },
  { time: '2025-02-03', value: 8900 },
  { time: '2025-02-04', value: -3400 },
  { time: '2025-02-05', value: 18700 },
  { time: '2025-02-06', value: 12100 },
  { time: '2025-02-07', value: 21500 },
  { time: '2025-02-10', value: -1800 },
  { time: '2025-02-11', value: 24100 },
  { time: '2025-02-12', value: 24580 },
];

// ─── Mock strategy histogram data ────────────────────────────────────────────
export const strategyWinRateData = [
  { time: '2025-01-01' as const, value: 72 },
  { time: '2025-02-01' as const, value: 65 },
  { time: '2025-03-01' as const, value: 70 },
  { time: '2025-04-01' as const, value: 68 },
];

// ─── Mock signals data ────────────────────────────────────────────────────────
export interface Signal {
  time: string;
  symbol: string;
  signalType: string;
  price: string;
  strategy: string;
  status: BadgeStatus;
}

export const recentSignals: Signal[] = [
  { time: '09:16:04', symbol: 'RELIANCE',    signalType: 'BUY',  price: '2,847.50', strategy: '13/50 EMA',   status: 'entered' },
  { time: '09:18:21', symbol: 'TCS',         signalType: 'SELL', price: '4,123.75', strategy: 'Gap D/U',     status: 'target-hit' },
  { time: '09:22:38', symbol: 'INFY',        signalType: 'BUY',  price: '1,892.30', strategy: 'ST+ADX',      status: 'pending' },
  { time: '09:31:15', symbol: 'HDFCBANK',    signalType: 'BUY',  price: '1,674.80', strategy: 'Pro Engine',  status: 'entered' },
  { time: '09:45:02', symbol: 'ICICIBANK',   signalType: 'SELL', price: '1,248.60', strategy: '13/50 EMA',   status: 'sl-hit' },
  { time: '09:52:44', symbol: 'SBIN',        signalType: 'BUY',  price: '812.45',   strategy: 'Gap D/U',     status: 'target-hit' },
  { time: '10:04:11', symbol: 'WIPRO',       signalType: 'SELL', price: '562.90',   strategy: 'ST+ADX',      status: 'pending' },
  { time: '10:17:33', symbol: 'BHARTIARTL',  signalType: 'BUY',  price: '1,736.25', strategy: 'Pro Engine',  status: 'entered' },
  { time: '10:28:57', symbol: 'TATAMOTORS',  signalType: 'BUY',  price: '989.15',   strategy: '13/50 EMA',   status: 'target-hit' },
  { time: '10:41:22', symbol: 'AXISBANK',    signalType: 'SELL', price: '1,182.70', strategy: 'Gap D/U',     status: 'pending' },
];

// ─── Page component (server component) ───────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Row 1: Stat Cards (live from API) ─────────────────────────────── */}
      <DashboardStats />

      {/* ── Row 2: Charts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Daily P&L Line Chart */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <CalendarDays className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Daily P&amp;L</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">Last 30 trading days</span>
          </div>
          <div className="p-2">
            <DailyPnLChart data={dailyPnLData} />
          </div>
        </Card>

        {/* Strategy Performance Bar Chart */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <BarChart2 className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Strategy Performance</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">Win rate %</span>
          </div>
          <div className="px-4 pb-2 pt-1 flex justify-between">
            {['13/50 EMA', 'Gap D/U', 'ST+ADX', 'Pro Engine'].map((name, i) => {
              const pcts = [72, 65, 70, 68];
              return (
                <div key={name} className="text-center text-[10px] text-[#4a5a8a] w-1/4">
                  <span className="block truncate px-1">{name}</span>
                  <span className="text-gold-400 font-mono font-semibold">{pcts[i]}%</span>
                </div>
              );
            })}
          </div>
          <div className="px-2 pb-2">
            <StrategyPerformanceChart data={strategyWinRateData} />
          </div>
        </Card>

      </div>

      {/* ── Row 3: Recent Signals ─────────────────────────────────────────── */}
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
        <RecentSignalsTable signals={recentSignals} />
      </Card>

    </div>
  );
}
