import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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
const AVERAGE_COLOR = '#9ca3af';
const LOWER_BOUND_COLOR = '#f59e0b';
const FUTURE_MONTH_COUNT = 3;

function buildFutureMonth(lastMonth: string, offset: number) {
  const [year, month] = lastMonth.split('.').map(Number);
  const totalMonths = year * 12 + (month - 1) + offset;
  const futureYear = Math.floor(totalMonths / 12);
  const futureMonth = (totalMonths % 12) + 1;
  return `${String(futureYear).padStart(2, '0')}.${String(futureMonth).padStart(2, '0')}`;
}

export function CustomerTrendChart({ monthly }: CustomerTrendChartProps) {
  const usageValues = monthly.map((point) => point.usage);
  const averageUsage = Math.round(
    usageValues.reduce((sum, usage) => sum + usage, 0) / usageValues.length,
  );
  const lowerBoundUsage = Math.min(...usageValues);

  const lastMonth = monthly[monthly.length - 1]?.month ?? '';
  const chartData = [
    ...monthly,
    ...Array.from({ length: FUTURE_MONTH_COUNT }, (_, index) => ({
      month: buildFutureMonth(lastMonth, index + 1),
      usage: null,
    })),
  ];

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="95%">
        <LineChart
          data={chartData}
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
              const usage = payload?.[0]?.value;
              if (!active || usage == null) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-sm text-gray-900">
                    카드 사용액:{' '}
                    <span className="font-semibold">{usage}만원</span>
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={averageUsage}
            stroke={AVERAGE_COLOR}
            strokeDasharray="4 4"
            label={{
              value: `평균 ${averageUsage}만`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: AVERAGE_COLOR,
            }}
          />
          <ReferenceLine
            y={lowerBoundUsage}
            stroke={LOWER_BOUND_COLOR}
            strokeDasharray="4 4"
            label={{
              value: `하한 ${lowerBoundUsage}만`,
              position: 'insideBottomRight',
              fontSize: 11,
              fill: LOWER_BOUND_COLOR,
            }}
          />
          <Line
            dataKey="usage"
            name="사용액"
            stroke={USAGE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
