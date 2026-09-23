import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildMonthlySegmentUsage } from '@/features/customer-detail/segmentUsage';
import type { MonthlyMemberActivityPoint, MonthlyPoint } from '@/types/churn';

type MemberSegmentAvgUsageChartProps = {
  monthlyTotalUsage: MonthlyPoint[];
  monthlyMemberActivity: MonthlyMemberActivityPoint[];
};

const EXISTING_COLOR = '#466cff';
const NEW_COLOR = '#eb6834';

export function MemberSegmentAvgUsageChart({
  monthlyTotalUsage,
  monthlyMemberActivity,
}: MemberSegmentAvgUsageChartProps) {
  const segmentData = useMemo(
    () => buildMonthlySegmentUsage(monthlyTotalUsage, monthlyMemberActivity),
    [monthlyTotalUsage, monthlyMemberActivity],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: EXISTING_COLOR }}
          />
          기존 회원
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: NEW_COLOR }}
          />
          신규 회원
        </span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={segmentData}
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
              width={52}
              tickFormatter={(value: number) =>
                `${(value / 10000).toFixed(0)}만`
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
                    {payload.map((entry, entryIndex) => (
                      <p
                        key={entryIndex}
                        className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        {entry.name}:{' '}
                        {Number(entry.value).toLocaleString('ko-KR')}원
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="existingMemberAvgUsage"
              name="기존 회원"
              fill={EXISTING_COLOR}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="newMemberAvgUsage"
              name="신규 회원"
              fill={NEW_COLOR}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
