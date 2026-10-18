'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowUpRight, ArrowDownRight, LogOut, Sparkles,
  Lock, Layers, Clock, Activity, RefreshCw, X, AlertTriangle, Edit2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrailingSLProgressBar } from './TrailingSLProgressBar';
import { Button } from '@/components/ui/Button';
import { getOpenTrades, exitTrade, type OpenPositionResponse } from '@/lib/api';
import { useWebSocket, type WsMessage } from '@/lib/useWebSocket';
import { apiRequest } from '@/lib/api';

// ── Manual Exit Modal ────────────────────────────────────────────────────────
function ManualExitModal({
  position,
  onConfirm,
  onCancel,
  loading,
}: {
  position: OpenPositionResponse;
  onConfirm: (price: number, reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [price, setPrice] = useState(String(position.current_price ?? position.entry_price));
  const [reason, setReason] = useState('manual-exit');

  const pnl = position.current_price
    ? (parseFloat(price) - position.entry_price) * position.quantity
    : 0;
  const isProfit = pnl >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0d1527] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
              <LogOut className="h-4 w-4 text-rose-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Manual Market Exit</p>
              <p className="text-[10px] text-slate-400">{position.symbol} · {position.quantity} qty · {position.signal_type}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Price summary */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Entry</p>
              <p className="font-mono font-bold text-white">₹{position.entry_price.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">CMP</p>
              <p className="font-mono font-bold text-white">
                {position.current_price ? `₹${position.current_price.toFixed(2)}` : '—'}
              </p>
            </div>
            <div className={cn('rounded-lg border p-2.5', isProfit ? 'bg-emerald-950/30 border-emerald-900/40' : 'bg-rose-950/30 border-rose-900/40')}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Est. P&L</p>
              <p className={cn('font-mono font-bold', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                {isProfit ? '+' : ''}₹{pnl.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Exit price input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exit Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.05"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <p className="mt-1 text-[10px] text-slate-500">Defaults to current market price. Adjust if slippage expected.</p>
          </div>

          {/* Exit reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exit Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
            >
              <option value="manual-exit">Manual Exit</option>
              <option value="news-event">News Event</option>
              <option value="risk-management">Risk Management</option>
              <option value="profit-booking">Profit Booking</option>
              <option value="eod-squareoff">EOD Square-off</option>
            </select>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-300">
              This will immediately close the position at the entered price. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-800 px-5 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(parseFloat(price), reason)}
            disabled={loading || !price || isNaN(parseFloat(price))}
            className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {loading ? 'Exiting…' : 'Confirm Exit'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Modify SL/Target Modal ────────────────────────────────────────────────────
function ModifyTradeModal({
  position,
  onConfirm,
  onCancel,
  loading,
}: {
  position: OpenPositionResponse;
  onConfirm: (sl: number, tp: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [sl, setSl] = useState(String(position.stop_loss));
  const [tp, setTp] = useState(String(position.target_price));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0d1527] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Edit2 className="h-4 w-4 text-indigo-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Modify SL / Target</p>
              <p className="text-[10px] text-slate-400">{position.symbol} · {position.signal_type}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stop Loss (₹)</label>
            <input
              type="number" value={sl} onChange={(e) => setSl(e.target.value)} step="0.05"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Price (₹)</label>
            <input
              type="number" value={tp} onChange={(e) => setTp(e.target.value)} step="0.05"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-800 px-5 py-4">
          <button
            onClick={onCancel} disabled={loading}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >Cancel</button>
          <button
            onClick={() => onConfirm(parseFloat(sl), parseFloat(tp))}
            disabled={loading || !sl || !tp || isNaN(parseFloat(sl)) || isNaN(parseFloat(tp))}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function OpenPositionsCard({ isPaperMode = true }: { isPaperMode?: boolean }) {
  const [positions, setPositions] = useState<OpenPositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitTarget, setExitTarget] = useState<OpenPositionResponse | null>(null);
  const [exiting, setExiting] = useState(false);
  const [modifyTarget, setModifyTarget] = useState<OpenPositionResponse | null>(null);
  const [modifying, setModifying] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpenTrades();
      setPositions(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  // ── Real-time WebSocket price updates ──────────────────────────────────────
  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'price_update') {
      setPositions((prev) =>
        prev.map((p) =>
          p.trade_id === (msg.trade_id as string)
            ? {
                ...p,
                current_price: msg.current_price as number,
                mtm: msg.mtm as number,
                stop_loss: (msg.stop_loss as number) ?? p.stop_loss,
                target_price: (msg.target_price as number) ?? p.target_price,
              }
            : p
        )
      );
    } else if (msg.type === 'trade_closed') {
      // Remove closed trade from open positions immediately
      setPositions((prev) => prev.filter((p) => p.trade_id !== (msg.trade_id as string)));
    }
  }, []);

  useWebSocket(handleWsMessage);

  const handleConfirmExit = async (price: number, reason: string) => {
    if (!exitTarget) return;
    setExiting(true);
    try {
      await exitTrade(exitTarget.trade_id, price, reason);
      setExitTarget(null);
      await fetchPositions();
    } catch (e) {
      console.error('Exit failed', e);
    } finally {
      setExiting(false);
    }
  };

  const handleConfirmModify = async (sl: number, tp: number) => {
    if (!modifyTarget) return;
    setModifying(true);
    try {
      await apiRequest(`/trades/${modifyTarget.trade_id}/update`, {
        method: 'PUT',
        body: JSON.stringify({ stop_loss: sl, target_price: tp }),
      });
      setModifyTarget(null);
      await fetchPositions();
    } catch (e) {
      console.error('Modify failed', e);
    } finally {
      setModifying(false);
    }
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
    <>
      {/* Exit Modal */}
      {exitTarget && (
        <ManualExitModal
          position={exitTarget}
          onConfirm={handleConfirmExit}
          onCancel={() => setExitTarget(null)}
          loading={exiting}
        />
      )}
      {/* Modify SL/Target Modal */}
      {modifyTarget && (
        <ModifyTradeModal
          position={modifyTarget}
          onConfirm={handleConfirmModify}
          onCancel={() => setModifyTarget(null)}
          loading={modifying}
        />
      )}

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

                  {/* P&L + Action Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={cn('text-base font-mono font-bold flex items-center justify-end gap-1', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                        {isProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {isProfit ? '+' : ''}₹{(pos.mtm ?? 0).toFixed(2)}
                      </div>
                      <span className={cn('text-xs font-mono font-semibold', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                        ({isProfit ? '+' : ''}{(pos.pnl_pct ?? 0).toFixed(2)}%)
                      </span>
                    </div>
                    <button
                      onClick={() => setModifyTarget(pos)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
                      title="Modify SL / Target"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Modify</span>
                    </button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setExitTarget(pos)}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold py-1.5 px-3"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1" />
                      Exit
                    </Button>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  {[
                    { label: 'Quantity',  value: `${pos.quantity} Qty`,                         cls: 'text-white' },
                    { label: 'Buy Entry', value: `₹${pos.entry_price.toFixed(2)}`,              cls: 'text-slate-200' },
                    { label: 'Live CMP',  value: pos.current_price ? `₹${pos.current_price.toFixed(2)}` : '—', cls: 'text-white', pulse: true },
                    { label: 'Target',    value: `₹${pos.target_price.toFixed(2)}`,             cls: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/40' },
                    { label: 'Stop Loss', value: `₹${pos.stop_loss.toFixed(2)}`,               cls: tslAboveEntry ? 'text-emerald-400' : 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900/40', icon: tslAboveEntry ? <Lock className="h-3 w-3 text-emerald-400" /> : null },
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
    </>
  );
}

export default OpenPositionsCard;
