import { RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskBadgeProps = {
  riskLevel: RiskLevel;
};

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  const riskLevelMeta = RISK_LEVEL_META[riskLevel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${riskLevelMeta.badgeColorClassName}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${riskLevelMeta.dotColorClassName}`}
      />
      {riskLevelMeta.label}
    </span>
  );
}
