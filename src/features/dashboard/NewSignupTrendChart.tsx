import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyMemberActivityPoint } from '@/types/churn';

type NewSignupTrendChartProps = {
  monthlyMemberActivity: MonthlyMemberActivityPoint[];
};

const LINE_COLOR = '#466cff';

export function NewSignupTrendChart({
  monthlyMemberActivity,
}: NewSignupTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyMemberActivity}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
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
            width={40}
            allowDecimals={false}
            domain={['dataMin - 50', 'dataMax + 50']}
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
                    {payload[0]?.value?.toLocaleString('ko-KR')}명 신규 가입
                  </p>
                </div>
              );
            }}
          />
          <Line
            dataKey="newSignups"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
