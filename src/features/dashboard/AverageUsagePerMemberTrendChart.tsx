import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyMemberActivityPoint, MonthlyPoint } from '@/types/churn';

type AverageUsagePerMemberTrendChartProps = {
  monthlyTotalUsage: MonthlyPoint[];
  monthlyMemberActivity: MonthlyMemberActivityPoint[];
};

type AverageUsagePoint = {
  month: string;
  avgUsagePerMember: number; // 원 단위
};

const LINE_COLOR = '#eb6834';

export function AverageUsagePerMemberTrendChart({
  monthlyTotalUsage,
  monthlyMemberActivity,
}: AverageUsagePerMemberTrendChartProps) {
  const activeMembersByMonth = useMemo(
    () =>
      new Map(
        monthlyMemberActivity.map((point) => [
          point.month,
          point.activeMembers,
        ]),
      ),
    [monthlyMemberActivity],
  );

  const averageUsageData: AverageUsagePoint[] = useMemo(
    () =>
      monthlyTotalUsage.map((point) => {
        const activeMembers = activeMembersByMonth.get(point.month) ?? 0;
        const avgUsagePerMember =
          activeMembers === 0
            ? 0
            : Math.round((point.usage * 10000) / activeMembers);
        return { month: point.month, avgUsagePerMember };
      }),
    [monthlyTotalUsage, activeMembersByMonth],
  );

  return (
    <div className="h-[308px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={averageUsageData}
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
            tickFormatter={(value: number) => `${(value / 10000).toFixed(0)}만`}
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
                    {Number(payload[0]?.value).toLocaleString('ko-KR')}원
                  </p>
                </div>
              );
            }}
          />
          <Line
            dataKey="avgUsagePerMember"
            name="1인당 평균 카드 사용액"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
