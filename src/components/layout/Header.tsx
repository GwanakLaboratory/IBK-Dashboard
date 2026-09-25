import { Phone } from 'lucide-react';

const DASHBOARD_TITLE = 'IBK CARD RISK INSIGHT';
const SUPPORT_CONTACT_NUMBER = '1588-2588, 1566-2566';
const CURRENT_USER_DEPARTMENT = '카드사업부';
const CURRENT_USER_NAME = 'IBK';

export function Header() {
  const handleLogoutClick = () => {
    console.log('click logout');
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-[#0C1426] px-6 text-white">
      <div className="flex items-center gap-3">
        <span className="text-base font-bold tracking-wide">
          {DASHBOARD_TITLE}
        </span>
      </div>

      <div className="flex items-center gap-5 text-[13px] text-[#C7CEDB]">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          <span>{`고객센터 ${SUPPORT_CONTACT_NUMBER}`}</span>
        </div>
        <span className="h-3.5 w-px bg-[#2A3550]" />
        <span>{CURRENT_USER_DEPARTMENT}</span>
        <span className="h-3.5 w-px bg-[#2A3550]" />
        <span className="font-semibold text-white">{CURRENT_USER_NAME}님</span>
        <button
          type="button"
          onClick={handleLogoutClick}
          className="h-8 rounded-md border border-[#3A4663] px-3.5 text-[13px] text-white transition-colors hover:bg-white/10"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
