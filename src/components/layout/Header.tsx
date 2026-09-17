import { Button } from '@/components/atoms/Button';
import { Divider } from '@/components/atoms/Divider';
import { LogOut } from 'lucide-react';

const DASHBOARD_TITLE = 'IBK CARD RISK INSIGHT';
const SUPPORT_CONTACT_NUMBER = '1588-2588, 1566-2566';
const CURRENT_USER_DEPARTMENT = '카드사업부';
const CURRENT_USER_NAME = 'IBK';

export function Header() {
  const handleLogoutClick = () => {
    console.log('click logout');
  };

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900">
          {DASHBOARD_TITLE}
        </h1>
        <div className="flex items-center gap-5 text-xs text-gray-600">
          <span>{`고객 센터: ${SUPPORT_CONTACT_NUMBER}`}</span>
          <div className="flex gap-3">
            <span>{CURRENT_USER_DEPARTMENT}</span>
            <Divider />
            <span>{CURRENT_USER_NAME}님</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogoutClick}
            className="text-xs text-gray-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
