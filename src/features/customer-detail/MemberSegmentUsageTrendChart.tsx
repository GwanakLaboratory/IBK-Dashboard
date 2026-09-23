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
import { buildMonthlySegmentUsage } from '@/features/customer-detail/segmentUsage';
import type { MonthlyMemberActivityPoint, MonthlyPoint } from '@/types/churn';

type MemberSegmentUsageTrendChartProps = {
  monthlyTotalUsage: MonthlyPoint[];
  monthlyMemberActivity: MonthlyMemberActivityPoint[];
};

const EXISTING_COLOR = '#466cff';
const NEW_COLOR = '#eb6834';
const Y_AXIS_WIDTH = 48;

function formatEok(value: number, fractionDigits: number) {
  return `${(value / 100000000).toFixed(fractionDigits)}억`;
}

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

export function MemberSegmentUsageTrendChart({
  monthlyTotalUsage,
  monthlyMemberActivity,
}: MemberSegmentUsageTrendChartProps) {
  const segmentData = useMemo(
    () => buildMonthlySegmentUsage(monthlyTotalUsage, monthlyMemberActivity),
    [monthlyTotalUsage, monthlyMemberActivity],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-0.5 w-3 rounded-full"
            style={{ backgroundColor: EXISTING_COLOR }}
          />
          기존 회원
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-0.5 w-3 rounded-full"
            style={{ backgroundColor: NEW_COLOR }}
          />
          신규 회원
        </span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={segmentData}
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
              domain={['dataMin - 1000000000', 'dataMax + 1000000000']}
              tickFormatter={(value: number) => formatEok(value, 0)}
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
                        style={{ backgroundColor: EXISTING_COLOR }}
                      />
                      {formatEok(Number(payload[0]?.value), 1)}원
                    </p>
                  </div>
                );
              }}
            />
            <Line
              dataKey="existingMemberTotalUsage"
              name="기존 회원"
              stroke={EXISTING_COLOR}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AxisBreakMark />

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={segmentData}
            margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
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
              domain={['dataMin - 200000000', 'dataMax + 200000000']}
              tickFormatter={(value: number) => formatEok(value, 1)}
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
                        style={{ backgroundColor: NEW_COLOR }}
                      />
                      {formatEok(Number(payload[0]?.value), 1)}원
                    </p>
                  </div>
                );
              }}
            />
            <Line
              dataKey="newMemberTotalUsage"
              name="신규 회원"
              stroke={NEW_COLOR}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
