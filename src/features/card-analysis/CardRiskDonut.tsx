import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

const RISK_ROW_TINT: Record<RiskLevel, string> = {
  high: 'bg-red-50',
  medium: 'bg-amber-50',
  low: 'bg-emerald-50',
};

type CardRiskDonutProps = {
  countsByRiskLevel: Record<RiskLevel, number>;
  totalCustomerCount: number;
};

export function CardRiskDonut({
  countsByRiskLevel,
  totalCustomerCount,
}: CardRiskDonutProps) {
  const slices = RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => ({
    riskLevel,
    count: countsByRiskLevel[riskLevel],
    ratio:
      totalCustomerCount === 0
        ? 0
        : (countsByRiskLevel[riskLevel] / totalCustomerCount) * 100,
  }));
  const highRatio = slices.find((slice) => slice.riskLevel === 'high')!.ratio;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div className="relative h-[168px] w-[168px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="count"
              cx="50%"
              cy="50%"
              innerRadius="64%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell
                  key={slice.riskLevel}
                  fill={RISK_LEVEL_META[slice.riskLevel].chartColor}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-xs text-gray-500">위험군</span>
          <span className="text-[28px] font-bold tracking-tight text-red-700">
            {highRatio.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-1">
        {slices.map((slice) => (
          <div
            key={slice.riskLevel}
            className={`flex h-10 items-center justify-between rounded-lg px-3 ${RISK_ROW_TINT[slice.riskLevel]}`}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-900">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: RISK_LEVEL_META[slice.riskLevel].chartColor,
                }}
              />
              {RISK_LEVEL_META[slice.riskLevel].label}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: RISK_LEVEL_META[slice.riskLevel].chartColor }}
            >
              {slice.ratio.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
