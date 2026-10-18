'use client';

import { useState } from 'react';
import {
  Sparkles,
  Shield,
  Zap,
  Sliders,
  Check,
  Percent,
  SlidersHorizontal,
  Info,
  X,
  Target,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export type StrategyKey = 'conservative' | 'smart' | 'aggressive' | 'custom';

export interface StrategyConfig {
  key: StrategyKey;
  name: string;
  tagline: string;
  targetPct: number;
  slPct: number;
  tslPct: number;
  capitalPct: number;
  riskRewardRatio: string;
  description: string;
}

export const PRESET_STRATEGIES: Record<StrategyKey, StrategyConfig> = {
  conservative: {
    key: 'conservative',
    name: 'Conservative',
    tagline: 'High Win-Rate & Quick Scalp',
    targetPct: 1.0,
    slPct: 0.5,
    tslPct: 0.5,
    capitalPct: 10,
    riskRewardRatio: '1 : 2.0',
    description: 'Tight target (1.0%) and strict stop loss (0.5%). Locks breakeven early to protect capital.',
  },
  smart: {
    key: 'smart',
    name: 'Smart Captain (Default)',
    tagline: 'Optimal Risk:Reward Balance',
    targetPct: 1.5,
    slPct: 1.0,
    tslPct: 1.0,
    capitalPct: 15,
    riskRewardRatio: '1 : 1.5',
    description: 'Target 1.5%, Initial SL 1.0%, Dynamic Trailing SL 1.0%. Designed for intraday breakouts.',
  },
  aggressive: {
    key: 'aggressive',
    name: 'Aggressive',
    tagline: 'Trend Rider & Maximum Upside',
    targetPct: 3.0,
    slPct: 1.5,
    tslPct: 1.0,
    capitalPct: 25,
    riskRewardRatio: '1 : 2.0',
    description: 'Extended target (3.0%) with 1.5% SL and trailing 1.0% to capture strong momentum trends.',
  },
  custom: {
    key: 'custom',
    name: 'Custom Strategy',
    tagline: 'User-Defined Risk & Targets',
    targetPct: 2.0,
    slPct: 1.0,
    tslPct: 1.0,
    capitalPct: 20,
    riskRewardRatio: '1 : 2.0',
    description: 'Fine-tuned custom parameters configured by the trader.',
  },
};

interface CaptainStrategySelectorProps {
  activeStrategyKey?: StrategyKey;
  onStrategyChange?: (strategy: StrategyConfig) => void;
}

const LS_KEY_STRATEGY = 'tradedash_active_strategy';
const LS_KEY_CUSTOM   = 'tradedash_custom_strategy';

function loadPersistedStrategy(): StrategyKey {
  if (typeof window === 'undefined') return 'smart';
  return (localStorage.getItem(LS_KEY_STRATEGY) as StrategyKey) || 'smart';
}

function loadPersistedCustom(): StrategyConfig {
  if (typeof window === 'undefined') return PRESET_STRATEGIES.custom;
  try {
    const raw = localStorage.getItem(LS_KEY_CUSTOM);
    return raw ? { ...PRESET_STRATEGIES.custom, ...JSON.parse(raw) } : PRESET_STRATEGIES.custom;
  } catch { return PRESET_STRATEGIES.custom; }
}

export function CaptainStrategySelector({
  activeStrategyKey = 'smart',
  onStrategyChange,
}: CaptainStrategySelectorProps) {
  const [selectedKey, setSelectedKey] = useState<StrategyKey>(() => loadPersistedStrategy());
  const [strategies, setStrategies] = useState(() => ({
    ...PRESET_STRATEGIES,
    custom: loadPersistedCustom(),
  }));
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Custom modal edit state
  const [editTarget, setEditTarget] = useState(strategies.custom.targetPct);
  const [editSl, setEditSl] = useState(strategies.custom.slPct);
  const [editTsl, setEditTsl] = useState(strategies.custom.tslPct);
  const [editCapital, setEditCapital] = useState(strategies.custom.capitalPct);

  const activeStrategy = strategies[selectedKey];

  const handleSelect = (key: StrategyKey) => {
    setSelectedKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEY_STRATEGY, key);
    }
    if (key === 'custom') {
      setCustomModalOpen(true);
    }
    if (onStrategyChange) {
      onStrategyChange(strategies[key]);
    }
  };

  const handleSaveCustom = () => {
    const rr = (editTarget / editSl).toFixed(1);
    const updatedCustom: StrategyConfig = {
      ...strategies.custom,
      targetPct: Number(editTarget),
      slPct: Number(editSl),
      tslPct: Number(editTsl),
      capitalPct: Number(editCapital),
      riskRewardRatio: `1 : ${rr}`,
    };

    setStrategies((prev) => ({
      ...prev,
      custom: updatedCustom,
    }));
    setSelectedKey('custom');
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEY_STRATEGY, 'custom');
      localStorage.setItem(LS_KEY_CUSTOM, JSON.stringify({
        targetPct: updatedCustom.targetPct,
        slPct: updatedCustom.slPct,
        tslPct: updatedCustom.tslPct,
        capitalPct: updatedCustom.capitalPct,
        riskRewardRatio: updatedCustom.riskRewardRatio,
      }));
    }
    setCustomModalOpen(false);

    if (onStrategyChange) {
      onStrategyChange(updatedCustom);
    }
  };

  const getStrategyIcon = (key: StrategyKey) => {
    switch (key) {
      case 'conservative':
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case 'smart':
        return <Sparkles className="h-4 w-4 text-indigo-400" />;
      case 'aggressive':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'custom':
        return <Sliders className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-4.5 space-y-4">
      {/* Title & Action */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Captain Strategy Selector
            </h3>
            <p className="text-[10px] text-slate-400">Target, Stop Loss &amp; Dynamic Trailing</p>
          </div>
        </div>

        {selectedKey === 'custom' && (
          <button
            onClick={() => setCustomModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Configure Custom
          </button>
        )}
      </div>

      {/* Preset Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(strategies) as StrategyKey[]).map((key) => {
          const item = strategies[key];
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                'relative flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                isSelected
                  ? 'border-indigo-500/60 bg-indigo-950/30 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5">
                  {getStrategyIcon(key)}
                  <span className={cn('text-xs font-bold truncate', isSelected ? 'text-white' : 'text-slate-300')}>
                    {item.name.replace(' (Default)', '')}
                  </span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />}
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                T: +{item.targetPct}% | SL: -{item.slPct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Strategy Detail Banner */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white text-xs mr-2">{activeStrategy.name}</span>
            <span className="text-[11px] text-slate-400">{activeStrategy.tagline}</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-semibold">
            R:R {activeStrategy.riskRewardRatio}
          </span>
        </div>

        {/* Numeric Badges */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-[#0d162b] border border-slate-800 p-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Target</span>
            <span className="font-mono text-xs font-bold text-emerald-400">+{activeStrategy.targetPct}%</span>
          </div>
          <div className="rounded-lg bg-[#0d162b] border border-slate-800 p-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Stop Loss</span>
            <span className="font-mono text-xs font-bold text-rose-400">-{activeStrategy.slPct}%</span>
          </div>
          <div className="rounded-lg bg-[#0d162b] border border-slate-800 p-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Trailing SL</span>
            <span className="font-mono text-xs font-bold text-amber-400">{activeStrategy.tslPct}%</span>
          </div>
          <div className="rounded-lg bg-[#0d162b] border border-slate-800 p-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Capital/Trade</span>
            <span className="font-mono text-xs font-bold text-purple-300">{activeStrategy.capitalPct}%</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          {activeStrategy.description}
        </p>
      </div>

      {/* Custom Strategy Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#0c1222] p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Configure Custom Strategy</h3>
              </div>
              <button
                onClick={() => setCustomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target % */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Target Profit (%)</span>
                  <span className="text-emerald-400 font-mono">+{editTarget}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.1"
                  value={editTarget}
                  onChange={(e) => setEditTarget(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Stop Loss % */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Initial Stop Loss (%)</span>
                  <span className="text-rose-400 font-mono">-{editSl}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={editSl}
                  onChange={(e) => setEditSl(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Trailing SL % */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Dynamic Trailing SL Step (%)</span>
                  <span className="text-amber-400 font-mono">{editTsl}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={editTsl}
                  onChange={(e) => setEditTsl(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Capital Allocation % */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Capital Per Trade (%)</span>
                  <span className="text-purple-300 font-mono">{editCapital}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={editCapital}
                  onChange={(e) => setEditCapital(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Calculated Risk:Reward Preview */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between">
                <span className="text-slate-400">Calculated Risk:Reward</span>
                <span className="font-mono font-bold text-indigo-400">
                  1 : {(editTarget / editSl).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setCustomModalOpen(false)}
                className="flex-1 text-slate-300 border border-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCustom}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-semibold"
              >
                Apply Custom Strategy
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default CaptainStrategySelector;
