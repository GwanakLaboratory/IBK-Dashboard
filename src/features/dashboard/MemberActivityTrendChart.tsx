import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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
const SIGNUP_BAR_COLOR = '#c7d2fe';

export function MemberActivityTrendChart({
  monthlyMemberActivity,
}: MemberActivityTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="95%">
        <ComposedChart
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
            yAxisId="active"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={['dataMin - 2000', 'dataMax + 2000']}
            tickFormatter={(value: number) => `${(value / 10000).toFixed(1)}만`}
          />
          <YAxis
            yAxisId="signup"
            orientation="right"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  {payload.map((entry, entryIndex) => (
                    <p key={entryIndex} className="text-sm text-gray-900">
                      {entry.name}:{' '}
                      <span className="font-semibold">
                        {typeof entry.value === 'number'
                          ? entry.value.toLocaleString('ko-KR')
                          : entry.value}
                        명
                      </span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Bar
            yAxisId="signup"
            dataKey="newSignups"
            name="신규 가입자"
            fill={SIGNUP_BAR_COLOR}
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Line
            yAxisId="active"
            dataKey="activeMembers"
            name="이용 가능 회원수"
            stroke={ACTIVE_LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: ACTIVE_LINE_COLOR }}
          />
          이용 가능 회원수
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: SIGNUP_BAR_COLOR }}
          />
          신규 가입자
        </span>
      </div>
    </div>
  );
}
