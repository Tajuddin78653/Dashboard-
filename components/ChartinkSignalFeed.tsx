'use client';

import { Zap, Send, Globe, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IncomingSignalItem {
  id: string;
  source: 'telegram' | 'webhook';
  scanName: string;
  symbol: string;
  triggerPrice: number;
  timestamp: string;
  status: 'executed' | 'rejected_risk' | 'rejected_limit' | 'duplicate';
  statusReason?: string;
}

const MOCK_SIGNALS: IncomingSignalItem[] = [
  {
    id: 'sig-101',
    source: 'telegram',
    scanName: '15 Min Bullish Breakout',
    symbol: 'TATAMOTORS',
    triggerPrice: 980.0,
    timestamp: '10:02:15 AM',
    status: 'executed',
    statusReason: 'Position opened (Smart Captain)',
  },
  {
    id: 'sig-102',
    source: 'webhook',
    scanName: 'VWAP Cross + High Vol',
    symbol: 'INFY',
    triggerPrice: 1820.0,
    timestamp: '09:42:04 AM',
    status: 'executed',
    statusReason: 'Position opened (Smart Captain)',
  },
  {
    id: 'sig-103',
    source: 'webhook',
    scanName: 'RSI Reversal Pullback',
    symbol: 'RELIANCE',
    triggerPrice: 2845.0,
    timestamp: '09:35:10 AM',
    status: 'executed',
    statusReason: 'Target hit in earlier session',
  },
  {
    id: 'sig-104',
    source: 'telegram',
    scanName: 'Supertrend Buy',
    symbol: 'TCS',
    triggerPrice: 3910.0,
    timestamp: '09:30:22 AM',
    status: 'rejected_risk',
    statusReason: 'Max concurrent positions limit reached (3/3)',
  },
];

interface ChartinkSignalFeedProps {
  signals?: IncomingSignalItem[];
}

export function ChartinkSignalFeed({ signals = MOCK_SIGNALS }: ChartinkSignalFeedProps) {
  const getStatusBadge = (status: IncomingSignalItem['status']) => {
    switch (status) {
      case 'executed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            EXECUTED
          </span>
        );
      case 'rejected_risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <XCircle className="h-3 w-3" />
            RISK BLOCKED
          </span>
        );
      case 'rejected_limit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <XCircle className="h-3 w-3" />
            QUOTA REACHED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
            SKIPPED
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
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Incoming Signal Stream
            </h3>
            <p className="text-[10px] text-slate-400">Chartink Webhook &amp; Telegram Bot</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Listening Live
        </span>
      </div>

      {/* Signal List */}
      <div className="divide-y divide-slate-800/60 max-h-[360px] overflow-y-auto">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="p-3.5 hover:bg-slate-900/50 transition-colors flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'p-2 rounded-lg border flex-shrink-0',
                  sig.source === 'telegram'
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                )}
                title={sig.source === 'telegram' ? 'Source: Telegram Bot' : 'Source: Webhook Endpoint'}
              >
                {sig.source === 'telegram' ? <Send className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{sig.symbol}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-xs font-medium">
                    {sig.scanName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{sig.timestamp}</span>
                  <span>•</span>
                  <span>Trigger: ₹{sig.triggerPrice.toFixed(2)}</span>
                  {sig.statusReason && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">{sig.statusReason}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {getStatusBadge(sig.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartinkSignalFeed;
