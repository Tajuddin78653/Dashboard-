'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Play, RefreshCw,
  ArrowUpRight, ArrowDownRight, Activity, AlertCircle, Clock, Zap,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getEmaLatest, runEmaScanner } from '@/lib/api';
import type { EmaScanResult, EmaScanStock } from '@/lib/api';

// ─── market hours helper (IST) ────────────────────────────────────────────
function isMarketOpen(): boolean {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const day = ist.getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const h = ist.getUTCHours();
  const m = ist.getUTCMinutes();
  const mins = h * 60 + m;
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Kolkata',
    }) + ' IST';
  } catch { return iso; }
}

// ─── sub-components ───────────────────────────────────────────────────────

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
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#4a5a8a]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, i) => (
            <tr key={s.symbol}
              className={cn('border-b border-[#1e2d5a]/50 transition-colors hover:bg-navy-700/40',
                i % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/30')}>
              <td className="px-4 py-3 font-semibold text-white">{s.symbol}</td>
              <td className="px-4 py-3 font-mono text-slate-300">
                {s.close != null ? `\u20b9${s.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
              </td>
              <td className="px-4 py-3 font-mono text-emerald-400">{s.ema13 != null ? s.ema13.toFixed(2) : '-'}</td>
              <td className="px-4 py-3 font-mono text-slate-400">{s.ema50 != null ? s.ema50.toFixed(2) : '-'}</td>
              <td className={cn('px-4 py-3 font-mono font-semibold', s.rsi != null && s.rsi > 50 ? 'text-emerald-400' : 'text-red-400')}>
                {s.rsi != null ? s.rsi.toFixed(1) : '-'}
              </td>
              <td className={cn('px-4 py-3 font-mono text-xs',
                s.macd != null && s.macd_signal != null
                  ? (s.macd > s.macd_signal ? 'text-emerald-400' : 'text-red-400')
                  : 'text-[#4a5a8a]')}>
                {s.macd != null ? s.macd.toFixed(3) : '-'}
              </td>
              <td className="px-4 py-3">
                {type === 'BUY'
                  ? <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs"><ArrowUpRight className="h-3 w-3" /> BUY</span>
                  : <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs"><ArrowDownRight className="h-3 w-3" /> SELL</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000; // poll Redis cache every 60s during market hours

export function EmaScanner() {
  const [result, setResult]       = useState<EmaScanResult | null>(null);
  const [scanning, setScanning]   = useState(false);  // manual scan in progress
  const [loading, setLoading]     = useState(true);   // initial load
  const [error, setError]         = useState<string | null>(null);
  const [tab, setTab]             = useState<'BUY' | 'SELL'>('BUY');
  const [marketOpen, setMarketOpen] = useState(isMarketOpen());
  const [nextRefresh, setNextRefresh] = useState(60);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load cached result from Redis on mount
  const loadLatest = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getEmaLatest();
      if (data) {
        setResult(data);
        if (data.market_trend === 'BEARISH') setTab('SELL');
        else setTab('BUY');
      }
      setError(null);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Failed to load scan');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Manual scan trigger (for off-market hours)
  async function handleManualScan() {
    setScanning(true);
    setError(null);
    try {
      const data = await runEmaScanner();
      setResult(data);
      if (data.market_trend === 'BEARISH') setTab('SELL');
      else setTab('BUY');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  }

  // On mount: load cache + start auto-poll if market is open
  useEffect(() => {
    const open = isMarketOpen();
    setMarketOpen(open);
    loadLatest(false);

    if (open) {
      // Poll Redis cache every 60s (backend updates it every 5min via scheduler)
      setNextRefresh(60);
      pollRef.current = setInterval(() => {
        loadLatest(true);
        setNextRefresh(60);
      }, POLL_INTERVAL_MS);

      // Countdown ticker
      countRef.current = setInterval(() => {
        setNextRefresh(prev => (prev <= 1 ? 60 : prev - 1));
      }, 1000);
    }

    // Check market status every minute
    const marketCheck = setInterval(() => {
      const nowOpen = isMarketOpen();
      setMarketOpen(nowOpen);
      if (!nowOpen && pollRef.current) {
        clearInterval(pollRef.current);
        clearInterval(countRef.current!);
        pollRef.current = null;
      }
    }, 60_000);

    return () => {
      if (pollRef.current)  clearInterval(pollRef.current);
      if (countRef.current) clearInterval(countRef.current);
      clearInterval(marketCheck);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white font-semibold">13 / 50 EMA Crossover Scanner</p>
          <p className="text-xs text-[#4a5a8a] mt-0.5">
            Strict crossover · MACD · RSI(14) crosses 50 · 5-min chart · 180 F&amp;O stocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Market status badge */}
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
            marketOpen
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-[#1e2d5a]/60 border-[#1e2d5a] text-[#4a5a8a]',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', marketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-[#4a5a8a]')} />
            {marketOpen ? 'Market Open' : 'Market Closed'}
          </span>

          {/* Auto-refresh indicator during market hours */}
          {marketOpen && (
            <span className="inline-flex items-center gap-1 text-xs text-[#4a5a8a]">
              <RefreshCw className="h-3 w-3" /> Auto-refresh in {nextRefresh}s
            </span>
          )}

          {/* Manual scan button — always visible, essential during off-hours */}
          <Button variant={marketOpen ? 'ghost' : 'primary'} size="sm"
            onClick={handleManualScan} disabled={scanning}>
            {scanning
              ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Scanning...</>
              : <><Play className="h-3.5 w-3.5 mr-1.5" />{marketOpen ? 'Refresh Now' : 'Run Scanner'}</>
            }
          </Button>
        </div>
      </div>

      {/* Initial loading */}
      {loading && (
        <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/40 px-4 py-6 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-gold-400 animate-spin mx-auto" />
          <p className="text-sm text-[#4a5a8a]">Loading latest scan...</p>
        </div>
      )}

      {/* Manual scan in progress */}
      {scanning && (
        <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/40 px-4 py-6 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-gold-400 animate-spin mx-auto" />
          <p className="text-sm text-white font-medium">Scanning 180 F&O stocks...</p>
          <p className="text-xs text-[#4a5a8a]">Fetching 5-min charts · Running EMA / MACD / RSI · ~30–60s</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && !scanning && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Idle — no cache yet */}
      {!result && !loading && !scanning && !error && (
        <div className="rounded-lg border border-dashed border-[#1e2d5a] bg-navy-800/20 px-4 py-10 text-center">
          <Activity className="h-8 w-8 text-[#4a5a8a] mx-auto mb-2" />
          {marketOpen
            ? <p className="text-sm text-[#4a5a8a]">Auto-scan will populate results every 5 min.<br />Click <span className="text-white font-semibold">Refresh Now</span> to load immediately.</p>
            : <p className="text-sm text-[#4a5a8a]">Market is closed. Click <span className="text-white font-semibold">Run Scanner</span> to scan manually.</p>
          }
        </div>
      )}

      {/* Results */}
      {result && !loading && !scanning && (
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
                <TrendingUp className="h-4 w-4" />{result.buy_count}
              </p>
            </div>
            <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/50 px-4 py-3">
              <p className="text-xs text-[#4a5a8a]">SELL Signals</p>
              <p className="text-lg font-bold text-red-400 mt-0.5 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />{result.sell_count}
              </p>
            </div>
          </div>

          {/* Last scanned timestamp */}
          {'scanned_at' in result && (result as any).scanned_at && (
            <div className="flex items-center gap-1.5 text-xs text-[#4a5a8a]">
              <Clock className="h-3 w-3" />
              Last scanned: <span className="text-slate-400">{fmtTime((result as any).scanned_at)}</span>
              {marketOpen && <span className="text-[#4a5a8a]"> · next auto-refresh in {nextRefresh}s</span>}
            </div>
          )}

          {/* BUY / SELL tab toggle */}
          <div className="flex gap-2">
            {(['BUY', 'SELL'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border',
                  tab === t
                    ? t === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-navy-800 text-[#4a5a8a] hover:text-slate-200 border-[#1e2d5a]',
                )}>
                {t === 'BUY' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {t} <span className="font-mono text-xs">({t === 'BUY' ? result.buy_count : result.sell_count})</span>
              </button>
            ))}
          </div>

          {/* Results table */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
              {tab === 'BUY'
                ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                : <TrendingDown className="h-4 w-4 text-red-400" />}
              <h3 className="text-sm font-semibold text-white">
                {tab === 'BUY' ? 'BUY Crossover Signals' : 'SELL Crossover Signals'}
              </h3>
              <span className="ml-auto text-xs text-[#4a5a8a]">
                {tab === 'BUY' ? result.buy_count : result.sell_count} stocks
              </span>
            </div>
            <StockTable stocks={tab === 'BUY' ? result.buy_signals : result.sell_signals} type={tab} />
          </Card>

          {/* Conditions legend */}
          <div className="rounded-lg border border-[#1e2d5a] bg-navy-800/30 px-4 py-3 text-xs text-[#4a5a8a] space-y-1">
            <p className="text-white font-medium text-xs mb-1">Signal Conditions (all 3 required)</p>
            <p>&#9312; <span className="text-slate-300">Strict EMA crossover</span> — EMA13 crosses EMA50 on last closed 5-min bar</p>
            <p>&#9313; <span className="text-slate-300">MACD confirmation</span> — MACD line crosses signal line in same direction</p>
            <p>&#9314; <span className="text-slate-300">RSI(14) crosses 50</span> — RSI flips above 50 (BUY) or below 50 (SELL)</p>
          </div>

        </div>
      )}
    </div>
  );
}