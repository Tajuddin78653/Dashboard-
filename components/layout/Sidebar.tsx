'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  LayoutDashboard,
  Zap,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { label: 'Dashboard',           href: '/dashboard',  Icon: LayoutDashboard },
  { label: 'Live Signals',        href: '/signals',    Icon: Zap },
  { label: 'Open Positions',      href: '/positions',  Icon: TrendingUp },
  { label: 'Strategy Analytics',  href: '/analytics',  Icon: BarChart2 },
  { label: 'Reports',             href: '/reports',    Icon: FileText },
  { label: 'Admin',               href: '/admin',      Icon: Settings },
];

interface SidebarProps {
  /** Force-collapsed from outside (e.g. mobile overlay parent hides it entirely) */
  forceCollapsed?: boolean;
  className?: string;
}

export function Sidebar({ forceCollapsed, className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed = forceCollapsed ?? collapsed;

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-navy-900 border-r border-[#1e2d5a]',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-16' : 'w-60',
        className,
      )}
    >
      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-5 border-b border-[#1e2d5a] flex-shrink-0',
        isCollapsed && 'justify-center px-0',
      )}>
        <TrendingUp className="h-6 w-6 text-gold-500 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg font-bold text-gold-500 tracking-tight whitespace-nowrap">
              TradeDash
            </span>
            <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-bold text-gold-400 uppercase tracking-wider whitespace-nowrap">
              Pro
            </span>
          </div>
        )}
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <ul className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                    'transition-colors duration-150 relative group',
                    isCollapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-gold-500/10 text-gold-400'
                      : 'text-[#7a8db3] hover:bg-navy-700 hover:text-slate-100',
                  )}
                >
                  {/* Gold left-border accent for active item */}
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold-500" />
                  )}
                  <Icon className={cn(
                    'h-4.5 w-4.5 flex-shrink-0',
                    isActive ? 'text-gold-400' : 'text-[#7a8db3] group-hover:text-slate-100',
                  )} />
                  {!isCollapsed && (
                    <span className="truncate">{label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Collapse Toggle ── */}
      {forceCollapsed === undefined && (
        <div className="px-2 pb-2 flex-shrink-0">
          <button
            onClick={() => setCollapsed(v => !v)}
            className={cn(
              'flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs text-[#4a5a8a]',
              'hover:bg-navy-700 hover:text-slate-300 transition-colors duration-150',
              isCollapsed && 'justify-center px-0',
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4 flex-shrink-0" />
              : <>
                  <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                  <span>Collapse</span>
                </>
            }
          </button>
        </div>
      )}

      {/* ── User Section ── */}
      <div className={cn(
        'border-t border-[#1e2d5a] p-3 flex-shrink-0',
        isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center gap-3',
      )}>
        <Avatar name="Tajuddin" size="sm" className="flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Tajuddin</p>
            <p className="text-xs text-[#4a5a8a] truncate">Admin</p>
          </div>
        )}
        <button
          title="Logout"
          className="flex-shrink-0 rounded-md p-1.5 text-[#4a5a8a] hover:bg-navy-700 hover:text-danger transition-colors duration-150"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
