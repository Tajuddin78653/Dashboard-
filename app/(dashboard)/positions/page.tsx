'use client';

import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Edit2,
} from 'lucide-react';
import { Badge, Button, Card, StatCard } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  id: string;
  symbol: string;
  entry: number;
  cmp: number;
  qty: number;
  target: number;
  sl: number;
  status: 'entered';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const POSITIONS: Position[] = [
  { id: 'TRD-001', symbol: 'RELIANCE',   entry: 2850, cmp: 2921, qty: 10, target: 2980, sl: 2750, status: 'entered' },
  { id: 'TRD-002', symbol: 'TCS',        entry: 3920, cmp: 3875, qty:  5, target: 4100, sl: 3800, status: 'entered' },
  { id: 'TRD-003', symbol: 'HDFCBANK',   entry: 1680, cmp: 1710, qty: 15, target: 1750, sl: 1640, status: 'entered' },
  { id: 'TRD-004', symbol: 'INFY',       entry: 1520, cmp: 1498, qty: 20, target: 1620, sl: 1480, status: 'entered' },
  { id: 'TRD-005', symbol: 'SBIN',       entry:  810, cmp:  835, qty: 25, target:  870, sl:  785, status: 'entered' },
  { id: 'TRD-006', symbol: 'WIPRO',      entry:  480, cmp:  469, qty: 30, target:  510, sl:  460, status: 'entered' },
  { id: 'TRD-007', symbol: 'ICICIBANK',  entry: 1190, cmp: 1215, qty: 12, target: 1260, sl: 1150, status: 'entered' },
  { id: 'TRD-008', symbol: 'BHARTIARTL', entry: 1340, cmp: 1368, qty:  8, target: 1410, sl: 1300, status: 'entered' },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

function calcMtm(p: Position): number {
  return (p.cmp - p.entry) * p.qty;
}

function calcPnlPct(p: Position): number {
  return ((p.cmp - p.entry) / p.entry) * 100;
}

function fmtPrice(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtAmount(n: number): string {
  return (n >= 0 ? '+' : '') + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── Computed summary values ──────────────────────────────────────────────────

const totalPnl = POSITIONS.reduce((sum, p) => sum + calcMtm(p), 0);

const byPnl = [...POSITIONS].sort((a, b) => calcMtm(b) - calcMtm(a));
const biggestWinner = byPnl[0];
const biggestLoser  = byPnl[byPnl.length - 1];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PositionsPage() {
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
            <p className="text-xs text-[#4a5a8a]">Currently active trades</p>
          </div>
        </div>

        {/* Badge: open count */}
        <div className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5">
          <span className="text-xs font-semibold tracking-widest text-gold-400">
            {POSITIONS.length} Open
          </span>
        </div>
      </div>

      {/* ── Summary Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Open Trades"
          value={String(POSITIONS.length)}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Unrealised P&L"
          value={`₹${fmtAmount(totalPnl)}`}
          icon={IndianRupee}
          className={totalPnl >= 0 ? '[&_p]:text-green-400' : '[&_p]:text-red-400'}
        />
        <StatCard
          label="Biggest Winner"
          value={`${biggestWinner.symbol} +₹${Math.abs(calcMtm(biggestWinner)).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          className="[&_p]:text-green-400 [&_p]:text-base"
        />
        <StatCard
          label="Biggest Loser"
          value={`${biggestLoser.symbol} -₹${Math.abs(calcMtm(biggestLoser)).toLocaleString('en-IN')}`}
          icon={TrendingDown}
          className="[&_p]:text-red-400 [&_p]:text-base"
        />
      </div>

      {/* ── Desktop Table (md+) ───────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Card className="p-0 overflow-hidden">

          {/* Card header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-white">Positions</h2>
            <span className="ml-auto text-xs text-[#4a5a8a]">{POSITIONS.length} active trades</span>
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
                {POSITIONS.map((pos) => {
                  const mtm    = calcMtm(pos);
                  const pnlPct = calcPnlPct(pos);
                  const isUp   = pnlPct >= 0;

                  return (
                    <tr
                      key={pos.id}
                      className={cn(
                        'border-b border-[#1e2d5a]/50 transition-colors hover:brightness-110',
                        isUp
                          ? 'bg-green-950/20 hover:bg-green-950/30'
                          : 'bg-red-950/20 hover:bg-red-950/30',
                      )}
                    >
                      {/* Trade ID */}
                      <td className="px-4 py-3 font-mono text-xs text-[#4a5a8a]">{pos.id}</td>

                      {/* Symbol */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white tracking-wide">{pos.symbol}</span>
                      </td>

                      {/* Entry Price */}
                      <td className="px-4 py-3 font-mono text-sm text-slate-300">
                        ₹{fmtPrice(pos.entry)}
                      </td>

                      {/* CMP */}
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-white">
                        ₹{fmtPrice(pos.cmp)}
                      </td>

                      {/* MTM */}
                      <td className={cn('px-4 py-3 font-mono text-sm font-semibold', isUp ? 'text-green-400' : 'text-red-400')}>
                        ₹{fmtAmount(mtm)}
                      </td>

                      {/* P&L % */}
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 font-mono text-xs font-semibold', isUp ? 'text-green-400' : 'text-red-400')}>
                          {isUp
                            ? <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" />
                            : <ArrowDownRight className="h-3.5 w-3.5 flex-shrink-0" />}
                          {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 font-mono text-sm text-green-400/80">
                        ₹{fmtPrice(pos.target)}
                      </td>

                      {/* Stop Loss */}
                      <td className="px-4 py-3 font-mono text-sm text-red-400/80">
                        ₹{fmtPrice(pos.sl)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge status={pos.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button variant="danger" size="sm">
                            <LogOut className="h-3 w-3" />
                            Exit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer total row */}
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
            </table>
          </div>

        </Card>
      </div>

      {/* ── Mobile Card View (below md) ───────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {POSITIONS.map((pos) => {
          const mtm    = calcMtm(pos);
          const pnlPct = calcPnlPct(pos);
          const isUp   = pnlPct >= 0;

          return (
            <Card
              key={pos.id}
              className={cn(
                'p-4',
                isUp ? 'border-green-900/60 bg-green-950/20' : 'border-red-900/60 bg-red-950/20',
              )}
            >
              {/* Card top: Symbol + Status */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-white tracking-wide">{pos.symbol}</p>
                  <p className="text-[10px] font-mono text-[#4a5a8a]">{pos.id}</p>
                </div>
                <Badge status={pos.status} />
              </div>

              {/* 2×2 grid: Entry | CMP | P&L% | MTM */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-md bg-navy-800/60 p-2">
                  <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">Entry</p>
                  <p className="font-mono text-sm font-semibold text-slate-200">₹{fmtPrice(pos.entry)}</p>
                </div>
                <div className="rounded-md bg-navy-800/60 p-2">
                  <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">CMP</p>
                  <p className="font-mono text-sm font-bold text-white">₹{fmtPrice(pos.cmp)}</p>
                </div>
                <div className="rounded-md bg-navy-800/60 p-2">
                  <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">P&amp;L %</p>
                  <p className={cn('font-mono text-sm font-bold inline-flex items-center gap-1', isUp ? 'text-green-400' : 'text-red-400')}>
                    {isUp
                      ? <ArrowUpRight className="h-3.5 w-3.5" />
                      : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-md bg-navy-800/60 p-2">
                  <p className="text-[10px] text-[#4a5a8a] uppercase tracking-wider mb-0.5">MTM</p>
                  <p className={cn('font-mono text-sm font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                    ₹{fmtAmount(mtm)}
                  </p>
                </div>
              </div>

              {/* Target / SL row */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 rounded-md bg-green-950/30 border border-green-900/40 p-2">
                  <p className="text-[10px] text-green-500/70 uppercase tracking-wider mb-0.5">Target</p>
                  <p className="font-mono text-sm font-semibold text-green-400">₹{fmtPrice(pos.target)}</p>
                </div>
                <div className="flex-1 rounded-md bg-red-950/30 border border-red-900/40 p-2">
                  <p className="text-[10px] text-red-500/70 uppercase tracking-wider mb-0.5">Stop Loss</p>
                  <p className="font-mono text-sm font-semibold text-red-400">₹{fmtPrice(pos.sl)}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="danger" size="sm" className="flex-1 justify-center">
                  <LogOut className="h-3.5 w-3.5" />
                  Exit
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 justify-center">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </Card>
          );
        })}

        {/* Mobile footer total */}
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
      </div>

    </div>
  );
}
