import { Button } from '@/components/atoms/Button';
import { Divider } from '@/components/atoms/Divider';
import { LogOut } from 'lucide-react';

const DASHBOARD_TITLE = '카드 고객 이탈 방지 예측 대시보드';
const CURRENT_USER_DEPARTMENT = '카드사업부';
const CURRENT_USER_NAME = 'IBK';

export function Header() {
  const handleLogoutClick = () => {
    console.log('click logout');
  };

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-lg font-medium text-primary">{DASHBOARD_TITLE}</h1>
        <div className="flex items-center gap-5">
          <div className="flex gap-3 text-xs text-gray-600">
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
