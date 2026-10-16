import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dropdown, type DropdownOption } from '@/components/molecules/Dropdown';

type MonthSelectProps = {
  /** 고를 수 있는 월 (최신 월이 앞) */
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /** 펼친 목록을 버튼의 어느 쪽에 맞출지 (기본 오른쪽) */
  align?: 'left' | 'right';
};

/** 달력 아이콘이 붙은 기준 월 드롭다운 */
export function MonthSelect({ align = 'right', ...props }: MonthSelectProps) {
  const { t } = useTranslation();
  return (
    <Dropdown
      label={t('common.monthSelect.label')}
      icon={CalendarDays}
      align={align}
      className="min-w-44"
      {...props}
    />
  );
}
