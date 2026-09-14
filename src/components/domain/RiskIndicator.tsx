import { RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskIndicatorProps = {
  riskLevel: RiskLevel;
};

export function RiskIndicator({ riskLevel }: RiskIndicatorProps) {
  const riskLevelMeta = RISK_LEVEL_META[riskLevel];

  return (
    <span
      role="img"
      aria-label={riskLevelMeta.label}
      title={riskLevelMeta.label}
      className={`inline-block h-3 w-3 rounded-full ${riskLevelMeta.dotColorClassName}`}
    />
  );
}
