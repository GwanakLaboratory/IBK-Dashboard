import { RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskBadgeProps = {
  riskLevel: RiskLevel;
};

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  const riskLevelMeta = RISK_LEVEL_META[riskLevel];

  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ${riskLevelMeta.badgeClassName}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${riskLevelMeta.dotColorClassName}`}
      />
      {riskLevelMeta.label}
    </span>
  );
}
