import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyPoint } from '@/types/churn';

type CustomerTrendChartProps = {
  monthly: MonthlyPoint[];
};

type TrendChartRow = {
  month: string;
  usageActual: number | null;
  usagePredicted: number | null;
  riskActual: number | null;
  riskPredicted: number | null;
};

function buildTrendChartRows(monthly: MonthlyPoint[]): TrendChartRow[] {
  const firstPredictedIndex = monthly.findIndex((point) => point.predicted);

  return monthly.map((point, index) => {
    const isConnectorPoint =
      firstPredictedIndex > 0 && index === firstPredictedIndex - 1;
    const isActualSegment = !point.predicted || isConnectorPoint;
    const isPredictedSegment = point.predicted || isConnectorPoint;

    return {
      month: point.month,
      usageActual: isActualSegment ? point.usage : null,
      usagePredicted: isPredictedSegment ? point.usage : null,
      riskActual: isActualSegment ? point.riskScore : null,
      riskPredicted: isPredictedSegment ? point.riskScore : null,
    };
  });
}

const USAGE_COLOR = '#466CFF';
const RISK_COLOR = '#ef4444';

export function CustomerTrendChart({ monthly }: CustomerTrendChartProps) {
  const chartRows = buildTrendChartRows(monthly);
  const monthlyByMonth = new Map(monthly.map((point) => [point.month, point]));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="95%">
        <ComposedChart
          data={chartRows}
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
            yAxisId="usage"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(value: number) => `${value}만`}
          />
          <YAxis
            yAxisId="risk"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            content={({ active, label }) => {
              if (!active || typeof label !== 'string') {
                return null;
              }
              const point = monthlyByMonth.get(label);
              if (!point) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">
                    {point.month}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    카드 사용액:{' '}
                    <span className="font-semibold">{point.usage}만원</span>
                  </p>
                  <p className="text-sm text-gray-900">
                    위험점수:{' '}
                    <span className="font-semibold">{point.riskScore}점</span>
                  </p>
                </div>
              );
            }}
          />
          <Line
            yAxisId="usage"
            dataKey="usageActual"
            name="사용액"
            stroke={USAGE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            yAxisId="usage"
            dataKey="usagePredicted"
            name="사용액(예측)"
            stroke={USAGE_COLOR}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            yAxisId="risk"
            dataKey="riskActual"
            name="위험점수"
            stroke={RISK_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            yAxisId="risk"
            dataKey="riskPredicted"
            name="위험점수(예측)"
            stroke={RISK_COLOR}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex w-full flex-col items-center gap-1 text-xs text-gray-500">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-4"
              style={{ backgroundColor: USAGE_COLOR }}
            />
            사용액 (만원)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-4"
              style={{ backgroundColor: RISK_COLOR }}
            />
            위험점수
          </span>
        </div>
      </div>
    </div>
  );
}
