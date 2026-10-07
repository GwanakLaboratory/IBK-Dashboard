import { RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskBadgeProps = {
  riskLevel: RiskLevel;
  /** lg: 제목 옆·회원 목록처럼 크게 */
  size?: 'md' | 'lg';
};

const SIZE_CLASS_NAME = {
  md: 'h-6 px-2.5 text-xs font-semibold',
  lg: 'h-7 px-3 text-sm font-bold',
};

/** 위험 / 중위험 / 저위험 알약 배지 */
export function RiskBadge({ riskLevel, size = 'md' }: RiskBadgeProps) {
  const riskLevelMeta = RISK_LEVEL_META[riskLevel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full ${SIZE_CLASS_NAME[size]} ${riskLevelMeta.badgeClassName}`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${riskLevelMeta.dotColorClassName}`}
      />
      {riskLevelMeta.label}
    </span>
  );
}
