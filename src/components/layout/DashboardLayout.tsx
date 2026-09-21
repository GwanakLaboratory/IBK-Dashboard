import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatLauncher } from '@/components/domain/chat/ChatLauncher';

export function DashboardLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // A hash means the destination page wants to scroll to a specific
    // section itself (e.g. DashboardPage's stat-card deep links) — don't
    // fight it by snapping back to the top first.
    if (hash) {
      return;
    }
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname, hash]);

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
      <ChatLauncher />
    </div>
  );
}
