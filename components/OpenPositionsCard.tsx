'use client';

import { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Sparkles,
  Lock,
  Layers,
  Clock,
  Shield,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrailingSLProgressBar } from './TrailingSLProgressBar';
import { Button } from '@/components/ui/Button';

export interface OpenTradePosition {
  tradeId: string;
  dhanOrderId?: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  strategyName: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  targetPrice: number;
  initialSL: number;
  currentTrailingSL: number;
  unrealizedPnl: number;
  pnlPct: number;
  enteredAt: string;
  status: 'active' | 'exiting';
}

const MOCK_OPEN_POSITIONS: OpenTradePosition[] = [
  {
    tradeId: 'TRD-88219',
    dhanOrderId: 'DHN-4920482',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    strategyName: 'Smart Captain (1.5% / 1% / 1%)',
    quantity: 100,
    entryPrice: 980.0,
    currentPrice: 991.2,
    targetPrice: 994.7,
    initialSL: 970.2,
    currentTrailingSL: 981.3,
    unrealizedPnl: 1120.0,
    pnlPct: 1.14,
    enteredAt: '10:02 AM',
    status: 'active',
  },
  {
    tradeId: 'TRD-88220',
    dhanOrderId: 'DHN-4920499',
    symbol: 'INFY',
    exchange: 'NSE',
    strategyName: 'Smart Captain (1.5% / 1% / 1%)',
    quantity: 50,
    entryPrice: 1820.0,
    currentPrice: 1835.5,
    targetPrice: 1847.3,
    initialSL: 1801.8,
    currentTrailingSL: 1817.15,
    unrealizedPnl: 775.0,
    pnlPct: 0.85,
    enteredAt: '09:42 AM',
    status: 'active',
  },
];

interface OpenPositionsCardProps {
  positions?: OpenTradePosition[];
  onManualExit?: (tradeId: string) => Promise<void>;
  isPaperMode?: boolean;
}

export function OpenPositionsCard({
  positions = MOCK_OPEN_POSITIONS,
  onManualExit,
  isPaperMode = true,
}: OpenPositionsCardProps) {
  const [exitingMap, setExitingMap] = useState<Record<string, boolean>>({});

  const handleExitClick = async (tradeId: string, symbol: string, currentPrice: number) => {
    if (!confirm(`Are you sure you want to execute manual MARKET EXIT for ${symbol} @ ₹${currentPrice.toFixed(2)}?`)) {
      return;
    }

    setExitingMap((prev) => ({ ...prev, [tradeId]: true }));
    try {
      if (onManualExit) {
        await onManualExit(tradeId);
      }
    } catch (e) {
      console.error('Failed to exit position', e);
    } finally {
      setExitingMap((prev) => ({ ...prev, [tradeId]: false }));
    }
  };

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] overflow-hidden space-y-0">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090f1e]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              Live Open Positions
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {positions.length} Active
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Dynamic Trailing Stop Loss &amp; Target Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Total Open MTM
            </span>
            <span className={cn('text-sm font-mono font-bold', totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}₹{totalUnrealizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Position Cards List */}
      <div className="p-4 space-y-4">
        {positions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Layers className="h-8 w-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No open positions</p>
            <p className="text-xs text-slate-600">Incoming Chartink signals will open new positions automatically</p>
          </div>
        ) : (
          positions.map((pos) => {
            const isProfit = pos.unrealizedPnl >= 0;
            const isExiting = exitingMap[pos.tradeId];
            const isTSLAboveEntry = pos.currentTrailingSL >= pos.entryPrice;

            return (
              <div
                key={pos.tradeId}
                className={cn(
                  'rounded-xl border p-4 transition-all duration-200 space-y-3.5',
                  isProfit
                    ? 'border-emerald-500/30 bg-[#0c182c]/80 hover:border-emerald-500/50'
                    : 'border-rose-500/30 bg-[#1f101b]/80 hover:border-rose-500/50'
                )}
              >
                {/* Top Row: Symbol, Badges, PnL */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white tracking-tight">
                          {pos.symbol}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {pos.exchange}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {pos.strategyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>ID: {pos.tradeId}</span>
                        {!isPaperMode && pos.dhanOrderId && <span>Dhan: {pos.dhanOrderId}</span>}
                        <span>Entry: {pos.enteredAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* P&L Display & Exit Action */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={cn('text-base font-mono font-bold flex items-center justify-end gap-1', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                        {isProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {isProfit ? '+' : ''}₹{pos.unrealizedPnl.toFixed(2)}
                      </div>
                      <span className={cn('text-xs font-mono font-semibold', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                        ({isProfit ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                      </span>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isExiting}
                      onClick={() => handleExitClick(pos.tradeId, pos.symbol, pos.currentPrice)}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold py-1.5 px-3"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1" />
                      {isExiting ? 'Exiting...' : 'Market Exit'}
                    </Button>
                  </div>
                </div>

                {/* Middle Row: Quantity, Entry, LTP, Target, Trailing SL Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                      Quantity
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {pos.quantity} Qty
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                      Buy Entry
                    </span>
                    <span className="font-mono font-bold text-slate-200 text-sm">
                      ₹{pos.entryPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                      Live CMP (LTP)
                    </span>
                    <span className="font-mono font-bold text-white text-sm flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      ₹{pos.currentPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-2.5">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400/80 block mb-0.5">
                      Target (+1.5%)
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹{pos.targetPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-amber-950/20 border border-amber-900/40 p-2.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/80 block mb-0.5 flex items-center justify-between">
                      <span>Trailing SL</span>
                      {isTSLAboveEntry && (
                        <span title="Locked in profit">
                          <Lock className="h-3 w-3 text-emerald-400" />
                        </span>
                      )}
                    </span>
                    <span className={cn('font-mono font-bold text-sm', isTSLAboveEntry ? 'text-emerald-400' : 'text-amber-400')}>
                      ₹{pos.currentTrailingSL.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Dynamic Trailing SL Visual Progress Bar */}
                <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-2.5">
                  <TrailingSLProgressBar
                    entryPrice={pos.entryPrice}
                    currentPrice={pos.currentPrice}
                    targetPrice={pos.targetPrice}
                    initialSL={pos.initialSL}
                    currentTrailingSL={pos.currentTrailingSL}
                  />
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default OpenPositionsCard;
