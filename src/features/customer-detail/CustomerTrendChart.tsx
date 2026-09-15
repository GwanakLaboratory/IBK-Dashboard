import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyPoint } from '@/types/churn';

type CustomerTrendChartProps = {
  monthly: MonthlyPoint[];
};

const USAGE_COLOR = '#466CFF';

export function CustomerTrendChart({ monthly }: CustomerTrendChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="95%">
        <LineChart
          data={monthly}
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
            width={48}
            tickFormatter={(value: number) => `${value}만`}
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
                    카드 사용액:{' '}
                    <span className="font-semibold">
                      {payload[0]?.value}만원
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Line
            dataKey="usage"
            name="사용액"
            stroke={USAGE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
