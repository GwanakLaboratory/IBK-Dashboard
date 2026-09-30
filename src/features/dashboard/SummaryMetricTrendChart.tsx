import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type SummaryMetricTrendChartProps = {
  data: { month: string; value: number }[];
  valueFormatter: (value: number) => string;
};

function dataMax(data: { value: number }[]) {
  return Math.max(...data.map((point) => point.value));
}

export function SummaryMetricTrendChart({
  data,
  valueFormatter,
}: SummaryMetricTrendChartProps) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e3e7ee' }}
            tickLine={false}
            interval={0}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            hide
            domain={[
              (dataMin: number) => dataMin - (dataMax(data) - dataMin) * 0.15,
              'dataMax',
            ]}
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
                    {valueFormatter(Number(payload[0]?.value))}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1B4FD8"
            fill="#DBEAFE"
            fillOpacity={0.6}
            strokeWidth={2.4}
            dot={{ r: 2.5, fill: '#1B4FD8', strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
