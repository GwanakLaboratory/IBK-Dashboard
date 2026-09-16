import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export function DashboardLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-dvh flex-col gap-0.5 bg-slate-900">
      <Header />
      <div className="flex min-w-0 flex-1 flex-row overflow-hidden bg-white">
        <Sidebar />
        <main
          ref={mainRef}
          className="scrollbar-hide min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-10 py-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
