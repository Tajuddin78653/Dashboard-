'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ShieldAlert,
  Radio,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { useTradingMode } from '@/lib/trading-mode-context';
import { getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { EmergencyKillSwitchModal } from '@/components/EmergencyKillSwitchModal';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { getAnalyticsSummary, getOpenTrades, exitTrade, type OpenPositionResponse } from '@/lib/api';
import { useWebSocket } from '@/lib/useWebSocket';

interface TopBarProps {
  title: string;
  onMobileMenuClick?: () => void;
  className?: string;
}

// ─── IST market-hours helper ─────────────────────────────────────────────────
function isMarketOpen(): boolean {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30;
}

export function TopBar({
  title,
  onMobileMenuClick,
  className,
}: TopBarProps) {
  const [marketOpen, setMarketOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [isPaper, setIsPaper]             = useState(true);
  // Live session P&L + position count fetched directly
  const [netPnl, setNetPnl]               = useState(0);
  const [openPositionCount, setOpenPositionCount] = useState(0);

  // Real WebSocket connection
  const wsStatus = useWebSocket(undefined);

  const { paperTrading, loading: modeLoading } = useTradingMode();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Read logged-in user from JWT
  const user = getUser() as any;
  const userName = user?.name ?? 'Trader Admin';
  const userEmail = user?.email ?? 'trader@autotrade.io';
  const userRole = user?.role ?? 'Pro Captain';

  // Market hours check
  useEffect(() => {
    setMarketOpen(isMarketOpen());
    const id = setInterval(() => setMarketOpen(isMarketOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch session P&L + open positions every 60s
  const fetchSessionStats = useCallback(async () => {
    try {
      const [summary, open] = await Promise.all([getAnalyticsSummary(), getOpenTrades()]);
      setNetPnl(summary.today_pnl ?? 0);
      setOpenPositionCount(open.length);
    } catch { /* silent — TopBar should never crash the layout */ }
  }, []);
  useEffect(() => {
    fetchSessionStats();
    const id = setInterval(fetchSessionStats, 60_000);
    return () => clearInterval(id);
  }, [fetchSessionStats]);

  // Sync initial paperTrading from context if available
  useEffect(() => {
    if (!modeLoading) {
      setIsPaper(paperTrading);
    }
  }, [paperTrading, modeLoading]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    removeToken();
    router.replace('/login');
  }

  const handleKillSwitchConfirm = async () => {
    const openTrades = await getOpenTrades();
    await Promise.all(
      openTrades.map((t: OpenPositionResponse) =>
        exitTrade(t.trade_id, t.current_price ?? t.entry_price, 'emergency_kill_switch')
      )
    );
    await fetchSessionStats();
  };

  return (
    <>
      <header className={cn(
        'flex items-center h-[58px] px-4 sm:px-5 gap-3',
        'border-b border-cyan-900/20 flex-shrink-0 z-20',
        'backdrop-blur-md',
        className
      )} style={{ background: 'rgba(2,2,9,0.92)', boxShadow: '0 1px 0 rgba(0,245,255,0.06)' }}>

        {/* ── Left: Hamburger + Brand ── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button onClick={onMobileMenuClick}
            className="md:hidden flex items-center justify-center rounded-lg p-1.5 text-slate-600 hover:text-[#00f5ff] transition-colors"
            aria-label="Open menu">
            <Menu className="h-4.5 w-4.5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00f5ff]/20 bg-[#00f5ff]/8"
              style={{ boxShadow: '0 0 10px rgba(0,245,255,0.15)' }}>
              <Zap className="h-3.5 w-3.5 text-[#00f5ff]"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,245,255,0.9))' }} />
            </div>
            <div>
              <h1 className="text-xs font-black text-white tracking-wide leading-tight"
                style={{ textShadow: '0 0 10px rgba(0,245,255,0.3)' }}>{title}</h1>
              <p className="text-[9px] text-cyan-800 font-mono hidden sm:block">Chartink · Telegram · DhanHQ</p>
            </div>
          </div>
        </div>

        {/* ── Mode Switcher + WS ── */}
        <div className="hidden lg:flex items-center gap-2 ml-3">
          <div className="flex items-center p-0.5 rounded-lg border border-cyan-900/30"
            style={{ background: 'rgba(0,245,255,0.03)' }}>
            <button onClick={() => setIsPaper(true)} className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-md transition-all',
              isPaper
                ? 'bg-[#ffaa00]/15 text-[#ffaa00] border border-[#ffaa00]/30'
                : 'text-slate-600 hover:text-slate-300'
            )}>📄 Paper</button>
            <button onClick={() => setIsPaper(false)} className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5',
              !isPaper
                ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                : 'text-slate-600 hover:text-slate-300'
            )}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff88]" />
              </span>
              Dhan Live
            </button>
          </div>

          {/* Real WS status */}
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono',
            wsStatus.connected
              ? 'border-cyan-900/30 text-[#00f5ff]'
              : 'border-rose-900/20 text-[#ff2d55]/60'
          )} style={{ background: 'rgba(0,245,255,0.03)' }}>
            <Radio className={cn('h-2.5 w-2.5', wsStatus.connected ? 'animate-pulse text-[#00f5ff]' : 'text-[#ff2d55]/40')} />
            <span className="font-black text-[9px]">{wsStatus.connected ? 'WS LIVE' : 'WS OFF'}</span>
            {wsStatus.connected && wsStatus.latencyMs !== null && (
              <span className="text-cyan-800">{wsStatus.latencyMs}ms</span>
            )}
          </div>
        </div>

        {/* ── Right: P&L + Kill + Bell + User ── */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto flex-shrink-0">

          {/* Session P&L */}
          <div className="hidden sm:flex flex-col items-end px-2.5 py-1 rounded-lg border border-cyan-900/20"
            style={{ background: 'rgba(0,245,255,0.03)' }}>
            <span className="text-[8px] uppercase font-black tracking-[0.15em] text-cyan-800">Session P&amp;L</span>
            <span className={cn('text-xs font-mono font-black flex items-center gap-1',
              netPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff2d55]'
            )} style={{ textShadow: netPnl >= 0 ? '0 0 8px rgba(0,255,136,0.6)' : '0 0 8px rgba(255,45,85,0.6)' }}>
              <TrendingUp className="h-3 w-3" />
              {netPnl >= 0 ? '+' : ''}₹{netPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Kill Switch */}
          <button onClick={() => setKillModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#ff2d55]/30 bg-[#ff2d55]/8 text-[#ff2d55] hover:bg-[#ff2d55] hover:text-white transition-all font-black text-[10px] tracking-wider"
            style={{ boxShadow: '0 0 12px rgba(255,45,85,0.2)' }}
            title="Emergency Square-Off">
            <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
            <span className="hidden sm:inline">KILL</span>
          </button>

          {/* Bell */}
          <button onClick={() => setNotifDrawerOpen(true)}
            className="relative rounded-lg p-1.5 text-slate-600 hover:text-[#00f5ff] hover:bg-cyan-950/30 transition-colors"
            aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a855f7] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#a855f7]" />
            </span>
          </button>

          {/* Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-cyan-950/30 transition-colors">
              <Avatar name={userName} size="sm" className="ring-1 ring-cyan-900/50" />
              <ChevronDown className={cn('h-3 w-3 text-slate-600 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-cyan-900/30 shadow-2xl z-50 overflow-hidden animate-fade-in"
                style={{ background: 'rgba(5,5,15,0.97)', backdropFilter: 'blur(12px)', boxShadow: '0 0 30px rgba(0,245,255,0.06)' }}>
                <div className="px-4 py-3 border-b border-cyan-900/20">
                  <p className="text-xs font-black text-white truncate">{userName}</p>
                  <p className="text-[10px] text-cyan-800 font-mono truncate">{userEmail}</p>
                  <span className="mt-1.5 inline-flex px-2 py-0.5 rounded text-[9px] font-black bg-[#7c3aed]/15 text-[#a855f7] border border-[#7c3aed]/30">
                    {userRole}
                  </span>
                </div>
                <div className="p-1">
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] text-slate-400 hover:bg-cyan-950/30 hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(false)}>
                    <User className="h-3.5 w-3.5 text-cyan-800" />
                    Account &amp; Broker Keys
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] text-[#ff2d55]/70 hover:bg-rose-950/30 hover:text-[#ff2d55] transition-colors"
                    onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Kill Switch Confirmation Modal */}
      <EmergencyKillSwitchModal
        isOpen={killModalOpen}
        onClose={() => setKillModalOpen(false)}
        onConfirm={handleKillSwitchConfirm}
        openPositionCount={openPositionCount}
      />

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </>
  );
}

export default TopBar;
