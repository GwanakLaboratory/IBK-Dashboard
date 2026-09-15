import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskDistributionChartProps = {
  countsByRiskLevel: Record<RiskLevel, number>;
  totalCustomerCount: number;
};

type ChartSlice = {
  riskLevel: RiskLevel;
  label: string;
  count: number;
};

export function RiskDistributionChart({
  countsByRiskLevel,
  totalCustomerCount,
}: RiskDistributionChartProps) {
  const chartSlices: ChartSlice[] = RISK_LEVEL_DISPLAY_ORDER.map(
    (riskLevel) => ({
      riskLevel,
      label: RISK_LEVEL_META[riskLevel].label,
      count: countsByRiskLevel[riskLevel],
    }),
  );

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartSlices}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="70%"
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

                const sliceRatio =
                  totalCustomerCount === 0
                    ? 0
                    : (hoveredSlice.count / totalCustomerCount) * 100;

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
                        ({sliceRatio.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-3">
        {chartSlices.map((slice) => {
          const sliceRatio =
            totalCustomerCount === 0
              ? 0
              : (slice.count / totalCustomerCount) * 100;

          return (
            <li
              key={slice.riskLevel}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: RISK_LEVEL_META[slice.riskLevel].chartColor,
                }}
              />
              <span className="font-medium text-gray-700">{slice.label}</span>
              <span className="text-gray-400">
                {slice.count.toLocaleString('ko-KR')}명 ({sliceRatio.toFixed(1)}
                %)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
