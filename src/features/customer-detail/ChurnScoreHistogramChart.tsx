import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RISK_LEVEL_META } from '@/utils/risk';

type ChurnScoreHistogramPoint = {
  month: string;
  high: number;
  mid: number;
  low: number;
};

type ChurnScoreHistogramChartProps = {
  data: ChurnScoreHistogramPoint[];
};

export function ChurnScoreHistogramChart({
  data,
}: ChurnScoreHistogramChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="95%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
                  {payload
                    .slice()
                    .reverse()
                    .map((entry, entryIndex) => (
                      <p key={entryIndex} className="text-sm text-gray-900">
                        {entry.name}:{' '}
                        <span className="font-semibold">
                          {Number(entry.value).toLocaleString('ko-KR')}명
                        </span>
                      </p>
                    ))}
                </div>
              );
            }}
          />
          <Bar
            dataKey="low"
            name={RISK_LEVEL_META.low.label}
            stackId="churn-score"
            fill={RISK_LEVEL_META.low.chartColor}
          />
          <Bar
            dataKey="mid"
            name={RISK_LEVEL_META.medium.label}
            stackId="churn-score"
            fill={RISK_LEVEL_META.medium.chartColor}
          />
          <Bar
            dataKey="high"
            name={RISK_LEVEL_META.high.label}
            stackId="churn-score"
            fill={RISK_LEVEL_META.high.chartColor}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_LEVEL_META.high.chartColor }}
          />
          {RISK_LEVEL_META.high.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_LEVEL_META.medium.chartColor }}
          />
          {RISK_LEVEL_META.medium.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_LEVEL_META.low.chartColor }}
          />
          {RISK_LEVEL_META.low.label}
        </span>
      </div>
    </div>
  );
}
