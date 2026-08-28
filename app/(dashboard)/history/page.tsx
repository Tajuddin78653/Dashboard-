'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Target,
} from 'lucide-react';
import { Badge, Button, Card, Input, Select, StatCard } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui';
import { getTrades } from '@/lib/api';
import type { TradeResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return '–';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPnl(n: number | null | undefined): string {
  if (n == null) return '–';
  return (n >= 0 ? '+₹' : '-₹') + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

const STATUS_OPTIONS = [
  { value: '',          label: 'All Statuses'  },
  { value: 'target-hit',label: 'Target Hit'    },
  { value: 'sl-hit',    label: 'SL Hit'        },
  { value: 'exited',    label: 'Manual Exit'   },
  { value: 'entered',   label: 'Open'          },
  { value: 'cancelled', label: 'Cancelled'     },
];

const SIGNAL_TYPE_OPTIONS = [
  { value: '',     label: 'All Types' },
  { value: 'BUY',  label: 'BUY'       },
  { value: 'SELL', label: 'SELL'      },
];

const PAGE_SIZE = 20;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TradeHistoryPage() {
  const [trades, setTrades]         = useState<TradeResponse[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatus]       = useState('');
  const [signalType, setSignalType]     = useState('');
  const [symbolSearch, setSymbol]       = useState('');
  const [fromDate, setFromDate]         = useState('');
  const [toDate, setToDate]             = useState('');

  const fetchTrades = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page:      String(pg),
        page_size: String(PAGE_SIZE),
      };
      if (statusFilter) params.status      = statusFilter;
      if (signalType)   params.signal_type = signalType;
      if (symbolSearch) params.symbol      = symbolSearch;
      if (fromDate)     params.date_from   = fromDate;
      if (toDate)       params.date_to     = toDate;

      const data = await getTrades(params);
      setTrades(data.items);
      setTotal(data.total);
      setPage(pg);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, signalType, symbolSearch, fromDate, toDate]);

  useEffect(() => { fetchTrades(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived summary from current page ──────────────────────────────────────
  const closedTrades = trades.filter((t) => t.status !== 'entered' && t.status !== 'pending');
  const winners      = closedTrades.filter((t) => (t.net_pnl ?? 0) > 0);
  const losers       = closedTrades.filter((t) => (t.net_pnl ?? 0) < 0);
  const totalPnl     = trades.reduce((s, t) => s + (t.net_pnl ?? 0), 0);
  const winRate      = closedTrades.length > 0 ? ((winners.length / closedTrades.length) * 100).toFixed(1) : '–';

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startRow   = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow     = Math.min(page * PAGE_SIZE, total);

  const pagePills = (() => {
    const pills: number[] = [];
    let start = Math.max(1, page - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pills.push(i);
    return pills;
  })();

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
            <History className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">Trade History</h1>
            <p className="text-xs text-[#4a5a8a]">All closed & open trades from DB</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchTrades(page)} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* ── Summary Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Trades"  value={loading ? '…' : String(total)}             icon={History}     />
        <StatCard label="Winners"       value={loading ? '…' : String(winners.length)}    icon={TrendingUp}  className="[&_p]:text-green-400" />
        <StatCard label="Losers"        value={loading ? '…' : String(losers.length)}     icon={TrendingDown} className="[&_p]:text-red-400" />
        <StatCard
          label="Net P&L (page)"
          value={loading ? '…' : fmtPnl(totalPnl)}
          icon={IndianRupee}
          className={totalPnl >= 0 ? '[&_p]:text-green-400' : '[&_p]:text-red-400'}
        />
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Input label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} wrapperClassName="min-w-[130px]" />
            <Input label="To"   type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)}   wrapperClassName="min-w-[130px]" />
          </div>
          <Select label="Status"      options={STATUS_OPTIONS}      value={statusFilter} onChange={(e) => setStatus(e.target.value)}     wrapperClassName="min-w-[130px]" />
          <Select label="Signal Type" options={SIGNAL_TYPE_OPTIONS} value={signalType}   onChange={(e) => setSignalType(e.target.value)} wrapperClassName="min-w-[120px]" />
          <Input  label="Symbol" icon={Search} placeholder="Search symbol…" value={symbolSearch} onChange={(e) => setSymbol(e.target.value)} wrapperClassName="min-w-[150px] flex-1" />
          <div className="flex gap-2 pb-0.5">
            <Button variant="primary" size="sm" onClick={() => fetchTrades(1)}>Apply</Button>
            <Button variant="ghost"   size="sm" onClick={() => { setStatus(''); setSignalType(''); setSymbol(''); setFromDate(''); setToDate(''); setTimeout(() => fetchTrades(1), 0); }}>Clear</Button>
          </div>
        </div>
      </Card>

      {/* ── Error Banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex justify-between items-center">
          {error}
          <Button variant="ghost" size="sm" onClick={() => fetchTrades(1)}>Retry</Button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
          <History className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Trades</h2>
          {!loading && (
            <span className="ml-auto text-xs text-[#4a5a8a]">Showing {startRow}–{endRow} of {total}</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[#1e2d5a] bg-navy-800/60">
                {['#', 'Trade ID', 'Symbol', 'Type', 'Entry', 'Exit', 'Qty', 'Net P&L', 'Status', 'Exit Time'].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#4a5a8a]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-[#1e2d5a]/50">
                    {[...Array(10)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-navy-700 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-[#4a5a8a]">
                    No trades found — adjust filters or wait for trades to close
                  </td>
                </tr>
              ) : (
                trades.map((t, idx) => {
                  const pnl   = t.net_pnl ?? 0;
                  const isUp  = pnl >= 0;
                  const isClosed = t.status !== 'entered' && t.status !== 'pending';
                  return (
                    <tr
                      key={t.id}
                      className={cn(
                        'border-b border-[#1e2d5a]/50 transition-colors hover:bg-navy-700/40',
                        idx % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/30',
                      )}
                    >
                      <td className="px-4 py-3 text-xs text-[#4a5a8a] font-mono">{startRow + idx}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#4a5a8a]">{t.trade_id}</td>
                      <td className="px-4 py-3 font-semibold text-white">{t.symbol}</td>
                      <td className="px-4 py-3">
                        {t.signal_type === 'BUY' ? (
                          <span className="inline-flex items-center gap-1 text-green-400 font-semibold text-xs"><ArrowUpRight className="h-3 w-3" /> BUY</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs"><ArrowDownRight className="h-3 w-3" /> SELL</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-300">₹{fmtPrice(t.entry_price)}</td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-300">
                        {t.exit_price != null ? `₹${fmtPrice(t.exit_price)}` : '–'}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-300">{t.quantity}</td>
                      <td className={cn('px-4 py-3 font-mono text-sm font-semibold', isClosed ? (isUp ? 'text-green-400' : 'text-red-400') : 'text-[#4a5a8a]')}>
                        {isClosed ? fmtPnl(t.net_pnl) : '–'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={t.status as BadgeStatus} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#4a5a8a]">
                        {t.exit_time
                          ? new Date(t.exit_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                          : '–'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <p className="text-xs text-[#4a5a8a]">
          Showing <span className="font-semibold text-slate-300">{startRow}–{endRow}</span> of{' '}
          <span className="font-semibold text-slate-300">{total}</span> trades
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1 || loading} onClick={() => fetchTrades(page - 1)}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          {pagePills.map((p) => (
            <button
              key={p}
              onClick={() => fetchTrades(p)}
              className={cn(
                'h-7 min-w-[28px] rounded-md px-2 text-xs font-semibold transition-colors',
                p === page ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-[#4a5a8a] hover:bg-navy-700 hover:text-white border border-[#1e2d5a]',
              )}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-xs text-[#4a5a8a]">…</span>
              <button onClick={() => fetchTrades(totalPages)} className="h-7 min-w-[28px] rounded-md border border-[#1e2d5a] bg-navy-800 px-2 text-xs font-semibold text-[#4a5a8a] hover:bg-navy-700 hover:text-white">
                {totalPages}
              </button>
            </>
          )}
          <Button variant="ghost" size="sm" disabled={page >= totalPages || loading} onClick={() => fetchTrades(page + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
