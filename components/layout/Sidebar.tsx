'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp, LayoutDashboard, Zap, BarChart2,
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, History,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard',          href: '/dashboard',  Icon: LayoutDashboard, roles: ['admin','trader','viewer'] },
  { label: 'Live Signals',       href: '/signals',    Icon: Zap,             roles: ['admin','trader','viewer'] },
  { label: 'Open Positions',     href: '/positions',  Icon: TrendingUp,      roles: ['admin','trader','viewer'] },
  { label: 'Trade History',      href: '/history',    Icon: History,         roles: ['admin','trader','viewer'] },
  { label: 'Analytics',          href: '/analytics',  Icon: BarChart2,       roles: ['admin','trader','viewer'] },
  { label: 'Reports',            href: '/reports',    Icon: FileText,        roles: ['admin','trader','viewer'] },
  { label: 'Admin',              href: '/admin',      Icon: Settings,        roles: ['admin'] },
];

interface SidebarProps {
  forceCollapsed?: boolean;
  className?: string;
}

export function Sidebar({ forceCollapsed, className }: SidebarProps) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed  = forceCollapsed ?? collapsed;
  const user         = getUser();
  const userName     = (user as any)?.name ?? (user as any)?.sub ?? 'Trader';
  const userRole     = (user as any)?.role ?? 'viewer';
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  function handleLogout() {
    removeToken();
    router.replace('/login');
  }

  return (
    <aside className={cn(
      'flex h-full flex-col',
      'bg-[#020209] border-r border-cyan-900/20',
      'transition-[width] duration-300 ease-in-out overflow-hidden',
      isCollapsed ? 'w-14' : 'w-56',
      className,
    )}>

      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-4 border-b border-cyan-900/20 flex-shrink-0',
        isCollapsed && 'justify-center px-0',
      )}>
        <div className="relative flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-[#00f5ff]"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.8))' }} />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base font-black text-white tracking-tight whitespace-nowrap"
              style={{ textShadow: '0 0 12px rgba(0,245,255,0.4)' }}>
              Trade<span className="text-[#00f5ff]">Dash</span>
            </span>
            <span className="rounded bg-[#00f5ff]/10 border border-[#00f5ff]/30 px-1.5 py-0.5 text-[9px] font-black text-[#00f5ff] uppercase tracking-wider"
              style={{ boxShadow: '0 0 6px rgba(0,245,255,0.2)' }}>
              PRO
            </span>
          </div>
        )}
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <ul className="flex flex-col gap-0.5 px-2">
          {visibleItems.map(({ label, href, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold',
                    'transition-all duration-150 group overflow-hidden',
                    isCollapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-cyan-500/8 text-[#00f5ff]'
                      : 'text-slate-500 hover:bg-cyan-950/40 hover:text-slate-200',
                  )}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[#00f5ff]"
                      style={{ boxShadow: '0 0 8px #00f5ff' }} />
                  )}
                  {/* Active background shimmer */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg"
                      style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.06), transparent)' }} />
                  )}
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0 relative z-10',
                    isActive ? 'text-[#00f5ff]' : 'text-slate-600 group-hover:text-slate-300',
                  )}
                    style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(0,245,255,0.7))' } : {}} />
                  {!isCollapsed && (
                    <span className="truncate relative z-10">{label}</span>
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
              'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs text-slate-600',
              'hover:bg-cyan-950/30 hover:text-[#00f5ff] transition-colors duration-150',
              isCollapsed && 'justify-center px-0',
            )}
          >
            {isCollapsed
              ? <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              : <><ChevronLeft className="h-3.5 w-3.5 flex-shrink-0" /><span>Collapse</span></>
            }
          </button>
        </div>
      )}

      {/* ── User Section ── */}
      <div className={cn(
        'border-t border-cyan-900/20 p-3 flex-shrink-0',
        isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2.5',
      )}>
        <Avatar name={userName} size="sm" className="flex-shrink-0 ring-1 ring-cyan-700/40" />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{userName}</p>
            <p className="text-[10px] text-cyan-800 truncate capitalize font-mono">{userRole}</p>
          </div>
        )}
        <button
          title="Logout"
          onClick={handleLogout}
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-600 hover:bg-rose-950/40 hover:text-[#ff2d55] transition-colors duration-150"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
