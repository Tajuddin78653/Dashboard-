'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Play, RefreshCw,
  ArrowUpRight, ArrowDownRight, Activity, AlertCircle,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { runEmaScanner } from '@/lib/api';
import type { EmaScanResult, EmaScanStock } from '@/lib/api';

// ─── helpers ───────────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: string }) {
  const cfg = {
    BULLISH:  { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: '▲ BULLISH' },
    BEARISH:  { cls: 'bg-red-500/10 border-red-500/20 text-red-400',             label: '▼ BEARISH' },
    SIDEWAYS: { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400',       label: '→ SIDEWAYS' },
  }[trend] ?? { cls: 'bg-navy-700 border-[#1e2d5a] text-[#4a5a8a]', label: trend };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function StockTable({ stocks, type }: { stocks: EmaScanStock[]; type: 'BUY' | 'SELL' }) {
  const isBuy = type === 'BUY';
  if (stocks.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-[#4a5a8a]">
        No {type} crossovers detected in this scan
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[#1e2d5a] bg-navy-800/60">
            {['Symbol', 'Price', 'EMA 13', 'EMA 50', 'RSI 14', 'MACD', 'Signal'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#4a5a8a]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, i) => (
            <tr
              key={s.symbol}
              className={cn(
                'border-b border-[#1e2d5a]/50 transition-colors hover:bg-navy-700/40',
                i % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/30',
              )}
            >
              <td className="px-4 py-3 font-semibold text-white">{s.symbol}</td>
              <td className="px-4 py-3 font-mono text-slate-300">
                {s.close != null ? `₹${s.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
              </td>
              <td className="px-4 py-3 font-mono text-emerald-400">
                {s.ema13 != null ? s.ema13.toFixed(2) : '-'}
              </td>
              <td className="px-4 py-3 font-mono text-slate-400">
                {s.ema50 != null ? s.ema50.toFixed(2) : '-'}
              </td>
              <td className={cn('px-4 py-3 font-mono font-semibold',
                s.rsi != null && s.rsi > 50 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {s.rsi != null ? s.rsi.toFixed(1) : '-'}
              </td>
              <td className={cn('px-4 py-3 font-mono text-xs',
                s.macd != null && s.macd_signal != null
                  ? (s.macd > s.macd_signal ? 'text-emerald-400' : 'text-red-400')
                  : 'text-[#4a5a8a]'
              )}>
                {s.macd != null ? s.macd.toFixed(3) : '-'}
              </td>
              <td className="px-4 py-3">
                {isBuy ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                    <ArrowUpRight className="h-3 w-3" /> BUY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                    <ArrowDownRight className="h-3 w-3" /> SELL
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────

export function EmaScanner() {
  const [result, setResult]   = useState<EmaScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<'BUY' | 'SELL'>('BUY');

  async function handleScan() {
    setLoading(true);
    setError(null);
    try {
      const data = await runEmaScanner();
      setResult(data);
      // Auto-select tab based on market trend
      if (data.market_trend === 'BEARISH') setTab('SELL');
      else setTab('BUY');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Header row ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white font-semibold">13 / 50 EMA Crossover Scanner</p>
          <p className="text-xs text-[#4a5a8a] mt-0.5">
            Strict crossover · MACD confirmation · RSI(14) crosses 50 · 5-min chart · 180 F&amp;O stocks
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleScan}
          disabled={loading}
        >
          {loading
            ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Scanning...</>
            : <><Play className="h-3.5 w-3.5 mr-1.5" />Run Scanner</>
          }
        </Button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/40 px-4 py-6 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-gold-400 animate-spin mx-auto" />
          <p className="text-sm text-white font-medium">Scanning 180 F&O stocks...</p>
          <p className="text-xs text-[#4a5a8a]">Fetching 5-min charts · Running EMA / MACD / RSI · ~30–60s</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Idle prompt ── */}
      {!result && !loading && !error && (
        <div className="rounded-lg border border-dashed border-[#1e2d5a] bg-navy-800/20 px-4 py-10 text-center">
          <Activity className="h-8 w-8 text-[#4a5a8a] mx-auto mb-2" />
          <p className="text-sm text-[#4a5a8a]">Click <span className="text-white font-semibold">Run Scanner</span> to scan all 180 F&amp;O stocks</p>
          <p className="text-xs text-[#4a5a8a] mt-1">Works during and outside market hours</p>
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <div className="space-y-4">

          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/50 px-4 py-3">
              <p className="text-xs text-[#4a5a8a]">Market Trend</p>
              <div className="mt-1.5"><TrendBadge trend={result.market_trend} /></div>
            </div>
            <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/50 px-4 py-3">
              <p className="text-xs text-[#4a5a8a]">Scanned</p>
              <p className="text-lg font-bold text-white mt-0.5">{result.total_scanned}</p>
            </div>
            <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/50 px-4 py-3">
              <p className="text-xs text-[#4a5a8a]">BUY Signals</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> {result.buy_count}
              </p>
            </div>
            <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/50 px-4 py-3">
              <p className="text-xs text-[#4a5a8a]">SELL Signals</p>
              <p className="text-lg font-bold text-red-400 mt-0.5 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" /> {result.sell_count}
              </p>
            </div>
          </div>

          {/* BUY / SELL tab toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('BUY')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                tab === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-navy-800 text-[#4a5a8a] hover:text-slate-200 border border-[#1e2d5a]',
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              BUY <span className="font-mono text-xs">({result.buy_count})</span>
            </button>
            <button
              onClick={() => setTab('SELL')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                tab === 'SELL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-navy-800 text-[#4a5a8a] hover:text-slate-200 border border-[#1e2d5a]',
              )}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              SELL <span className="font-mono text-xs">({result.sell_count})</span>
            </button>
          </div>

          {/* Results table */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
              {tab === 'BUY'
                ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                : <TrendingDown className="h-4 w-4 text-red-400" />
              }
              <h3 className="text-sm font-semibold text-white">
                {tab === 'BUY' ? 'BUY Crossover Signals' : 'SELL Crossover Signals'}
              </h3>
              <span className="ml-auto text-xs text-[#4a5a8a]">
                {tab === 'BUY' ? result.buy_count : result.sell_count} stocks
              </span>
            </div>
            <StockTable
              stocks={tab === 'BUY' ? result.buy_signals : result.sell_signals}
              type={tab}
            />
          </Card>

          {/* Conditions legend */}
          <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/30 px-4 py-3 text-xs text-[#4a5a8a] space-y-1">
            <p className="text-white font-medium text-xs mb-1">Signal Conditions (all 3 required)</p>
            <p>① <span className="text-slate-300">Strict EMA crossover</span> — EMA13 crosses EMA50 on the last closed 5-min bar</p>
            <p>② <span className="text-slate-300">MACD confirmation</span> — MACD line crosses signal line in same direction</p>
            <p>③ <span className="text-slate-300">RSI(14) crosses 50</span> — RSI flips above 50 (BUY) or below 50 (SELL)</p>
          </div>

        </div>
      )}

    </div>
  );
}