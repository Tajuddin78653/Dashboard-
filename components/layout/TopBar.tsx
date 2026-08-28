'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, Bell, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';

interface TopBarProps {
  title: string;
  onMobileMenuClick?: () => void;
  className?: string;
}

// ─── IST market-hours helper ─────────────────────────────────────────────────
// NSE trading hours: Mon–Fri 09:15–15:30 IST (UTC+5:30)
function isMarketOpen(): boolean {
  const now  = new Date();
  const ist  = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day  = ist.getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30;
}

export function TopBar({ title, onMobileMenuClick, className }: TopBarProps) {
  const [marketOpen, setMarketOpen] = useState(false);

  // Check on mount and every minute
  useEffect(() => {
    setMarketOpen(isMarketOpen());
    const id = setInterval(() => setMarketOpen(isMarketOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

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

      {/* ── Right: Market indicator + Bell + Avatar ── */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">

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

        {/* Notification Bell */}
        <button
          className="relative rounded-md p-2 text-[#4a5a8a] hover:bg-navy-700 hover:text-slate-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[9px] font-bold text-navy-950 leading-none">
            3
          </span>
        </button>

        {/* Avatar + Chevron */}
        <button className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-navy-700 transition-colors">
          <Avatar name="Tajuddin" size="sm" />
          <ChevronDown className="h-3.5 w-3.5 text-[#4a5a8a]" />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
