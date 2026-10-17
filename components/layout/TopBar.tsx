'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Clock,
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

interface TopBarProps {
  title: string;
  onMobileMenuClick?: () => void;
  className?: string;
  netPnl?: number;
  openPositionCount?: number;
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
  netPnl = 4250,
  openPositionCount = 2,
}: TopBarProps) {
  const [marketOpen, setMarketOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [isPaper, setIsPaper] = useState(true);

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
    // Simulated emergency square off API call
    console.log('Emergency Kill Switch executed: All positions squared off.');
  };

  return (
    <>
      <header
        className={cn(
          'flex items-center h-[64px] px-4 sm:px-6 gap-3.5',
          'bg-[#0a0f1d] border-b border-slate-800/90 flex-shrink-0 z-20',
          className
        )}
      >
        {/* ── Left: Mobile Hamburger + Brand/Page Title ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMobileMenuClick}
            className="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 text-white font-bold">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide leading-tight">{title}</h1>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Chartink • Telegram • DhanHQ</p>
            </div>
          </div>
        </div>

        {/* ── Mode Switcher & Heartbeat ── */}
        <div className="hidden lg:flex items-center gap-2.5 ml-4">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setIsPaper(true)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
                isPaper
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span>📄 Paper Sandbox</span>
            </button>
            <button
              onClick={() => setIsPaper(false)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
                !isPaper
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Dhan Live</span>
            </button>
          </div>

          {/* WebSocket Live Stream Pulse */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-400 font-medium">WS Live</span>
            <span className="text-slate-500 text-[10px]">12ms</span>
          </div>
        </div>

        {/* ── Right-aligned Controls: Net P&L + Kill Switch + Bell + User ── */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto flex-shrink-0">

          {/* Live Intraday Net P&L Ticker */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
              Session Net P&amp;L
            </span>
            <span className={cn('text-xs font-mono font-bold flex items-center gap-1', netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              <TrendingUp className="h-3 w-3" />
              {netPnl >= 0 ? '+' : ''}₹{netPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Emergency Kill Switch Button */}
          <button
            onClick={() => setKillModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 transition-all font-bold text-xs shadow-md shadow-rose-950/40"
            title="Emergency Square-Off All Open Positions"
          >
            <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
            <span className="hidden sm:inline tracking-wider">KILL SWITCH</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setNotifDrawerOpen(true)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
          </button>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-slate-800 transition-colors"
            >
              <Avatar name={userName} size="sm" className="ring-1 ring-slate-700" />
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-slate-400 transition-transform',
                  dropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-700 bg-[#0d1424] shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
                  <span className="mt-1.5 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {userRole}
                  </span>
                </div>
                <div className="p-1">
                  <button
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Account &amp; Broker Keys
                  </button>
                  <button
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    onClick={handleLogout}
                  >
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
