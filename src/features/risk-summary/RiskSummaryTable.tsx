import { RiskBadge } from '@/components/domain/RiskBadge';
import { RISK_LEVEL_ORDER } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskSummaryTableProps = {
  countsByRiskLevel: Record<RiskLevel, number>;
  totalCustomerCount: number;
};

export function RiskSummaryTable({
  countsByRiskLevel,
  totalCustomerCount,
}: RiskSummaryTableProps) {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="pb-2 font-medium">위험도</th>
            <th className="pb-2 text-right font-medium">인원수</th>
            <th className="pb-2 text-right font-medium">비율</th>
          </tr>
        </thead>
        <tbody>
          {RISK_LEVEL_ORDER.map((riskLevel) => {
            const customerCount = countsByRiskLevel[riskLevel];
            const customerRatio =
              totalCustomerCount === 0
                ? 0
                : (customerCount / totalCustomerCount) * 100;

            return (
              <tr
                key={riskLevel}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="py-3">
                  <RiskBadge riskLevel={riskLevel} />
                </td>
                <td className="py-3 text-right text-base font-semibold text-gray-900">
                  {customerCount}
                </td>
                <td className="py-3 text-right text-gray-500">
                  {customerRatio.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-right text-xs text-gray-400">
        전체 {totalCustomerCount}명
      </p>
    </div>
  );
}
