import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReasonImpact } from '@/features/reason-analysis/reasonAnalytics';

type ReasonImpactChartProps = {
  reasonImpacts: ReasonImpact[];
};

export function ReasonImpactChart({ reasonImpacts }: ReasonImpactChartProps) {
  const chartHeight = reasonImpacts.length * 40 + 32;

  return (
    <div style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={reasonImpacts}
          layout="vertical"
          margin={{ top: 8, right: 32, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="averageScore" fill="#466CFF" radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="averageScore"
              position="right"
              style={{ fontSize: 12, fill: '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
