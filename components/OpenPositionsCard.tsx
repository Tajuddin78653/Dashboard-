'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, LogOut, Sparkles,
  Lock, Layers, Clock, Activity, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrailingSLProgressBar } from './TrailingSLProgressBar';
import { Button } from '@/components/ui/Button';
import { getOpenTrades, exitTrade, type OpenPositionResponse } from '@/lib/api';

export function OpenPositionsCard({ isPaperMode = true }: { isPaperMode?: boolean }) {
  const [positions, setPositions] = useState<OpenPositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitingMap, setExitingMap] = useState<Record<string, boolean>>({});

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpenTrades();
      setPositions(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  const handleExitClick = async (tradeId: string, symbol: string, currentPrice: number | null) => {
    const price = currentPrice ?? 0;
    if (!confirm(`Market EXIT ${symbol} @ ₹${price.toFixed(2)}?`)) return;
    setExitingMap((prev) => ({ ...prev, [tradeId]: true }));
    try {
      await exitTrade(tradeId, price, 'manual-exit');
      await fetchPositions();
    } catch (e) { console.error('Exit failed', e); }
    finally { setExitingMap((prev) => ({ ...prev, [tradeId]: false })); }
  };

  const totalMTM = positions.reduce((acc, p) => acc + (p.mtm ?? 0), 0);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-8 text-center text-slate-500 text-sm">
        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading positions…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] overflow-hidden">
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
            <p className="text-[10px] text-slate-400 font-mono">Live from DB · Trailing SL Monitor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPositions} className="text-slate-500 hover:text-slate-300">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Total Open MTM</span>
            <span className={cn('text-sm font-mono font-bold', totalMTM >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {totalMTM >= 0 ? '+' : ''}₹{totalMTM.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Position Cards */}
      <div className="p-4 space-y-4">
        {positions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Layers className="h-8 w-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No open positions</p>
            <p className="text-xs text-slate-600">Incoming Chartink signals will open positions automatically</p>
          </div>
        ) : positions.map((pos) => {
          const isProfit = (pos.mtm ?? 0) >= 0;
          const isExiting = exitingMap[pos.trade_id];
          const tslAboveEntry = pos.stop_loss >= pos.entry_price;

          return (
            <div key={pos.trade_id} className={cn(
              'rounded-xl border p-4 transition-all duration-200 space-y-3.5',
              isProfit ? 'border-emerald-500/30 bg-[#0c182c]/80' : 'border-rose-500/30 bg-[#1f101b]/80'
            )}>
              {/* Top Row */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{pos.symbol}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">NSE</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {pos.signal_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>ID: {pos.trade_id.slice(0, 8)}</span>
                    {!isPaperMode && pos.dhan_order_id && <span>Dhan: {pos.dhan_order_id}</span>}
                    <Clock className="h-3 w-3" />
                    <span>{new Date(pos.entry_time).toLocaleTimeString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={cn('text-base font-mono font-bold flex items-center justify-end gap-1', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                      {isProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {isProfit ? '+' : ''}₹{(pos.mtm ?? 0).toFixed(2)}
                    </div>
                    <span className={cn('text-xs font-mono font-semibold', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                      ({isProfit ? '+' : ''}{(pos.pnl_pct ?? 0).toFixed(2)}%)
                    </span>
                  </div>
                  <Button variant="danger" size="sm" disabled={isExiting}
                    onClick={() => handleExitClick(pos.trade_id, pos.symbol, pos.current_price)}
                    className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold py-1.5 px-3">
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    {isExiting ? 'Exiting...' : 'Market Exit'}
                  </Button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                {[
                  { label: 'Quantity', value: `${pos.quantity} Qty`, cls: 'text-white' },
                  { label: 'Buy Entry', value: `₹${pos.entry_price.toFixed(2)}`, cls: 'text-slate-200' },
                  { label: 'Live CMP', value: pos.current_price ? `₹${pos.current_price.toFixed(2)}` : '—', cls: 'text-white', pulse: true },
                  { label: 'Target', value: `₹${pos.target_price.toFixed(2)}`, cls: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/40' },
                  { label: 'Stop Loss', value: `₹${pos.stop_loss.toFixed(2)}`, cls: tslAboveEntry ? 'text-emerald-400' : 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900/40', icon: tslAboveEntry ? <Lock className="h-3 w-3 text-emerald-400" /> : null },
                ].map((m) => (
                  <div key={m.label} className={cn('rounded-lg border p-2.5', m.bg ?? 'bg-slate-900/90 border-slate-800')}>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center justify-between">
                      {m.label} {m.icon}
                    </span>
                    <span className={cn('font-mono font-bold text-sm flex items-center gap-1', m.cls)}>
                      {m.pulse && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />}
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trailing SL Bar */}
              <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-2.5">
                <TrailingSLProgressBar
                  entryPrice={pos.entry_price}
                  currentPrice={pos.current_price ?? pos.entry_price}
                  targetPrice={pos.target_price}
                  initialSL={pos.stop_loss}
                  currentTrailingSL={pos.stop_loss}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OpenPositionsCard;
