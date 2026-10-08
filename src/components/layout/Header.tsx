import { Phone } from 'lucide-react';
import { useDemoNotice } from '@/components/molecules/DemoNotice';

const DASHBOARD_TITLE = 'IBK CARD RISK INSIGHT';
const SUPPORT_CONTACT_NUMBER = '1588-2588, 1566-2566';
const CURRENT_USER_DEPARTMENT = '카드사업부';
const CURRENT_USER_NAME = 'IBK';

export function Header() {
  // 데모 버전에는 로그인 화면이 없어 로그아웃 대신 안내 문구를 잠깐 띄운다
  const { show, notice } = useDemoNotice();
  const handleLogoutClick = () =>
    show('데모 버전에서는 로그아웃을 지원하지 않아요');

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

      {notice}
    </header>
  );
}
