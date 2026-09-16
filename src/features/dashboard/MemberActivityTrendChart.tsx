import {
  Bar,
  BarChart,
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
const NEW_SIGNUP_BAR_COLOR = '#eb6834';
const Y_AXIS_WIDTH = 40;

function AxisBreakMark() {
  return (
    <div className="flex h-6 items-center" style={{ paddingLeft: 12 }}>
      <svg width={16} height={22} viewBox="0 0 16 22">
        <path
          d="M4,1 C7,4.5 1,7.5 4,11 C7,14.5 1,17.5 4,21"
          stroke="#9ca3af"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M12,1 C15,4.5 9,7.5 12,11 C15,14.5 9,17.5 12,21"
          stroke="#9ca3af"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function MemberActivityTrendChart({
  monthlyMemberActivity,
}: MemberActivityTrendChartProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-0.5 w-3 rounded-full"
            style={{ backgroundColor: ACTIVE_LINE_COLOR }}
          />
          이용 가능 회원수
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: NEW_SIGNUP_BAR_COLOR }}
          />
          신규 가입자수
        </span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyMemberActivity}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis dataKey="month" hide />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={Y_AXIS_WIDTH}
              domain={['dataMin - 1500', 'dataMax + 1500']}
              tickFormatter={(value: number) =>
                `${(value / 10000).toFixed(1)}만`
              }
            />
            <Tooltip
              content={({ active, label, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                return (
                  <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ACTIVE_LINE_COLOR }}
                      />
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

      <AxisBreakMark />

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyMemberActivity}
            margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={Y_AXIS_WIDTH}
              allowDecimals={false}
              domain={[0, 'dataMax + 150']}
            />
            <Tooltip
              content={({ active, label, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                return (
                  <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                      <span
                        className="h-2 w-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: NEW_SIGNUP_BAR_COLOR }}
                      />
                      {payload[0]?.value?.toLocaleString('ko-KR')}명
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="newSignups"
              name="신규 가입자수"
              fill={NEW_SIGNUP_BAR_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
