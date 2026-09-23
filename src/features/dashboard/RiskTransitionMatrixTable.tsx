import {
  RISK_LEVEL_DISPLAY_ORDER,
  RISK_LEVEL_META,
  getRiskLevelRank,
} from '@/utils/risk';
import type { RiskLevel, RiskTransitionRow } from '@/types/churn';

type RiskTransitionMatrixTableProps = {
  rows: RiskTransitionRow[];
  fromMonth: string;
  toMonth: string;
};

function getCellClassName(from: RiskLevel, to: RiskLevel) {
  const fromRank = getRiskLevelRank(from);
  const toRank = getRiskLevelRank(to);
  if (fromRank === toRank) {
    return 'bg-gray-50 text-gray-700';
  }
  return toRank > fromRank
    ? 'bg-red-50 text-red-700'
    : 'bg-emerald-50 text-emerald-700';
}

export function RiskTransitionMatrixTable({
  rows,
  fromMonth,
  toMonth,
}: RiskTransitionMatrixTableProps) {
  const rowsByLevel = new Map(rows.map((row) => [row.from, row]));
  const totalCount = rows.reduce((sum, row) => sum + row.totalCount, 0);

  const { worsenedCount, improvedCount } = rows.reduce(
    (acc, row) => {
      RISK_LEVEL_DISPLAY_ORDER.forEach((to) => {
        const count = (row.totalCount * row.to[to]) / 100;
        const toRank = getRiskLevelRank(to);
        const fromRank = getRiskLevelRank(row.from);
        if (toRank > fromRank) {
          acc.worsenedCount += count;
        } else if (toRank < fromRank) {
          acc.improvedCount += count;
        }
      });
      return acc;
    },
    { worsenedCount: 0, improvedCount: 0 },
  );
  const worsenedRatio =
    totalCount === 0 ? 0 : (worsenedCount / totalCount) * 100;
  const improvedRatio =
    totalCount === 0 ? 0 : (improvedCount / totalCount) * 100;

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-3 pb-2 text-left text-xs font-medium text-gray-400">
              {fromMonth} → {toMonth}
            </th>
            {RISK_LEVEL_DISPLAY_ORDER.map((to) => (
              <th
                key={to}
                className="px-3 pb-2 text-center text-xs font-medium text-gray-500"
              >
                {RISK_LEVEL_META[to].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RISK_LEVEL_DISPLAY_ORDER.map((from) => {
            const row = rowsByLevel.get(from);
            if (!row) {
              return null;
            }
            return (
              <tr key={from} className="border-t border-gray-100">
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">
                  {RISK_LEVEL_META[from].label}
                  <span className="ml-1 font-normal text-gray-400">
                    ({row.totalCount.toLocaleString('ko-KR')}명)
                  </span>
                </th>
                {RISK_LEVEL_DISPLAY_ORDER.map((to) => (
                  <td
                    key={to}
                    className={`px-3 py-3 text-center font-semibold ${getCellClassName(from, to)}`}
                  >
                    {row.to[to]}%
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs">
        <div className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-50 ring-1 ring-red-200" />
            악화
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gray-50 ring-1 ring-gray-200" />
            유지
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-50 ring-1 ring-emerald-200" />
            개선
          </span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <span className="text-red-600">악화 {worsenedRatio.toFixed(1)}%</span>
          <span className="text-emerald-600">
            개선 {improvedRatio.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
