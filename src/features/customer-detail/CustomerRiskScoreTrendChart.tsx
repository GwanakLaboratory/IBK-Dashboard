import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RiskScoreTrendPoint } from '@/types/churn';

type CustomerRiskScoreTrendChartProps = {
  riskScoreTrend: RiskScoreTrendPoint[];
};

const SCORE_COLOR = '#ef4444';

export function CustomerRiskScoreTrendChart({
  riskScoreTrend,
}: CustomerRiskScoreTrendChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="95%">
        <LineChart
          data={riskScoreTrend}
          margin={{ top: 8, right: 28, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-sm text-gray-900">
                    이탈 스코어:{' '}
                    <span className="font-semibold">{payload[0]?.value}점</span>
                  </p>
                </div>
              );
            }}
          />
          <Line
            dataKey="score"
            name="이탈 스코어"
            stroke={SCORE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
