'use client';

import { useState } from 'react';
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
import { Badge, Button, Card, Input, Select } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type SignalType = 'BUY' | 'SELL';

interface SignalRow {
  id: number;
  time: string;
  symbol: string;
  signalType: SignalType;
  entryPrice: string;
  strategy: string;
  status: BadgeStatus;
}

// ─── Mock Data — 20 rows ─────────────────────────────────────────────────────

const MOCK_SIGNALS: SignalRow[] = [
  { id: 1,  time: '09:16:04', symbol: 'RELIANCE',    signalType: 'BUY',  entryPrice: '2,847.50', strategy: '13/50 EMA',  status: 'entered'    },
  { id: 2,  time: '09:18:21', symbol: 'TCS',         signalType: 'SELL', entryPrice: '4,123.75', strategy: 'Gap D/U',    status: 'target-hit' },
  { id: 3,  time: '09:22:38', symbol: 'INFY',        signalType: 'BUY',  entryPrice: '1,892.30', strategy: 'ST+ADX',     status: 'pending'    },
  { id: 4,  time: '09:31:15', symbol: 'HDFCBANK',    signalType: 'BUY',  entryPrice: '1,674.80', strategy: 'Pro Engine', status: 'entered'    },
  { id: 5,  time: '09:45:02', symbol: 'ICICIBANK',   signalType: 'SELL', entryPrice: '1,248.60', strategy: '13/50 EMA',  status: 'sl-hit'     },
  { id: 6,  time: '09:52:44', symbol: 'SBIN',        signalType: 'BUY',  entryPrice: '812.45',   strategy: 'Gap D/U',    status: 'target-hit' },
  { id: 7,  time: '10:04:11', symbol: 'WIPRO',       signalType: 'SELL', entryPrice: '562.90',   strategy: 'ST+ADX',     status: 'pending'    },
  { id: 8,  time: '10:17:33', symbol: 'BHARTIARTL',  signalType: 'BUY',  entryPrice: '1,736.25', strategy: 'Pro Engine', status: 'entered'    },
  { id: 9,  time: '10:28:57', symbol: 'TATAMOTORS',  signalType: 'BUY',  entryPrice: '989.15',   strategy: '13/50 EMA',  status: 'target-hit' },
  { id: 10, time: '10:41:22', symbol: 'AXISBANK',    signalType: 'SELL', entryPrice: '1,182.70', strategy: 'Gap D/U',    status: 'pending'    },
  { id: 11, time: '10:55:08', symbol: 'LTIM',        signalType: 'BUY',  entryPrice: '5,610.00', strategy: 'ST+ADX',     status: 'entered'    },
  { id: 12, time: '11:03:47', symbol: 'NESTLEIND',   signalType: 'SELL', entryPrice: '2,294.50', strategy: 'Pro Engine', status: 'cancelled'  },
  { id: 13, time: '11:18:31', symbol: 'BAJFINANCE',  signalType: 'BUY',  entryPrice: '6,918.75', strategy: '13/50 EMA',  status: 'entered'    },
  { id: 14, time: '11:34:59', symbol: 'MARUTI',      signalType: 'BUY',  entryPrice: '12,345.00','strategy': 'Gap D/U',  status: 'target-hit' },
  { id: 15, time: '11:47:22', symbol: 'TITAN',       signalType: 'SELL', entryPrice: '3,467.80', strategy: 'ST+ADX',     status: 'sl-hit'     },
  { id: 16, time: '12:02:14', symbol: 'ASIANPAINT',  signalType: 'BUY',  entryPrice: '2,831.40', strategy: 'Pro Engine', status: 'pending'    },
  { id: 17, time: '12:19:06', symbol: 'ULTRACEMCO',  signalType: 'SELL', entryPrice: '11,720.50','strategy': '13/50 EMA',status: 'entered'    },
  { id: 18, time: '12:38:43', symbol: 'POWERGRID',   signalType: 'BUY',  entryPrice: '318.60',   strategy: 'Gap D/U',    status: 'target-hit' },
  { id: 19, time: '12:55:19', symbol: 'NTPC',        signalType: 'BUY',  entryPrice: '364.25',   strategy: 'ST+ADX',     status: 'pending'    },
  { id: 20, time: '13:07:52', symbol: 'COALINDIA',   signalType: 'SELL', entryPrice: '456.90',   strategy: 'Pro Engine', status: 'cancelled'  },
];

// ─── Select options ───────────────────────────────────────────────────────────

const STRATEGY_OPTIONS = [
  { value: '',            label: 'All Strategies' },
  { value: '13/50 EMA',   label: '13/50 EMA'      },
  { value: 'Gap D/U',     label: 'Gap D/U'         },
  { value: 'ST+ADX',      label: 'ST+ADX'          },
  { value: 'Pro Engine',  label: 'Pro Engine'      },
];

const SIGNAL_TYPE_OPTIONS = [
  { value: '',     label: 'All Types' },
  { value: 'BUY',  label: 'BUY'       },
  { value: 'SELL', label: 'SELL'      },
];

// ─── Stats strip data ─────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total',  value: '1,247' },
  { label: 'Today',  value: '23'    },
  { label: 'Buy',    value: '14'    },
  { label: 'Sell',   value: '9'     },
];

// ─── Page component ───────────────────────────────────────────────────────────

export default function SignalsPage() {
  // Filter state (UI only — no actual filtering logic)
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');
  const [strategy, setStrategy]   = useState('');
  const [signalType, setSignalType] = useState('');
  const [symbolSearch, setSymbolSearch] = useState('');

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
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

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
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

          {/* Strategy dropdown */}
          <Select
            label="Strategy"
            options={STRATEGY_OPTIONS}
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
            <Button variant="primary" size="sm">Apply Filters</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setStrategy('');
                setSignalType('');
                setSymbolSearch('');
              }}
            >
              Clear
            </Button>
          </div>

        </div>
      </Card>

      {/* ── Stats Strip ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {STATS.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-lg border border-[#1e2d5a] bg-navy-800 px-4 py-2"
          >
            <span className="text-xs font-medium text-[#4a5a8a] uppercase tracking-wide">{label}</span>
            <span className="font-mono text-sm font-semibold text-gold-400">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Signals Table ──────────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">

        {/* Table header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d5a]">
          <Zap className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Signals</h2>
          <span className="ml-auto text-xs text-[#4a5a8a]">Showing 1–20 of 1,247</span>
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
              {MOCK_SIGNALS.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-[#1e2d5a]/50 transition-colors hover:bg-navy-700/40',
                    idx % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800/30',
                    // First 2 rows get the "new signal" pulse animation via a left-border
                    idx < 2 && 'animate-pulse-gold',
                  )}
                >
                  {/* # */}
                  <td className="px-4 py-3 text-xs text-[#4a5a8a] font-mono">{row.id}</td>

                  {/* Time */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{row.time}</td>

                  {/* Symbol */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white tracking-wide">{row.symbol}</span>
                  </td>

                  {/* Signal Type */}
                  <td className="px-4 py-3">
                    {row.signalType === 'BUY' ? (
                      <span className="inline-flex items-center gap-1 text-green-400 font-semibold text-xs">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        BUY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        SELL
                      </span>
                    )}
                  </td>

                  {/* Entry Price */}
                  <td className="px-4 py-3 font-mono text-sm text-slate-200">
                    ₹{row.entryPrice}
                  </td>

                  {/* Strategy */}
                  <td className="px-4 py-3 text-xs text-[#4a5a8a]">{row.strategy}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge status={row.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="View signal"
                        className="rounded p-1.5 text-[#4a5a8a] transition-colors hover:bg-navy-700 hover:text-gold-400 focus-gold focus-visible:outline-none"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        aria-label="Edit signal"
                        className="rounded p-1.5 text-[#4a5a8a] transition-colors hover:bg-navy-700 hover:text-gold-400 focus-gold focus-visible:outline-none"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </Card>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <p className="text-xs text-[#4a5a8a]">
          Showing <span className="font-semibold text-slate-300">1–20</span> of{' '}
          <span className="font-semibold text-slate-300">1,247</span> signals
        </p>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          {/* Page pills */}
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={cn(
                'h-7 min-w-[28px] rounded-md px-2 text-xs font-semibold transition-colors focus-gold focus-visible:outline-none',
                page === 1
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-navy-800 text-[#4a5a8a] hover:bg-navy-700 hover:text-white border border-[#1e2d5a]',
              )}
            >
              {page}
            </button>
          ))}

          <span className="text-xs text-[#4a5a8a]">…</span>

          <button className="h-7 min-w-[28px] rounded-md border border-[#1e2d5a] bg-navy-800 px-2 text-xs font-semibold text-[#4a5a8a] transition-colors hover:bg-navy-700 hover:text-white focus-gold focus-visible:outline-none">
            63
          </button>

          <Button variant="ghost" size="sm">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
