'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, TrendingUp, BarChart2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Home',      href: '/dashboard',  Icon: LayoutDashboard },
  { label: 'Signals',   href: '/signals',    Icon: Zap },
  { label: 'Positions', href: '/positions',  Icon: TrendingUp },
  { label: 'Analytics', href: '/analytics',  Icon: BarChart2 },
  { label: 'More',      href: '/admin',      Icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-navy-900 border-t border-[#1e2d5a]">
      <ul className="flex">
        {TABS.map(({ label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-gold-400'
                    : 'text-[#4a5a8a] hover:text-slate-300',
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-gold-400' : 'text-[#4a5a8a]',
                )} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileNav;
