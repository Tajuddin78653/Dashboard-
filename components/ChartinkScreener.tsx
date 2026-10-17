'use client';

import { useState, useCallback } from 'react';
import {
  Search, Play, BarChart2, Zap, TrendingUp, TrendingDown,
  Plus, Trash2, RefreshCw, ChevronDown, Filter, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  runScreener, runBacktest, getScreenerPresets,
  type ConditionItem, type StockResult,
  type BacktestResult, type ScreenerPreset,
} from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────
type ActiveTab = 'screener' | 'backtest' | 'presets';

const INDICATORS = [
  'close', 'open', 'high', 'low', 'volume', 'vol_avg20',
  'ema9', 'ema20', 'ema50', 'ema200', 'sma20', 'sma50',
  'rsi14', 'macd_line', 'macd_signal', 'macd_hist',
];
const OPERATORS = ['>', '>=', '<', '<=', '==', 'crosses_above', 'crosses_below'];
const PATTERNS = ['DOJI', 'HAMMER', 'BULLISH_ENGULFING', 'BEARISH_ENGULFING', 'SHOOTING_STAR'];
const INTERVALS = [
  { value: '1d', label: 'Daily' },
  { value: '1wk', label: 'Weekly' },
  { value: '1mo', label: 'Monthly' },
  { value: '60m', label: '1 Hour' },
  { value: '15m', label: '15 Min' },
];
const PERIODS = ['1mo', '3mo', '6mo', '1y', '2y', '5y'];

// ── Small UI Primitives ──────────────────────────────────────────────────────
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider', className)}>
      {children}
    </span>
  );
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[#1e2d5a] bg-[#0d1829]', className)}>
      {children}
    </div>
  );
}
function Select({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-lg border border-[#1e2d5a] bg-[#0d1829] px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500',
        className,
      )}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Condition Row ────────────────────────────────────────────────────────────
function ConditionRow({
  cond, index, onChange, onRemove,
}: {
  cond: ConditionItem; index: number;
  onChange: (i: number, c: ConditionItem) => void;
  onRemove: (i: number) => void;
}) {
  const isPattern = !!cond.pattern;
  const useCompare = !isPattern && cond.compare_to !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#1e2d5a] bg-[#0a1220] p-3">
      {/* Pattern toggle */}
      <button
        onClick={() => onChange(index, isPattern
          ? { indicator: 'rsi14', operator: '>', value: 50 }
          : { pattern: 'HAMMER' }
        )}
        className={cn(
          'rounded px-2 py-1 text-[10px] font-semibold transition-colors',
          isPattern ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-navy-700 text-[#4a5a8a] border border-[#1e2d5a] hover:text-slate-300',
        )}
      >
        {isPattern ? 'PATTERN' : 'INDICATOR'}
      </button>

      {isPattern ? (
        <Select
          value={cond.pattern || 'HAMMER'}
          onChange={(v) => onChange(index, { pattern: v })}
          options={PATTERNS.map((p) => ({ value: p, label: p.replace(/_/g, ' ') }))}
        />
      ) : (
        <>
          <Select
            value={cond.indicator || 'rsi14'}
            onChange={(v) => onChange(index, { ...cond, indicator: v })}
            options={INDICATORS.map((i) => ({ value: i, label: i.toUpperCase() }))}
          />
          <Select
            value={cond.operator || '>'}
            onChange={(v) => onChange(index, { ...cond, operator: v })}
            options={OPERATORS.map((o) => ({ value: o, label: o }))}
          />
          {/* Compare to value or indicator */}
          <button
            onClick={() => onChange(index, useCompare
              ? { ...cond, compare_to: undefined, value: 50 }
              : { ...cond, value: undefined, compare_to: 'ema50' }
            )}
            className="rounded border border-[#1e2d5a] bg-navy-700 px-2 py-1 text-[10px] text-[#4a5a8a] hover:text-slate-300"
          >
            {useCompare ? '≈ Indicator' : '# Value'}
          </button>
          {useCompare ? (
            <Select
              value={cond.compare_to || 'ema50'}
              onChange={(v) => onChange(index, { ...cond, compare_to: v })}
              options={INDICATORS.map((i) => ({ value: i, label: i.toUpperCase() }))}
            />
          ) : (
            <input
              type="number"
              value={cond.value ?? 50}
              onChange={(e) => onChange(index, { ...cond, value: parseFloat(e.target.value) })}
              className="w-24 rounded-lg border border-[#1e2d5a] bg-[#0d1829] px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          )}
        </>
      )}

      <button onClick={() => onRemove(index)} className="ml-auto text-red-400 hover:text-red-300">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Screener Results Table ───────────────────────────────────────────────────
function ScreenerResultsTable({ results }: { results: StockResult[] }) {
  if (results.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#4a5a8a]">
        No stocks matched your conditions
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full table-auto border-collapse text-sm">
        <thead className="border-b border-[#1e2d5a] bg-[#0a1220]">
          <tr>
            {['Symbol', 'Close', 'Change', 'EMA20', 'EMA50', 'RSI14', 'MACD', 'Volume', 'Patterns'].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#4a5a8a] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2d5a]">
          {results.map((r) => {
            const changeVsEma20 = (((r.close - r.ema20) / r.ema20) * 100).toFixed(2);
            const activePatterns = Object.entries(r.patterns).filter(([, v]) => v).map(([k]) => k);
            return (
              <tr key={r.symbol} className="transition-colors hover:bg-navy-800/40">
                <td className="px-3 py-2.5 font-bold text-white">{r.symbol}</td>
                <td className="px-3 py-2.5 font-mono text-slate-200">₹{r.close.toLocaleString('en-IN')}</td>
                <td className={cn('px-3 py-2.5 font-mono text-xs', parseFloat(changeVsEma20) >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {parseFloat(changeVsEma20) >= 0 ? '+' : ''}{changeVsEma20}%
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{r.ema20}</td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{r.ema50}</td>
                <td className={cn('px-3 py-2.5 font-mono text-xs font-semibold',
                  r.rsi14 > 70 ? 'text-red-400' : r.rsi14 < 30 ? 'text-green-400' : 'text-slate-200'
                )}>
                  {r.rsi14}
                </td>
                <td className={cn('px-3 py-2.5 font-mono text-xs', r.macd_hist >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {r.macd_hist >= 0 ? '+' : ''}{r.macd_hist.toFixed(3)}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">
                  {(r.volume / 1000).toFixed(0)}K
                  {r.volume > r.vol_avg20 * 1.5 && (
                    <span className="ml-1 text-gold-400">↑</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {activePatterns.length > 0
                      ? activePatterns.map((p) => (
                          <Badge key={p} className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {p.replace(/_/g, ' ')}
                          </Badge>
                        ))
                      : <span className="text-[10px] text-[#4a5a8a]">—</span>
                    }
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Backtest Summary ─────────────────────────────────────────────────────────
function BacktestSummary({ result }: { result: BacktestResult }) {
  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Signals', value: result.total_signals, color: 'text-white' },
          { label: 'Win Rate', value: `${result.win_rate}%`, color: result.win_rate >= 50 ? 'text-green-400' : 'text-red-400' },
          { label: 'Wins', value: result.wins, color: 'text-green-400' },
          { label: 'Avg Return', value: `${result.avg_return_pct}%`, color: result.avg_return_pct >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-[#1e2d5a] bg-[#0a1220] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[#4a5a8a]">{k.label}</p>
            <p className={cn('mt-1 text-xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Trade list */}
      {result.trades.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#1e2d5a]">
          <table className="w-full text-xs">
            <thead className="border-b border-[#1e2d5a] bg-[#0a1220]">
              <tr>
                {['Symbol', 'Entry Date', 'Exit Date', 'Entry ₹', 'Exit ₹', 'Return %', 'Result'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#4a5a8a]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d5a]">
              {result.trades.slice(0, 50).map((t, i) => (
                <tr key={i} className="hover:bg-navy-800/40">
                  <td className="px-3 py-2 font-bold text-white">{t.symbol}</td>
                  <td className="px-3 py-2 text-slate-300">{t.entry_date}</td>
                  <td className="px-3 py-2 text-slate-300">{t.exit_date}</td>
                  <td className="px-3 py-2 font-mono text-slate-200">₹{t.entry_price}</td>
                  <td className="px-3 py-2 font-mono text-slate-200">₹{t.exit_price}</td>
                  <td className={cn('px-3 py-2 font-mono font-semibold', t.return_pct >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {t.return_pct >= 0 ? '+' : ''}{t.return_pct}%
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={t.result === 'WIN'
                      ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                      : 'bg-red-400/10 text-red-400 border border-red-400/30'
                    }>
                      {t.result}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.trades.length > 50 && (
            <p className="py-2 text-center text-xs text-[#4a5a8a]">
              Showing 50 of {result.trades.length} trades
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ChartinkScreener() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('screener');
  const [conditions, setConditions] = useState<ConditionItem[]>([
    { indicator: 'rsi14', operator: '>', value: 50 },
  ]);
  const [symbolInput, setSymbolInput] = useState('');
  const [interval, setInterval] = useState('1d');
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(false);
  const [screenerResult, setScreenerResult] = useState<{ scanned: number; matched: number; results: StockResult[] } | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [presets, setPresets] = useState<ScreenerPreset[]>([]);
  const [presetsLoaded, setPresetsLoaded] = useState(false);
  const [error, setError] = useState('');

  const getSymbols = () =>
    symbolInput.trim()
      ? symbolInput.split(/[\n,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean)
      : [];

  const handleAddCondition = () =>
    setConditions((prev) => [...prev, { indicator: 'rsi14', operator: '>', value: 50 }]);

  const handleChangeCondition = (i: number, c: ConditionItem) =>
    setConditions((prev) => prev.map((x, idx) => idx === i ? c : x));

  const handleRemoveCondition = (i: number) =>
    setConditions((prev) => prev.filter((_, idx) => idx !== i));

  const handleRunScreener = useCallback(async () => {
    if (conditions.length === 0) { setError('Add at least one condition'); return; }
    setLoading(true); setError(''); setScreenerResult(null);
    try {
      const result = await runScreener(getSymbols(), conditions, interval);
      setScreenerResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Screener failed');
    } finally {
      setLoading(false);
    }
  }, [conditions, symbolInput, interval]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunBacktest = useCallback(async () => {
    if (conditions.length === 0) { setError('Add at least one condition'); return; }
    setLoading(true); setError(''); setBacktestResult(null);
    try {
      const result = await runBacktest(getSymbols(), conditions, period, interval);
      setBacktestResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Backtest failed');
    } finally {
      setLoading(false);
    }
  }, [conditions, symbolInput, period, interval]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadPresets = useCallback(async () => {
    if (presetsLoaded) return;
    try {
      const data = await getScreenerPresets();
      setPresets(data.presets);
      setPresetsLoaded(true);
    } catch { /* ignore */ }
  }, [presetsLoaded]);

  const handleApplyPreset = (preset: ScreenerPreset) => {
    setConditions(preset.conditions);
    setActiveTab('screener');
  };

  const tabs = [
    { id: 'screener' as ActiveTab, label: 'Live Screener', icon: Search },
    { id: 'backtest' as ActiveTab, label: 'Backtest', icon: BarChart2 },
    { id: 'presets' as ActiveTab, label: 'Presets', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
          <Filter className="h-5 w-5 text-gold-500" />
        </span>
        <div>
          <h2 className="text-base font-bold text-white">Stock Screener</h2>
          <p className="text-xs text-[#4a5a8a]">Chartink-style scan engine · powered by REA</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select value={interval} onChange={setInterval}
            options={INTERVALS} className="text-xs" />
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border border-[#1e2d5a] bg-[#0a1220] p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); if (t.id === 'presets') handleLoadPresets(); }}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex-1 justify-center',
                activeTab === t.id
                  ? 'bg-gold-500 text-navy-900 font-bold'
                  : 'text-[#4a5a8a] hover:text-slate-200',
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Condition Builder (shared) ─────────────────────────────────── */}
      {activeTab !== 'presets' && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4a5a8a]">
              Conditions (AND logic)
            </p>
            <button
              onClick={handleAddCondition}
              className="flex items-center gap-1 rounded-lg border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 text-xs font-semibold text-gold-400 hover:bg-gold-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> Add Condition
            </button>
          </div>

          {conditions.map((c, i) => (
            <ConditionRow key={i} cond={c} index={i} onChange={handleChangeCondition} onRemove={handleRemoveCondition} />
          ))}

          {/* Symbol input */}
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-[#4a5a8a]">
              Symbols (leave empty for NSE Top 30)
            </p>
            <textarea
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder="RELIANCE, TCS, INFY, HDFCBANK..."
              rows={2}
              className="w-full rounded-lg border border-[#1e2d5a] bg-[#0a1220] px-3 py-2 text-sm text-slate-200 placeholder:text-[#4a5a8a] focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
            />
          </div>

          {/* Backtest period */}
          {activeTab === 'backtest' && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#4a5a8a]">Period:</p>
              <div className="flex gap-1">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                      period === p ? 'bg-gold-500 text-navy-900 font-bold' : 'bg-navy-800 text-[#4a5a8a] hover:text-slate-200',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="rounded-lg bg-red-400/10 border border-red-400/30 px-3 py-2 text-xs text-red-400">{error}</p>}

          {/* Action button */}
          <button
            onClick={activeTab === 'screener' ? handleRunScreener : handleRunBacktest}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Running…</>
            ) : activeTab === 'screener' ? (
              <><Play className="h-4 w-4" /> Run Screener</>
            ) : (
              <><BarChart2 className="h-4 w-4" /> Run Backtest</>
            )}
          </button>
        </Card>
      )}

      {/* ── Screener Results ───────────────────────────────────────────── */}
      {activeTab === 'screener' && screenerResult && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#1e2d5a] px-4 py-3">
            <Search className="h-4 w-4 text-gold-500" />
            <span className="text-sm font-semibold text-white">Results</span>
            <Badge className="bg-gold-500/20 text-gold-400 border border-gold-500/30 ml-1">
              {screenerResult.matched} / {screenerResult.scanned} matched
            </Badge>
          </div>
          <ScreenerResultsTable results={screenerResult.results} />
        </Card>
      )}

      {/* ── Backtest Results ──────────────────────────────────────────── */}
      {activeTab === 'backtest' && backtestResult && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-gold-500" />
            <span className="text-sm font-semibold text-white">Backtest Results</span>
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 ml-1">
              {period} · {interval}
            </Badge>
          </div>
          <BacktestSummary result={backtestResult} />
        </Card>
      )}

      {/* ── Presets ──────────────────────────────────────────────────── */}
      {activeTab === 'presets' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {presets.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-sm text-[#4a5a8a]">
              <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-2" />
              Loading presets…
            </div>
          ) : presets.map((preset) => (
            <Card key={preset.id} className="p-4 hover:border-gold-500/30 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3.5 w-3.5 text-gold-400 flex-shrink-0" />
                    <p className="text-sm font-semibold text-white truncate">{preset.name}</p>
                  </div>
                  <p className="text-xs text-[#4a5a8a] leading-relaxed">{preset.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {preset.conditions.map((c, i) => (
                      <Badge key={i} className="bg-navy-800 text-[#4a5a8a] border border-[#1e2d5a]">
                        {c.pattern ? c.pattern.replace(/_/g, ' ') : `${c.indicator?.toUpperCase()} ${c.operator} ${c.compare_to?.toUpperCase() ?? c.value}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="flex-shrink-0 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400 hover:bg-gold-500/20 transition-colors"
                >
                  Apply
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
