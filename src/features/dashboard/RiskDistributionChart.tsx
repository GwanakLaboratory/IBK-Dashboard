import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskDistributionChartProps = {
  countsByRiskLevel: Record<RiskLevel, number>;
  totalCustomerCount: number;
  /** 전월 값을 넘기면 표에 '전월' 증감 열을 보여준다. (카드 상세처럼 전월 데이터가 없으면 생략) */
  previousCountsByRiskLevel?: Record<RiskLevel, number>;
  previousTotalCustomerCount?: number;
};

type ChartSlice = {
  riskLevel: RiskLevel;
  label: string;
  count: number;
};

function formatSignedCount(value: number) {
  return `${value > 0 ? '+' : ''}${value.toLocaleString('ko-KR')}`;
}

export function RiskDistributionChart({
  countsByRiskLevel,
  previousCountsByRiskLevel,
  totalCustomerCount,
  previousTotalCustomerCount,
}: RiskDistributionChartProps) {
  const chartSlices: ChartSlice[] = RISK_LEVEL_DISPLAY_ORDER.map(
    (riskLevel) => ({
      riskLevel,
      label: RISK_LEVEL_META[riskLevel].label,
      count: countsByRiskLevel[riskLevel],
    }),
  );
  const getRatio = (count: number) =>
    totalCustomerCount === 0 ? 0 : (count / totalCustomerCount) * 100;
  const hasPrevious =
    previousCountsByRiskLevel !== undefined &&
    previousTotalCustomerCount !== undefined;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartSlices}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {chartSlices.map((slice) => (
                <Cell
                  key={slice.riskLevel}
                  fill={RISK_LEVEL_META[slice.riskLevel].chartColor}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const hoveredSlice = payload[0]?.payload as
                  ChartSlice | undefined;
                if (!hoveredSlice) {
                  return null;
                }

                return (
                  <div className="rounded-lg border border-white/40 bg-white/60 px-3 py-2 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            RISK_LEVEL_META[hoveredSlice.riskLevel].chartColor,
                        }}
                      />
                      <span className="text-xs font-medium text-gray-500">
                        {hoveredSlice.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {hoveredSlice.count.toLocaleString('ko-KR')}명
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        ({getRatio(hoveredSlice.count).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[12px] text-gray-500">위험군</span>
          <span className="text-[22px] font-bold text-red-700">
            {getRatio(countsByRiskLevel.high).toFixed(1)}%
          </span>
        </div>
      </div>

      <table className="w-full flex-1 border-collapse text-xs">
        <thead>
          <tr className="text-gray-500">
            <th className="px-1 py-1.5 text-left font-semibold">등급</th>
            <th className="px-1 py-1.5 text-right font-semibold">인원</th>
            <th className="px-1 py-1.5 text-right font-semibold">비중</th>
            {hasPrevious && (
              <th className="px-1 py-1.5 text-right font-semibold">전월</th>
            )}
          </tr>
        </thead>
        <tbody>
          {chartSlices.map((slice) => {
            const isLow = slice.riskLevel === 'low';
            return (
              <tr key={slice.riskLevel} className="border-t border-gray-100">
                <td className="px-1 py-2.5">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          RISK_LEVEL_META[slice.riskLevel].chartColor,
                      }}
                    />
                    {slice.label}
                  </span>
                </td>
                <td className="px-1 py-2.5 text-right text-gray-900">
                  {slice.count.toLocaleString('ko-KR')}
                </td>
                <td
                  className="px-1 py-2.5 text-right font-bold"
                  style={{ color: RISK_LEVEL_META[slice.riskLevel].chartColor }}
                >
                  {getRatio(slice.count).toFixed(1)}%
                </td>
                {hasPrevious && (
                  <td
                    className={`px-1 py-2.5 text-right ${
                      isLow ? 'text-gray-500' : 'text-red-700'
                    }`}
                  >
                    {formatSignedCount(
                      slice.count - previousCountsByRiskLevel[slice.riskLevel],
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          <tr className="border-t border-border">
            <td className="px-1 py-2.5 font-bold text-gray-900">합계</td>
            <td className="px-1 py-2.5 text-right font-bold text-gray-900">
              {totalCustomerCount.toLocaleString('ko-KR')}
            </td>
            <td className="px-1 py-2.5 text-right text-gray-900">100%</td>
            {hasPrevious && (
              <td className="px-1 py-2.5 text-right text-gray-500">
                {formatSignedCount(
                  totalCustomerCount - previousTotalCustomerCount,
                )}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
