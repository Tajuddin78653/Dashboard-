'use client';

import { useState, useEffect } from 'react';
import {
  Bell, X, CheckCircle2, AlertCircle, TrendingUp,
  ArrowUpRight, Zap, Volume2, VolumeX, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSignals, getTrades } from '@/lib/api';

export interface AppNotification {
  id: string;
  type: 'signal' | 'order_filled' | 'target_hit' | 'sl_hit' | 'tsl_updated' | 'risk_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [signalsRes, tradesRes] = await Promise.all([
        getSignals({ page_size: '10', page: '1' }),
        getTrades({ page_size: '10', status: 'closed' }),
      ]);

      const notifs: AppNotification[] = [];

      // Convert recent closed trades → notifications
      for (const t of (tradesRes.items ?? []).slice(0, 6)) {
        const pnl = t.net_pnl ?? 0;
        const time = t.exit_time
          ? new Date(t.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : '—';
        let type: AppNotification['type'] = 'order_filled';
        let title = `${t.symbol} Trade Closed`;
        if (t.status === 'target-hit') { type = 'target_hit'; title = `Target Hit ✅ ${t.symbol}`; }
        else if (t.status === 'sl-hit') { type = 'sl_hit'; title = `SL Hit ⚠️ ${t.symbol}`; }
        else if (t.status === 'trailing-sl-hit') { type = 'tsl_updated'; title = `Trailing SL Exit ${t.symbol}`; }
        notifs.push({
          id: `trade-${t.id}`,
          type,
          title,
          message: `${t.signal_type} ${t.quantity} qty @ ₹${t.entry_price} → ₹${t.exit_price ?? '—'} | P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}`,
          timestamp: time,
          read: false,
        });
      }

      // Convert recent signals → notifications
      for (const s of (signalsRes.items ?? []).slice(0, 4)) {
        const time = new Date(s.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        notifs.push({
          id: `signal-${s.id}`,
          type: 'signal',
          title: `Signal: ${s.signal_type} ${s.symbol}`,
          message: `Scanner alert @ ₹${s.entry_price ?? '—'} | Status: ${s.status}`,
          timestamp: time,
          read: true,
        });
      }

      setNotifications(notifs);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  };

  // Fetch when drawer opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'target_hit':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'sl_hit':
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case 'tsl_updated':
        return <TrendingUp className="h-4 w-4 text-amber-400" />;
      case 'order_filled':
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />;
      case 'signal':
        return <Zap className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a101f] border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0d162b]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">Real-time alerts &amp; executions</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                title="Refresh notifications"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin text-indigo-400')} />
              </button>
              <button
                onClick={() => setSoundEnabled((v) => !v)}
                title={soundEnabled ? 'Mute Alert Sounds' : 'Enable Alert Sounds'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-indigo-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-500" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-2.5 border-b border-slate-800/80 bg-[#080d1a] flex items-center justify-between text-xs">
            <button
              onClick={markAllRead}
              className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-slate-500 hover:text-rose-400 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500 space-y-2">
                <Bell className="h-8 w-8 text-slate-600" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-600">Trading signals and executions will appear here in real time</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all',
                    item.read
                      ? 'border-slate-800/60 bg-[#0d162b]/50 text-slate-400'
                      : 'border-indigo-500/30 bg-[#121e3d] text-slate-200 shadow-sm'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-xs font-bold truncate', item.read ? 'text-slate-300' : 'text-white')}>
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t border-slate-800 bg-[#080d1a] text-center text-[11px] text-slate-500">
            Automated signals monitored via WebSocket stream
          </div>

        </div>
      </div>
    </div>
  );
}
