import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
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
            <th className="px-3 pb-2 font-medium">위험도</th>
            <th className="px-3 pb-2 text-right font-medium">인원수</th>
            <th className="px-3 pb-2 text-right font-medium">비율</th>
          </tr>
        </thead>
        <tbody>
          {RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => {
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
                <td className="px-3 py-3">
                  <span className="flex items-center gap-2">
                    <RiskIndicator riskLevel={riskLevel} />
                    <span className="text-gray-700">
                      {RISK_LEVEL_META[riskLevel].label}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-base font-semibold text-gray-900">
                  {customerCount}
                </td>
                <td className="px-3 py-3 text-right text-gray-500">
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
