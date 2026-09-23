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

type MonthlyUsageTrendChartProps = {
  monthlyTotalUsage: MonthlyPoint[];
};

const LINE_COLOR = '#466cff';

export function MonthlyUsageTrendChart({
  monthlyTotalUsage,
}: MonthlyUsageTrendChartProps) {
  return (
    <div className="h-[308px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyTotalUsage}
          margin={{ top: 8, right: 28, bottom: 0, left: 0 }}
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
            width={48}
            tickFormatter={(value: number) => `${(value / 10000).toFixed(1)}억`}
          />
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {(Number(payload[0]?.value) / 10000).toFixed(1)}억원
                  </p>
                </div>
              );
            }}
          />
          <Line
            dataKey="usage"
            name="카드 사용액"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
