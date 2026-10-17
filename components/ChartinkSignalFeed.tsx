'use client';

import { useEffect, useState, useCallback } from 'react';
import { Zap, Send, Globe, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSignals, type SignalResponse } from '@/lib/api';

export function ChartinkSignalFeed() {
  const [signals, setSignals] = useState<SignalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSignals({ page_size: '20' });
      setSignals(data.items);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'entered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> EXECUTED
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <XCircle className="h-3 w-3" /> RISK BLOCKED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Clock className="h-3 w-3" /> PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1527] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-[#090f1e]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Incoming Signal Stream</h3>
            <p className="text-[10px] text-slate-400">Chartink Webhook &amp; Telegram Bot · live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Listening Live
          </span>
          <button onClick={fetchSignals} disabled={loading} className="text-slate-500 hover:text-slate-300">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Signal List */}
      <div className="divide-y divide-slate-800/60 max-h-[360px] overflow-y-auto">
        {loading ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" /> Loading signals…
          </div>
        ) : signals.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">No signals received yet</div>
        ) : signals.map((sig) => (
          <div key={sig.id} className="p-3.5 hover:bg-slate-900/50 transition-colors flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg border flex-shrink-0 bg-purple-500/10 border-purple-500/20 text-purple-400" title="Source: Webhook">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{sig.symbol}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px] font-medium">
                    {sig.signal_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(sig.timestamp).toLocaleTimeString('en-IN')}</span>
                  {sig.entry_price && <><span>•</span><span>₹{sig.entry_price.toFixed(2)}</span></>}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">{getStatusBadge(sig.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartinkSignalFeed;
