import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RISK_LEVEL_META } from '@/utils/risk';
import type { MonthlyRiskDistributionPoint } from '@/types/churn';

type MonthlyRiskDistributionTrendChartProps = {
  monthlyRiskDistribution: MonthlyRiskDistributionPoint[];
};

export function MonthlyRiskDistributionTrendChart({
  monthlyRiskDistribution,
}: MonthlyRiskDistributionTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="95%">
        <AreaChart
          data={monthlyRiskDistribution}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  {payload
                    .slice()
                    .reverse()
                    .map((entry, entryIndex) => (
                      <p key={entryIndex} className="text-sm text-gray-900">
                        {entry.name}:{' '}
                        <span className="font-semibold">{entry.value}%</span>
                      </p>
                    ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="low"
            name={RISK_LEVEL_META.low.label}
            stackId="risk-distribution"
            stroke={RISK_LEVEL_META.low.chartColor}
            fill={RISK_LEVEL_META.low.chartColor}
            fillOpacity={0.35}
          />
          <Area
            type="monotone"
            dataKey="mid"
            name={RISK_LEVEL_META.medium.label}
            stackId="risk-distribution"
            stroke={RISK_LEVEL_META.medium.chartColor}
            fill={RISK_LEVEL_META.medium.chartColor}
            fillOpacity={0.35}
          />
          <Area
            type="monotone"
            dataKey="high"
            name={RISK_LEVEL_META.high.label}
            stackId="risk-distribution"
            stroke={RISK_LEVEL_META.high.chartColor}
            fill={RISK_LEVEL_META.high.chartColor}
            fillOpacity={0.35}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_LEVEL_META.high.chartColor }}
          />
          {RISK_LEVEL_META.high.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_LEVEL_META.low.chartColor }}
          />
          {RISK_LEVEL_META.low.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_LEVEL_META.medium.chartColor }}
          />
          {RISK_LEVEL_META.medium.label}
        </span>
      </div>
    </div>
  );
}
