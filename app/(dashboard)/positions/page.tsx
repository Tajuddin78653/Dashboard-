'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Edit2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button, Card, StatCard } from '@/components/ui';
import { getOpenTrades, exitTrade } from '@/lib/api';
import type { OpenPositionResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return '–';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtAmount(n: number | null | undefined): string {
  if (n == null) return '–';
  return (n >= 0 ? '+' : '') +
    n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function isMarketHours(): boolean {
  const now = new Date();
  // IST offset = UTC+5:30
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const h = ist.getUTCHours();
  const m = ist.getUTCMinutes();
  const mins = h * 60 + m;
  // Market: 09:15 – 15:30 Mon–Fri
  const isWeekday = ist.getUTCDay() >= 1 && ist.getUTCDay() <= 5;
  return isWeekday && mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PositionsPage() {
  const [positions, setPositions]   = useState<OpenPositionResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [exitingId, setExitingId]   = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOpenTrades();
      setPositions(data);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load positions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  // Auto-refresh every 60 s during market hours
  useEffect(() => {
    if (!isMarketHours()) return;
    const id = setInterval(loadPositions, 60_000);
    return () => clearInterval(id);
  }, [loadPositions]);

  const handleExit = async (pos: OpenPositionResponse) => {
    const price = pos.current_price ?? pos.entry_price;
    if (!confirm(`Exit ${pos.symbol} @ ₹${fmtPrice(price)}?`)) return;
    setExitingId(pos.trade_id);
    try {
      await exitTrade(pos.trade_id, price, 'manual-exit');
      await loadPositions();
    } catch (e) {
      alert(`Exit failed: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setExitingId(null);
    }
  };

  // ── Derived summary ─────────────────────────────────────────────────────────
  const totalPnl = positions.reduce((s, p) => s + (p.mtm ?? 0), 0);

  const byMtm      = [...positions].sort((a, b) => (b.mtm ?? 0) - (a.mtm ?? 0));
  const bigWinner  = byMtm[0];
  const bigLoser   = byMtm[byMtm.length - 1];

  // ── Skeleton rows ───────────────────────────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {[...Array(3)].map((_, i) => (
        <tr key={i} className="border-b border-[#1e2d5a]/50">
          {[...Array(10)].map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-navy-700 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
            <TrendingUp className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">Open Positions</h1>
            <p className="text-xs text-[#4a5a8a]">
              Currently active trades
              {lastRefresh && (
                <span className="ml-2 text-[#3a4a7a]">
                  · updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPositions}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>

          {/* Badge: open count */}
          <div className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5">
            <span className="text-xs font-semibold tracking-widest text-gold-400">
              {loading ? '…' : `${positions.length} Open`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={loadPositions}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Summary Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Open Trades"
          value={loading ? '…' : String(positions.length)}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Unrealised P&L"
          value={loading ? '…' : `₹${fmtAmount(totalPnl)}`}
          icon={IndianRupee}
          className={totalPnl >= 0 ? '[&_p]:text-green-400' : '[&_p]:text-red-400'}
        />
        <StatCard
          label="Biggest Winner"
          value={
            loading || !bigWinner
              ? '–'
              : `${bigWinner.symbol} ₹${fmtAmount(bigWinner.mtm)}`
          }
          icon={TrendingUp}
          className="[&_p]:text-green-400 [&_p]:text-base"
        />
        <StatCard
          label="Biggest Loser"
          value={
            loading || !bigLoser
              ? '–'
              : `${bigLoser.symbol} ₹${fmtAmount(bigLoser.mtm)}`
          }
          icon={TrendingDown}
          className="[&_p]:text-red-400 [&_p]:text-base"
        />
      </div>

      {/* ── Desktop Table (md+) ──────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Card className="p-0 overflow-hidden">

          {/* Card header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Positions</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">
              {loading ? 'Loading…' : `${positions.length} active trade${positions.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-[#1e2d5a] bg-navy-800/60">
                  {[
                    'Trade ID', 'Symbol', 'Entry Price', 'CMP',
                    'MTM', 'P&L %', 'Target', 'Stop Loss', 'Status', 'Actions',
                  ].map((col) => (
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
                  <SkeletonRows />
                ) : positions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-sm text-[#4a5a8a]">
                      No open positions at the moment
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const isUp = (pos.pnl_pct ?? 0) >= 0;
                    return (
                      <tr
                        key={pos.trade_id}
                        className={cn(
                          'border-b border-[#1e2d5a]/50 transition-colors hover:brightness-110',
                          isUp
                            ? 'bg-green-950/20 hover:bg-green-950/30'
                            : 'bg-red-950/20 hover:bg-red-950/30',
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#4a5a8a]">{pos.trade_id}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-white tracking-wide">{pos.symbol}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-300">
                          ₹{fmtPrice(pos.entry_price)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-white">
                          {pos.current_price != null ? `₹${fmtPrice(pos.current_price)}` : '–'}
                        </td>
                        <td className={cn('px-4 py-3 font-mono text-sm font-semibold', isUp ? 'text-green-400' : 'text-red-400')}>
                          ₹{fmtAmount(pos.mtm)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 font-mono text-xs font-semibold', isUp ? 'text-green-400' : 'text-red-400')}>
                            {isUp
                              ? <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" />
                              : <ArrowDownRight className="h-3.5 w-3.5 flex-shrink-0" />}
                            {isUp ? '+' : ''}{(pos.pnl_pct ?? 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-green-400/80">
                          ₹{fmtPrice(pos.target_price)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-red-400/80">
                          ₹{fmtPrice(pos.stop_loss)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={pos.status as 'entered'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={exitingId === pos.trade_id}
                              onClick={() => handleExit(pos)}
                            >
                              <LogOut className="h-3 w-3" />
                              {exitingId === pos.trade_id ? 'Exiting…' : 'Exit'}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Footer total row */}
              {!loading && positions.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[#1e2d5a] bg-navy-800/60">
                    <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-[#4a5a8a] uppercase tracking-wider">
                      Total Unrealised P&amp;L
                    </td>
                    <td
                      colSpan={6}
                      className={cn(
                        'px-4 py-3 font-mono text-base font-bold',
                        totalPnl >= 0 ? 'text-gold-400' : 'text-red-400',
                      )}
                    >
                      ₹{fmtAmount(totalPnl)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

        </Card>
      </div>

      {/* ── Mobile Card View (below md) ──────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="h-5 w-32 rounded bg-navy-700 animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((__, j) => (
                  <div key={j} className="h-14 rounded-md bg-navy-700 animate-pulse" />
                ))}
              </div>
            </Card>
          ))
        ) : positions.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[#4a5a8a]">
            No open positions at the moment
          </Card>
        ) : (
          positions.map((pos) => {
            const isUp = (pos.pnl_pct ?? 0) >= 0;
            return (
              <Card
                key={pos.trade_id}
                className={cn(
                  'p-4',
                  isUp ? 'border-green-900/60 bg-green-950/20' : 'border-red-900/60 bg-red-950/20',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white tracking-wide">{pos.symbol}</p>
                    <p className="text-[10px] font-mono text-[#4a5a8a]">{pos.trade_id}</p>
                  </div>
                  <Badge status={pos.status as 'entered'} />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-md bg-navy-800/60 p-2">
                    <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">Entry</p>
                    <p className="font-mono text-sm font-semibold text-slate-200">₹{fmtPrice(pos.entry_price)}</p>
                  </div>
                  <div className="rounded-md bg-navy-800/60 p-2">
                    <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">CMP</p>
                    <p className="font-mono text-sm font-bold text-white">
                      {pos.current_price != null ? `₹${fmtPrice(pos.current_price)}` : '–'}
                    </p>
                  </div>
                  <div className="rounded-md bg-navy-800/60 p-2">
                    <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">P&amp;L %</p>
                    <p className={cn('font-mono text-sm font-bold inline-flex items-center gap-1', isUp ? 'text-green-400' : 'text-red-400')}>
                      {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {isUp ? '+' : ''}{(pos.pnl_pct ?? 0).toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-md bg-navy-800/60 p-2">
                    <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">MTM</p>
                    <p className={cn('font-mono text-sm font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                      ₹{fmtAmount(pos.mtm)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <div className="flex-1 rounded-md bg-green-950/30 border border-green-900/40 p-2">
                    <p className="text-[10px] text-green-500/70 uppercase tracking-wider mb-0.5">Target</p>
                    <p className="font-mono text-sm font-semibold text-green-400">₹{fmtPrice(pos.target_price)}</p>
                  </div>
                  <div className="flex-1 rounded-md bg-red-950/30 border border-red-900/40 p-2">
                    <p className="text-[10px] text-red-500/70 uppercase tracking-wider mb-0.5">Stop Loss</p>
                    <p className="font-mono text-sm font-semibold text-red-400">₹{fmtPrice(pos.stop_loss)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1 justify-center"
                    disabled={exitingId === pos.trade_id}
                    onClick={() => handleExit(pos)}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {exitingId === pos.trade_id ? 'Exiting…' : 'Exit'}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 justify-center">
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </Card>
            );
          })
        )}

        {/* Mobile footer total */}
        {!loading && positions.length > 0 && (
          <div className={cn(
            'flex items-center justify-between rounded-lg border px-4 py-3',
            totalPnl >= 0
              ? 'border-gold-500/30 bg-gold-500/10'
              : 'border-red-500/30 bg-red-500/10',
          )}>
            <span className="text-xs font-semibold text-[#4a5a8a] uppercase tracking-wider">
              Total Unrealised P&amp;L
            </span>
            <span className={cn('font-mono text-base font-bold', totalPnl >= 0 ? 'text-gold-400' : 'text-red-400')}>
              ₹{fmtAmount(totalPnl)}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
