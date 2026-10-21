'use client';

import { useEffect, useState, useCallback } from 'react';
import { Zap, Globe, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSignals, type SignalResponse } from '@/lib/api';

function isMarketOpen(): boolean {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30;
}

export function ChartinkSignalFeed() {
  const [signals, setSignals]         = useState<SignalResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const live = isMarketOpen();

  const fetchSignals = useCallback(async () => {
    try {
      const data = await getSignals({ page_size: '20' });
      setSignals(data.items);
      setLastUpdated(new Date());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);
  useEffect(() => {
    const getInterval = () => isMarketOpen() ? 10_000 : 60_000;
    let id = setInterval(fetchSignals, getInterval());
    const recalc = setInterval(() => { clearInterval(id); id = setInterval(fetchSignals, getInterval()); }, 60_000);
    return () => { clearInterval(id); clearInterval(recalc); };
  }, [fetchSignals]);

  const badge = (status: string) => {
    if (status === 'entered') return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider border border-[#00ff88]/30 bg-[#00ff88]/8 text-[#00ff88]"
        style={{ boxShadow: '0 0 6px rgba(0,255,136,0.2)' }}>
        <CheckCircle2 className="h-2.5 w-2.5" /> EXEC
      </span>
    );
    if (status === 'rejected') return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider border border-[#ff2d55]/30 bg-[#ff2d55]/8 text-[#ff2d55]"
        style={{ boxShadow: '0 0 6px rgba(255,45,85,0.2)' }}>
        <XCircle className="h-2.5 w-2.5" /> BLOCKED
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider border border-[#ffaa00]/30 bg-[#ffaa00]/8 text-[#ffaa00]">
        <Clock className="h-2.5 w-2.5" /> PENDING
      </span>
    );
  };

  return (
    <div className="cyber-card overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-900/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20"
            style={{ boxShadow: '0 0 8px rgba(124,58,237,0.2)' }}>
            <Zap className="h-4 w-4 text-[#a855f7]"
              style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.8))' }} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white tracking-[0.12em] uppercase">Signal Stream</h3>
            <p className="text-[9px] text-cyan-800 font-mono">Chartink Webhook · live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              live ? 'bg-[#00ff88] animate-pulse' : 'bg-slate-600'
            )} style={live ? { boxShadow: '0 0 6px #00ff88' } : {}} />
            <span className="text-[9px] font-mono text-slate-500">
              {live ? '10s' : '60s'}
            </span>
            {lastUpdated && (
              <span className="text-[9px] font-mono text-slate-700">
                {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <button onClick={fetchSignals} disabled={loading}
            className="text-slate-700 hover:text-[#00f5ff] transition-colors">
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-cyan-900/10 max-h-[340px] overflow-y-auto">
        {loading ? (
          <div className="py-10 text-center text-xs text-cyan-900 font-mono">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-[#00f5ff]" />
            scanning signals…
          </div>
        ) : signals.length === 0 ? (
          <div className="py-10 text-center text-xs text-cyan-900 font-mono">
            [ no signals received ]
          </div>
        ) : signals.map((sig) => {
          const isBuy = sig.signal_type === 'BUY';
          return (
            <div key={sig.id}
              className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-cyan-950/20 transition-colors group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded bg-[#7c3aed]/10 border border-[#7c3aed]/15 flex-shrink-0">
                  <Globe className="h-3 w-3 text-[#a855f7]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-xs">{sig.symbol}</span>
                    <span className={cn(
                      'text-[9px] font-black px-1.5 py-0.5 rounded border',
                      isBuy
                        ? 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/8'
                        : 'text-[#ff2d55] border-[#ff2d55]/30 bg-[#ff2d55]/8'
                    )} style={{ boxShadow: isBuy ? '0 0 4px rgba(0,255,136,0.2)' : '0 0 4px rgba(255,45,85,0.2)' }}>
                      {sig.signal_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{new Date(sig.timestamp).toLocaleTimeString('en-IN')}</span>
                    {sig.entry_price && <><span className="text-cyan-900">·</span><span className="text-cyan-700">₹{sig.entry_price.toFixed(2)}</span></>}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">{badge(sig.status)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartinkSignalFeed;
