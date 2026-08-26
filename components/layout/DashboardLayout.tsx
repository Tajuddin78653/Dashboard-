'use client';

import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

/** Derive a human-readable page title from the current pathname. */
function getPageTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard';
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    signals:   'Live Signals',
    positions: 'Open Positions',
    analytics: 'Strategy Analytics',
    reports:   'Reports',
    admin:     'Admin Console',
  };
  return titles[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Sidebar collapse state — starts collapsed on narrow screens
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile overlay
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto-collapse sidebar when window is tablet-width
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setSidebarCollapsed(e.matches);
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const title = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      {/* ── Desktop / Tablet Sidebar ── */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        {/* We pass forceCollapsed=undefined so Sidebar manages its own collapse toggle,
            but we seed its internal state via the CSS width approach — the Sidebar's
            own toggle button remains in control on desktop */}
        <Sidebar
          forceCollapsed={sidebarCollapsed}
          className="h-full"
        />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Slide-in sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden animate-slide-up">
            <Sidebar className="h-full shadow-2xl" />
          </div>
        </>
      )}

      {/* ── Main Column ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <TopBar
          title={title}
          onMobileMenuClick={() => setMobileSidebarOpen(v => !v)}
        />

        {/* Scrollable Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto bg-navy-950',
            'p-4 md:p-6',
            // Extra bottom padding on mobile so content isn't hidden behind MobileNav
            'pb-20 md:pb-6',
          )}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <MobileNav />
    </div>
  );
}

export default DashboardLayout;
