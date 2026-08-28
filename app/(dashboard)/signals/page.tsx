'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button, Card, Input, Select, Skeleton, EmptyState } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui';
import { getSignals, getStrategies } from '@/lib/api';
import type { SignalResponse, StrategyResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Select options (static) ─────────────────────────────────────────────────

const SIGNAL_TYPE_OPTIONS = [
  { value: '',     label: 'All Types' },
  { value: 'BUY',  label: 'BUY'       },
  { value: 'SELL', label: 'SELL'      },
];

const PAGE_SIZE = 20;

// ─── Page component ───────────────────────────────────────────────────────────

export default function SignalsPage() {
  const [fromDate, setFromDate]       = useState('');
  const [toDate, setToDate]           = useState('');
  const [strategy, setStrategy]       = useState('');
  const [signalType, setSignalType]   = useState('');
  const [symbolSearch, setSymbolSearch] = useState('');

  const [signals, setSignals]         = useState<SignalResponse[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);

  // Strategies for dropdown and name lookup
  const [strategies, setStrategies]   = useState<StrategyResponse[]>([]);
  const [strategyMap, setStrategyMap] = useState<Record<string, string>>({});

  // Load strategies once on mount
  useEffect(() => {
    getStrategies()
      .then((list) => {
        setStrategies(list);
        const map: Record<string, string> = {};
        list.forEach((s) => { map[s.id] = s.name; });
        setStrategyMap(map);
      })
      .catch(() => {});
  }, []);

  const strategyOptions = [
    { value: '', label: 'All Strategies' },
    ...strategies.map((s) => ({ value: s.id, label: s.name })),
  ];

  // Derived stats from current page + totals
  const buyCount  = signals.filter((s) => s.signal_type === 'BUY').length;
  const sellCount = signals.filter((s) => s.signal_type === 'SELL').length;

  const fetchSignals = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page:      String(pg),
        page_size: String(PAGE_SIZE),
      };
      if (symbolSearch) params.symbol      = symbolSearch;
      if (signalType)   params.signal_type = signalType;
      if (strategy)     params.strategy_id = strategy;
      if (fromDate)     params.date_from   = fromDate;
      if (toDate)       params.date_to     = toDate;

      const data = await getSignals(params);
      setSignals(data.items);
      setTotal(data.total);
      setPage(pg);
    } catch {
      /* keep existing rows on error */
    } finally {
      setLoading(false);
    }
  }, [symbolSearch, signalType, strategy, fromDate, toDate]);

  // Initial load
  useEffect(() => {
    fetchSignals(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startRow    = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow      = Math.min(page * PAGE_SIZE, total);

  // Build visible page pills (max 5)
  const pagePills = (() => {
    const pills: number[] = [];
    const half = 2;
    let start = Math.max(1, page - half);
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
            <Zap className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">Live Signals</h1>
            <p className="text-xs text-[#4a5a8a]">Real-time Chartink webhook signals</p>
          </div>
        </div>

        {/* LIVE indicator */}
        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold tracking-widest text-green-400">LIVE</span>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Date range */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Input
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              wrapperClassName="min-w-[130px]"
            />
            <Input
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              wrapperClassName="min-w-[130px]"
            />
          </div>

          {/* Strategy dropdown (loaded from API) */}
          <Select
            label="Strategy"
            options={strategyOptions}
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            wrapperClassName="min-w-[150px]"
          />

          {/* Signal type dropdown */}
          <Select
            label="Signal Type"
            options={SIGNAL_TYPE_OPTIONS}
            value={signalType}
            onChange={(e) => setSignalType(e.target.value)}
            wrapperClassName="min-w-[120px]"
          />

          {/* Symbol search */}
          <Input
            label="Symbol"
            icon={Search}
            placeholder="Search symbol..."
            value={symbolSearch}
            onChange={(e) => setSymbolSearch(e.target.value)}
            wrapperClassName="min-w-[160px] flex-1"
          />

          {/* Action buttons */}
          <div className="flex gap-2 pb-0.5">
            <Button variant="primary" size="sm" onClick={() => fetchSignals(1)}>
              Apply Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setStrategy('');
                setSignalType('');
                setSymbolSearch('');
                setTimeout(() => fetchSignals(1), 0);
              }}
            >
              Clear
            </Button>
          </div>

        </div>
      </Card>

      {/* ── Stats Strip (live from API) ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total',  value: loading ? '…' : String(total)     },
          { label: 'Page',   value: loading ? '…' : `${startRow}–${endRow}` },
          { label: 'Buy',    value: loading ? '…' : String(buyCount)  },
          { label: 'Sell',   value: loading ? '…' : String(sellCount) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-lg border border-[#1e2d5a] bg-navy-800 px-4 py-2"
          >
            <span className="text-xs font-medium text-[#4a5a8a] uppercase tracking-wide">{label}</span>
            <span className="font-mono text-sm font-semibold text-gold-400">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Signals Table ────────────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">

        {/* Table header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
          <Zap className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Signals</h2>
          {!loading && (
            <span className="ml-auto text-xs text-[#4a5a8a]">
              Showing {startRow}–{endRow} of {total}
            </span>
          )}
        </div>

        {/* Scrollable wrapper for mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[#1e2d5a] bg-navy-800/60">
                {['#', 'Time', 'Symbol', 'Signal Type', 'Entry Price', 'Strategy', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#4a5a8a]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-[#1e2d5a]/50">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-navy-700 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : signals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted text-sm">
                    No signals found
                  </td>
                </tr>
              ) : (
                signals.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-[#1e2d5a]/50 transition-colors hover:bg-navy-700/40',
                      idx % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/30',
                      idx < 2 && 'animate-pulse-gold',
                    )}
                  >
                    <td className="px-4 py-3 text-xs text-[#4a5a8a] font-mono">
                      {startRow + idx}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">
                      {new Date(row.timestamp).toLocaleTimeString('en-IN', {
                        hour:   '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white tracking-wide">{row.symbol}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.signal_type === 'BUY' ? (
                        <span className="inline-flex items-center gap-1 text-green-400 font-semibold text-xs">
                          <ArrowUpRight className="h-3.5 w-3.5" /> BUY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                          <ArrowDownRight className="h-3.5 w-3.5" /> SELL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-200">
                      {row.entry_price != null
                        ? `₹${row.entry_price.toLocaleString('en-IN')}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4a5a8a]">
                      {row.strategy_id
                        ? (strategyMap[row.strategy_id] ?? row.strategy_id)
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={row.status as BadgeStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          aria-label="View signal"
                          className="rounded p-1.5 text-[#4a5a8a] hover:bg-navy-700 hover:text-gold-400"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          aria-label="Edit signal"
                          className="rounded p-1.5 text-[#4a5a8a] hover:bg-navy-700 hover:text-gold-400"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </Card>

      {/* ── Pagination (dynamic) ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <p className="text-xs text-[#4a5a8a]">
          Showing{' '}
          <span className="font-semibold text-slate-300">{startRow}–{endRow}</span> of{' '}
          <span className="font-semibold text-slate-300">{total}</span> signals
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => fetchSignals(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          {pagePills.map((p) => (
            <button
              key={p}
              onClick={() => fetchSignals(p)}
              className={cn(
                'h-7 min-w-[28px] rounded-md px-2 text-xs font-semibold transition-colors focus-visible:outline-none',
                p === page
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-navy-800 text-[#4a5a8a] hover:bg-navy-700 hover:text-white border border-[#1e2d5a]',
              )}
            >
              {p}
            </button>
          ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-xs text-[#4a5a8a]">…</span>
              <button
                onClick={() => fetchSignals(totalPages)}
                className="h-7 min-w-[28px] rounded-md border border-[#1e2d5a] bg-navy-800 px-2 text-xs font-semibold text-[#4a5a8a] transition-colors hover:bg-navy-700 hover:text-white"
              >
                {totalPages}
              </button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchSignals(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
