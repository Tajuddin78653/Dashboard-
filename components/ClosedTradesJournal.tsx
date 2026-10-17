'use client';

import { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClosedTradeItem {
  id: string;
  symbol: string;
  scannerName: string;
  strategyName: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  pnlPct: number;
  exitReason: 'TARGET_HIT' | 'TRAILING_SL_HIT' | 'STOP_LOSS_HIT' | 'MANUAL_EXIT' | 'EOD_SQUAREOFF';
  entryTime: string;
  exitTime: string;
}

const MOCK_CLOSED_TRADES: ClosedTradeItem[] = [
  {
    id: 'TRD-88210',
    symbol: 'RELIANCE',
    scannerName: '15 Min Bullish Breakout',
    strategyName: 'Smart Captain',
    quantity: 40,
    entryPrice: 2845.0,
    exitPrice: 2887.65,
    realizedPnl: 1706.0,
    pnlPct: 1.5,
    exitReason: 'TARGET_HIT',
    entryTime: '09:35 AM',
    exitTime: '10:18 AM',
  },
  {
    id: 'TRD-88209',
    symbol: 'HDFCBANK',
    scannerName: 'VWAP Cross + High Vol',
    strategyName: 'Smart Captain',
    quantity: 80,
    entryPrice: 1510.0,
    exitPrice: 1532.65,
    realizedPnl: 1812.0,
    pnlPct: 1.5,
    exitReason: 'TARGET_HIT',
    entryTime: '09:20 AM',
    exitTime: '09:40 AM',
  },
  {
    id: 'TRD-88208',
    symbol: 'SBIN',
    scannerName: 'RSI Reversal Pullback',
    strategyName: 'Smart Captain',
    quantity: 100,
    entryPrice: 810.0,
    exitPrice: 801.9,
    realizedPnl: -810.0,
    pnlPct: -1.0,
    exitReason: 'STOP_LOSS_HIT',
    entryTime: '09:18 AM',
    exitTime: '09:55 AM',
  },
  {
    id: 'TRD-88207',
    symbol: 'BAJFINANCE',
    scannerName: 'Supertrend Buy',
    strategyName: 'Smart Captain',
    quantity: 15,
    entryPrice: 6950.0,
    exitPrice: 7005.0,
    realizedPnl: 825.0,
    pnlPct: 0.79,
    exitReason: 'TRAILING_SL_HIT',
    entryTime: '09:16 AM',
    exitTime: '09:38 AM',
  },
];

interface ClosedTradesJournalProps {
  trades?: ClosedTradeItem[];
}

export function ClosedTradesJournal({ trades = MOCK_CLOSED_TRADES }: ClosedTradesJournalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState<string>('ALL');

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.scannerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = filterReason === 'ALL' || t.exitReason === filterReason;
    return matchesSearch && matchesReason;
  });

  const getExitReasonBadge = (reason: ClosedTradeItem['exitReason']) => {
    switch (reason) {
      case 'TARGET_HIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            TARGET HIT
          </span>
        );
      case 'TRAILING_SL_HIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <TrendingUp className="h-3 w-3" />
            TRAILING SL
          </span>
        );
      case 'STOP_LOSS_HIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <AlertCircle className="h-3 w-3" />
            SL HIT
          </span>
        );
      case 'MANUAL_EXIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            MANUAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
            {reason}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800/80 bg-[#090f1e] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Closed Positions Journal
            </h3>
            <p className="text-[10px] text-slate-400">Execution logs &amp; settled P&amp;L</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search symbol/scan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Reason Filter */}
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Exits</option>
            <option value="TARGET_HIT">Target Hit</option>
            <option value="TRAILING_SL_HIT">Trailing SL</option>
            <option value="STOP_LOSS_HIT">Stop Loss</option>
            <option value="MANUAL_EXIT">Manual Exit</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-semibold">
              <th className="px-4 py-2.5">Symbol / Scanner</th>
              <th className="px-4 py-2.5">Qty</th>
              <th className="px-4 py-2.5">Entry Price</th>
              <th className="px-4 py-2.5">Exit Price</th>
              <th className="px-4 py-2.5">Exit Reason</th>
              <th className="px-4 py-2.5 text-right">Realized P&amp;L</th>
              <th className="px-4 py-2.5 text-right">Timestamps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredTrades.map((trade) => {
              const isProfit = trade.realizedPnl >= 0;
              return (
                <tr key={trade.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white text-xs">{trade.symbol}</div>
                    <div className="text-[10px] text-slate-400">{trade.scannerName}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{trade.quantity}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">₹{trade.entryPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-white">₹{trade.exitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">{getExitReasonBadge(trade.exitReason)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className={cn('font-mono font-bold flex items-center justify-end gap-1', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                      {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {isProfit ? '+' : ''}₹{trade.realizedPnl.toFixed(2)}
                    </div>
                    <div className={cn('text-[10px] font-mono', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                      ({isProfit ? '+' : ''}{trade.pnlPct.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[10px] font-mono text-slate-500">
                    <div>In: {trade.entryTime}</div>
                    <div>Out: {trade.exitTime}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClosedTradesJournal;
