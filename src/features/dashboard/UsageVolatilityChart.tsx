import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyPoint } from '@/types/churn';

type UsageVolatilityChartProps = {
  monthlyTotalUsage: MonthlyPoint[];
};

type VolatilityPoint = {
  month: string;
  changePercent: number;
};

const POSITIVE_COLOR = '#0ca30c';
const NEGATIVE_COLOR = '#d03b3b';

export function UsageVolatilityChart({
  monthlyTotalUsage,
}: UsageVolatilityChartProps) {
  const volatilityData: VolatilityPoint[] = useMemo(
    () =>
      monthlyTotalUsage.slice(1).map((point, index) => {
        const previousUsage = monthlyTotalUsage[index].usage;
        const changePercent =
          previousUsage === 0
            ? 0
            : Math.round(
                ((point.usage - previousUsage) / previousUsage) * 1000,
              ) / 10;
        return { month: point.month, changePercent };
      }),
    [monthlyTotalUsage],
  );

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={volatilityData}
          margin={{ top: 20, right: 28, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(value: number) => `${value}%`}
          />
          <ReferenceLine y={0} stroke="#c3c2b7" />
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              const value = Number(payload[0]?.value);

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    전월 대비 {value > 0 ? '+' : ''}
                    {value}%
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="changePercent" radius={[4, 4, 4, 4]} maxBarSize={28}>
            {volatilityData.map((point) => (
              <Cell
                key={point.month}
                fill={
                  point.changePercent >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR
                }
              />
            ))}
            <LabelList
              dataKey="changePercent"
              position="top"
              formatter={(value: unknown) =>
                `${Number(value) > 0 ? '+' : ''}${value}%`
              }
              style={{ fontSize: 11, fill: '#52514e' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
