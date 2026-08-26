import { BarChart2, CalendarDays, TrendingUp } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { StrategyTabs } from './StrategyTabs';
import { MonthlyPnLChart } from './MonthlyPnLChart';
import { EquityCurveChart } from './EquityCurveChart';
import type { HistogramPoint, LinePoint } from '@/components/charts/LightweightChart';

// ─── Monthly P&L data (Jan–Dec 2024) ─────────────────────────────────────────
const monthlyPnLData: HistogramPoint[] = [
  { time: '2024-01-01', value:  18400 },
  { time: '2024-02-01', value: -7200  },
  { time: '2024-03-01', value:  24600 },
  { time: '2024-04-01', value:  31200 },
  { time: '2024-05-01', value: -12400 },
  { time: '2024-06-01', value:  19800 },
  { time: '2024-07-01', value:  28500 },
  { time: '2024-08-01', value: -5600  },
  { time: '2024-09-01', value:  33700 },
  { time: '2024-10-01', value:  41200 },
  { time: '2024-11-01', value: -9800  },
  { time: '2024-12-01', value:  27300 },
];

// ─── Equity curve data (₹1,00,000 → ~₹1,65,000) ──────────────────────────────
const equityCurveData: LinePoint[] = [
  { time: '2024-01-01', value: 100000 },
  { time: '2024-02-01', value: 118400 },
  { time: '2024-03-01', value: 111200 },
  { time: '2024-04-01', value: 135800 },
  { time: '2024-05-01', value: 167000 },
  { time: '2024-06-01', value: 154600 },
  { time: '2024-07-01', value: 174400 },
  { time: '2024-08-01', value: 202900 },
  { time: '2024-09-01', value: 197300 },
  { time: '2024-10-01', value: 231000 },
  { time: '2024-11-01', value: 272200 },
  { time: '2024-12-01', value: 262400 },
];

// ─── Strategy comparison table mock data ──────────────────────────────────────
interface StrategyRow {
  strategy: string;
  totalSignals: number;
  winRate: string;
  profitFactor: string;
  avgReturn: string;
  maxDrawdown: string;
  netPnL: string;
}

const comparisonData: StrategyRow[] = [
  { strategy: '13/50 EMA',  totalSignals: 412, winRate: '72%', profitFactor: '2.1', avgReturn: '+1.8%', maxDrawdown: '-6.2%',  netPnL: '₹1,89,400' },
  { strategy: 'Gap D/U',    totalSignals: 287, winRate: '65%', profitFactor: '1.7', avgReturn: '+1.4%', maxDrawdown: '-9.1%',  netPnL: '₹1,12,600' },
  { strategy: 'ST+ADX',     totalSignals: 341, winRate: '70%', profitFactor: '1.9', avgReturn: '+1.6%', maxDrawdown: '-7.5%',  netPnL: '₹1,54,200' },
  { strategy: 'Pro Engine', totalSignals: 207, winRate: '68%', profitFactor: '1.8', avgReturn: '+1.5%', maxDrawdown: '-8.0%',  netPnL: '₹1,38,900' },
];

// Best value per column (index into comparisonData)
const BEST: Record<keyof Omit<StrategyRow, 'strategy'>, number> = {
  totalSignals: 0, // 412
  winRate:      0, // 72%
  profitFactor: 0, // 2.1
  avgReturn:    0, // +1.8%
  maxDrawdown:  0, // -6.2% (smallest absolute)
  netPnL:       0, // ₹1,89,400
};

function isBest(field: keyof Omit<StrategyRow, 'strategy'>, idx: number) {
  return BEST[field] === idx;
}

// ─── Page component (server component) ───────────────────────────────────────
export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
          <BarChart2 className="h-5 w-5 text-gold-500" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">Strategy Analytics</h1>
          <p className="text-xs text-[#4a5a8a]">Performance metrics per strategy</p>
        </div>
      </div>

      {/* ── Strategy Tab Selector + Key Metrics (client) ───────────────── */}
      <StrategyTabs />

      {/* ── Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Monthly P&L Bar Chart */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <CalendarDays className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Monthly P&amp;L</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">Jan – Dec 2024</span>
          </div>
          <div className="p-2">
            <MonthlyPnLChart data={monthlyPnLData} />
          </div>
        </Card>

        {/* Equity Curve Line Chart */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#1e2d5a]">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Equity Curve</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">₹1,00,000 → ₹2,62,400</span>
          </div>
          <div className="p-2">
            <EquityCurveChart data={equityCurveData} />
          </div>
        </Card>

      </div>

      {/* ── Strategy Comparison Table ───────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
          <BarChart2 className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Strategy Comparison</h2>
          <span className="ml-auto text-xs text-[#4a5a8a]">All strategies · 2024</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full table-auto border-collapse text-sm">
            <thead className="bg-navy-800 border-b border-[#1e2d5a]">
              <tr>
                {['Strategy', 'Total Signals', 'Win Rate', 'Profit Factor', 'Avg Return', 'Max Drawdown', 'Net P&L', 'Status'].map((h) => (
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
              {comparisonData.map((row, ri) => (
                <tr
                  key={row.strategy}
                  className={cn(
                    'transition-colors duration-75 hover:bg-navy-800',
                    ri % 2 === 1 && 'bg-navy-800/40',
                  )}
                >
                  {/* Strategy name */}
                  <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                    {row.strategy}
                  </td>
                  {/* Total Signals */}
                  <td className={cn('px-4 py-3 font-mono whitespace-nowrap', isBest('totalSignals', ri) ? 'text-gold-400 font-bold' : 'text-slate-200')}>
                    {row.totalSignals}
                  </td>
                  {/* Win Rate */}
                  <td className={cn('px-4 py-3 font-mono whitespace-nowrap', isBest('winRate', ri) ? 'text-gold-400 font-bold' : 'text-slate-200')}>
                    {row.winRate}
                  </td>
                  {/* Profit Factor */}
                  <td className={cn('px-4 py-3 font-mono whitespace-nowrap', isBest('profitFactor', ri) ? 'text-gold-400 font-bold' : 'text-slate-200')}>
                    {row.profitFactor}
                  </td>
                  {/* Avg Return */}
                  <td className={cn('px-4 py-3 font-mono whitespace-nowrap', isBest('avgReturn', ri) ? 'text-gold-400 font-bold' : 'text-success')}>
                    {row.avgReturn}
                  </td>
                  {/* Max Drawdown */}
                  <td className={cn('px-4 py-3 font-mono whitespace-nowrap', isBest('maxDrawdown', ri) ? 'text-gold-400 font-bold' : 'text-danger')}>
                    {row.maxDrawdown}
                  </td>
                  {/* Net P&L */}
                  <td className={cn('px-4 py-3 font-mono whitespace-nowrap', isBest('netPnL', ri) ? 'text-gold-400 font-bold' : 'text-slate-200')}>
                    {row.netPnL}
                  </td>
                  {/* Status */}
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
      </Card>

    </div>
  );
}
