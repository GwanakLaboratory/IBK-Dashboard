import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatLauncher } from '@/components/domain/chat/ChatLauncher';

/** 앱 공통 틀: 헤더 + 왼쪽 메뉴 + 스크롤되는 본문 */
export function DashboardLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-dvh min-w-[1280px] flex-col bg-surface font-sans tabular-nums text-slate-900">
      <Header />
      <div className="flex min-h-0 grow">
        <Sidebar />
        {/* 아래 여백은 오른쪽 아래 챗봇 버튼(56px + 여백)이 마지막 내용을 덮지 않을 만큼 둔다 */}
        <main
          ref={mainRef}
          className="scrollbar-thin flex min-h-0 min-w-0 grow flex-col gap-4 overflow-y-auto overscroll-contain px-8 pb-24 pt-6"
        >
          <Outlet />
        </main>
      </div>
      <ChatLauncher />
    </div>
  );
}
