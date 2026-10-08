import { Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const DASHBOARD_TITLE = 'IBK CARD RISK INSIGHT';
const SUPPORT_CONTACT_NUMBER = '1588-2588, 1566-2566';
const CURRENT_USER_DEPARTMENT = '카드사업부';
const CURRENT_USER_NAME = 'IBK';
const NOTICE_MS = 2500;

export function Header() {
  // 데모 버전에는 로그인 화면이 없어 로그아웃 대신 안내 문구를 잠깐 띄운다
  const [showNotice, setShowNotice] = useState(false);
  const noticeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noticeTimerRef.current), []);

  const handleLogoutClick = () => {
    setShowNotice(true);
    window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(
      () => setShowNotice(false),
      NOTICE_MS,
    );
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-sidebar px-6 text-white">
      <div className="flex items-center gap-2.5">
        <img src="/logo-rising-bar.svg" alt="" className="h-6 w-6" />
        <span className="text-base font-bold tracking-wide">
          {DASHBOARD_TITLE}
        </span>
      </div>

      <div className="flex items-center gap-5 text-xs text-topbar-muted">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          <span>{`고객센터 ${SUPPORT_CONTACT_NUMBER}`}</span>
        </div>
        <span className="h-3.5 w-px bg-topbar-border" />
        <span>{CURRENT_USER_DEPARTMENT}</span>
        <span className="h-3.5 w-px bg-topbar-border" />
        <span className="font-semibold text-white">{CURRENT_USER_NAME}님</span>
        <button
          type="button"
          onClick={handleLogoutClick}
          className="h-8 rounded-md border border-topbar-button-border px-3.5 text-xs text-white transition-colors hover:bg-white/10"
        >
          로그아웃
        </button>
      </div>

      <div
        role="status"
        aria-hidden={!showNotice}
        className={`pointer-events-none fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
          showNotice ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        데모 버전에서는 로그아웃을 지원하지 않아요
      </div>
    </header>
  );
}
