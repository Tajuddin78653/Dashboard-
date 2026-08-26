'use client';

import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';

interface TopBarProps {
  title: string;
  onMobileMenuClick?: () => void;
  className?: string;
}

export function TopBar({ title, onMobileMenuClick, className }: TopBarProps) {
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

      {/* ── Right: Live indicator + Bell + Avatar ── */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-success uppercase">
            Market Live
          </span>
        </div>

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
