'use client';

import { useState } from 'react';
import { Target, TrendingUp, Percent, TrendingDown } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Strategy Tab Names ───────────────────────────────────────────────────────
export const STRATEGY_TABS = ['13/50 EMA', 'Gap D/U', 'ST+ADX', 'Pro Engine'] as const;
export type StrategyTab = (typeof STRATEGY_TABS)[number];

// ─── Per-strategy mock metrics ────────────────────────────────────────────────
const STRATEGY_METRICS: Record<
  StrategyTab,
  { winRate: string; profitFactor: string; avgReturn: string; maxDrawdown: string }
> = {
  '13/50 EMA': { winRate: '72%', profitFactor: '2.1', avgReturn: '+1.8%', maxDrawdown: '-6.2%' },
  'Gap D/U':   { winRate: '65%', profitFactor: '1.7', avgReturn: '+1.4%', maxDrawdown: '-9.1%' },
  'ST+ADX':    { winRate: '70%', profitFactor: '1.9', avgReturn: '+1.6%', maxDrawdown: '-7.5%' },
  'Pro Engine':{ winRate: '68%', profitFactor: '1.8', avgReturn: '+1.5%', maxDrawdown: '-8.0%' },
};

export function StrategyTabs() {
  const [active, setActive] = useState<StrategyTab>('13/50 EMA');
  const m = STRATEGY_METRICS[active];

  return (
    <div className="space-y-4">
      {/* ── Pill Tab Selector ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {STRATEGY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              active === tab
                ? 'bg-gold-500 text-navy-900 font-bold'
                : 'bg-navy-800 text-[#4a5a8a] hover:bg-navy-700 hover:text-slate-200',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Key Metrics Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Win Rate"      value={m.winRate}      icon={Target}      />
        <StatCard label="Profit Factor" value={m.profitFactor} icon={TrendingUp}  />
        <StatCard label="Avg Return"    value={m.avgReturn}    icon={Percent}     />
        <StatCard
          label="Max Drawdown"
          value={m.maxDrawdown}
          icon={TrendingDown}
          className="[&_svg]:text-danger"
        />
      </div>
    </div>
  );
}
