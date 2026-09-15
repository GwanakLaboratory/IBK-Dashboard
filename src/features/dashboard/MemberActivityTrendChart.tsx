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

type MemberActivityTrendChartProps = {
  monthlyMemberActivity: MonthlyMemberActivityPoint[];
};

const ACTIVE_LINE_COLOR = '#466cff';

export function MemberActivityTrendChart({
  monthlyMemberActivity,
}: MemberActivityTrendChartProps) {
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
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={['dataMin - 2000', 'dataMax + 2000']}
            tickFormatter={(value: number) => `${(value / 10000).toFixed(1)}만`}
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
                    {payload[0]?.value?.toLocaleString('ko-KR')}명
                  </p>
                </div>
              );
            }}
          />
          <Line
            dataKey="activeMembers"
            name="이용 가능 회원수"
            stroke={ACTIVE_LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
