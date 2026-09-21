'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, Search, Bell, ChevronDown, Clock, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { useTradingMode } from '@/lib/trading-mode-context';
import { getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title: string;
  onMobileMenuClick?: () => void;
  className?: string;
}

// ─── IST market-hours helper ─────────────────────────────────────────────────
function isMarketOpen(): boolean {
  const now  = new Date();
  const ist  = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day  = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30;
}

export function TopBar({ title, onMobileMenuClick, className }: TopBarProps) {
  const [marketOpen, setMarketOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { paperTrading, loading: modeLoading } = useTradingMode();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router      = useRouter();

  // Read logged-in user from JWT
  const user = getUser();
  const userName  = user?.name  ?? 'User';
  const userEmail = user?.email ?? '';
  const userRole  = user?.role  ?? '';

  // Market hours — check on mount and every minute
  useEffect(() => {
    setMarketOpen(isMarketOpen());
    const id = setInterval(() => setMarketOpen(isMarketOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

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

  return (
    <header
      className={cn(
        'flex items-center h-[60px] px-4 gap-3',
        'bg-navy-900 border-b border-[#1e2d5a] flex-shrink-0',
        className,
      )}
    >
      {/* ── Left: Hamburger + Page Title ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden flex items-center justify-center rounded-md p-2 text-[#4a5a8a] hover:bg-navy-700 hover:text-slate-200 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-100 whitespace-nowrap">{title}</h1>
      </div>

      {/* ── Center: Search ── */}
      <div className="hidden md:flex flex-1 max-w-md mx-auto">
        <Input
          icon={Search}
          placeholder="Search symbols, strategies..."
          className="h-8 text-xs py-1.5"
          wrapperClassName="w-full"
        />
      </div>

      {/* ── Right: Trading mode + Market indicator + Bell + Avatar ── */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">

        {/* ── Trading mode badge ── */}
        {!modeLoading && (
          paperTrading ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                📄 Paper
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-[10px] font-bold tracking-wider text-green-400 uppercase">
                Dhan Live
              </span>
            </div>
          )
        )}

        {/* ── IST-aware market status ── */}
        {marketOpen ? (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-green-400 uppercase">
              Market Open
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#4a5a8a]" />
            <span className="text-[11px] font-semibold tracking-wider text-[#4a5a8a] uppercase">
              Market Closed
            </span>
          </div>
        )}

        {/* ── Notification Bell — no hardcoded badge ── */}
        <button
          className="relative rounded-md p-2 text-[#4a5a8a] hover:bg-navy-700 hover:text-slate-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* ── Avatar dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-navy-700 transition-colors"
          >
            <Avatar name={userName} size="sm" />
            <ChevronDown className={cn('h-3.5 w-3.5 text-[#4a5a8a] transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#1e2d5a] bg-navy-900 shadow-2xl z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#1e2d5a]">
                <div className="flex items-center gap-2.5">
                  <Avatar name={userName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-[11px] text-[#4a5a8a] truncate">{userEmail}</p>
                  </div>
                </div>
                <span className={cn(
                  'mt-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  userRole === 'admin'  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' :
                  userRole === 'trader' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20',
                )}>
                  {userRole}
                </span>
              </div>

              {/* Menu items */}
              <div className="p-1">
                <button
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#7a8db3] hover:bg-navy-700 hover:text-white transition-colors"
                  onClick={() => { setDropdownOpen(false); }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default TopBar;
