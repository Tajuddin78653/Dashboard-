'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  History, CheckCircle2, AlertCircle, TrendingUp,
  Search, ArrowUpRight, ArrowDownRight, Clock, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTrades, type TradeResponse } from '@/lib/api';

export function ClosedTradesJournal() {
  const [trades, setTrades] = useState<TradeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrades({ page_size: '50', status: 'closed' });
      // closed = target-hit, sl-hit, trailing-sl-hit, exited
      const closed = data.items.filter((t) =>
        ['target-hit', 'sl-hit', 'trailing-sl-hit', 'exited'].includes(t.status)
      );
      setTrades(closed);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const filtered = trades.filter((t) => {
    const matchSearch = t.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getExitBadge = (status: string) => {
    switch (status) {
      case 'target-hit':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"><CheckCircle2 className="h-3 w-3" />TARGET HIT</span>;
      case 'trailing-sl-hit':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300"><TrendingUp className="h-3 w-3" />TRAILING SL</span>;
      case 'sl-hit':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300"><AlertCircle className="h-3 w-3" />SL HIT</span>;
      case 'exited':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">MANUAL</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#090f1e] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Closed Positions Journal</h3>
            <p className="text-[10px] text-slate-400">Execution logs &amp; settled P&amp;L · live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input type="text" placeholder="Search symbol…" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Exits</option>
            <option value="target-hit">Target Hit</option>
            <option value="trailing-sl-hit">Trailing SL</option>
            <option value="sl-hit">Stop Loss</option>
            <option value="exited">Manual Exit</option>
          </select>
          <button onClick={fetchTrades} disabled={loading} className="text-slate-500 hover:text-slate-300">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" /> Loading trades…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No closed trades yet</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="px-4 py-2.5">Symbol</th>
                <th className="px-4 py-2.5">Qty</th>
                <th className="px-4 py-2.5">Entry Price</th>
                <th className="px-4 py-2.5">Exit Price</th>
                <th className="px-4 py-2.5">Exit Reason</th>
                <th className="px-4 py-2.5 text-right">Realized P&amp;L</th>
                <th className="px-4 py-2.5 text-right">Timestamps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((t) => {
                const pnl = t.net_pnl ?? 0;
                const isProfit = pnl >= 0;
                return (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white text-xs">{t.symbol}</div>
                      <div className="text-[10px] text-slate-400">{t.signal_type}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{t.quantity}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">₹{t.entry_price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-white">
                      {t.exit_price ? `₹${t.exit_price.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">{getExitBadge(t.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={cn('font-mono font-bold flex items-center justify-end gap-1', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                        {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {isProfit ? '+' : ''}₹{pnl.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[10px] font-mono text-slate-500">
                      <div className="flex items-center justify-end gap-1"><Clock className="h-3 w-3" />{new Date(t.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      {t.exit_time && <div>Out: {new Date(t.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ClosedTradesJournal;
