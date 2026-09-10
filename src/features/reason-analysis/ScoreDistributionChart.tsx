import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RISK_LEVEL_META } from '@/utils/risk';
import type { ScoreHistogramBucket } from '@/features/reason-analysis/reasonAnalytics';

type ScoreDistributionChartProps = {
  buckets: ScoreHistogramBucket[];
};

export function ScoreDistributionChart({
  buckets,
}: ScoreDistributionChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={buckets}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="rangeLabel"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}점</p>
                  {payload
                    .filter((entry) => Number(entry.value) > 0)
                    .map((entry, entryIndex) => (
                      <p key={entryIndex} className="text-sm text-gray-900">
                        {entry.name}:{' '}
                        <span className="font-semibold">{entry.value}명</span>
                      </p>
                    ))}
                </div>
              );
            }}
          />
          <Bar
            dataKey="low"
            name={RISK_LEVEL_META.low.label}
            stackId="score"
            fill={RISK_LEVEL_META.low.chartColor}
          />
          <Bar
            dataKey="medium"
            name={RISK_LEVEL_META.medium.label}
            stackId="score"
            fill={RISK_LEVEL_META.medium.chartColor}
          />
          <Bar
            dataKey="high"
            name={RISK_LEVEL_META.high.label}
            stackId="score"
            fill={RISK_LEVEL_META.high.chartColor}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
