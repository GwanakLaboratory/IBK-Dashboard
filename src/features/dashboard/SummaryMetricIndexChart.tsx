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

export type SummaryMetricSeries = {
  key: string;
  label: string;
  /** 지표마다 고정된 색 (단일 지표 차트와 같은 색을 유지한다) */
  color: string;
  data: { month: string; value: number }[];
  valueFormatter: (value: number) => string;
};

type SummaryMetricIndexChartProps = {
  series: SummaryMetricSeries[];
};

const BASE_INDEX = 100;

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * 단위가 다른 지표를 한 차트에 그리기 위해, 첫 달 값을 100으로 둔 지수로 바꿔서
 * 같은 축에서 비교한다. (두 개의 y축을 쓰지 않는다) 실제 값은 툴팁에서 보여준다.
 */
export function SummaryMetricIndexChart({
  series,
}: SummaryMetricIndexChartProps) {
  const months = series[0]?.data.map((point) => point.month) ?? [];
  const chartData = months.map((month, monthIndex) => {
    const row: Record<string, number | string> = { month };
    series.forEach((item) => {
      const baseValue = item.data[0]?.value ?? 0;
      const value = item.data[monthIndex]?.value ?? 0;
      row[item.key] = baseValue === 0 ? BASE_INDEX : (value / baseValue) * 100;
      row[`${item.key}Raw`] = value;
    });
    return row;
  });

  const indexValues = chartData.flatMap((row) =>
    series.map((item) => Number(row[item.key])),
  );
  const minIndex = Math.min(BASE_INDEX, ...indexValues);
  const maxIndex = Math.max(BASE_INDEX, ...indexValues);
  const indexPadding = Math.max((maxIndex - minIndex) * 0.15, 1);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        {series.map((item) => {
          const firstValue = item.data[0]?.value ?? 0;
          const lastValue = item.data[item.data.length - 1]?.value ?? 0;
          const changePercent =
            firstValue === 0 ? 0 : (lastValue / firstValue - 1) * 100;

          return (
            <li key={item.key} className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-gray-700">{item.label}</span>
              <span className="text-gray-500">
                {months[0]} 대비 {formatSignedPercent(changePercent)}
              </span>
            </li>
          );
        })}
        <li className="ml-auto text-gray-400">
          {months[0]} = {BASE_INDEX} 기준 지수
        </li>
      </ul>

      {/* 범례 줄만큼 줄여서 단일 지표 차트(280px)와 카드 높이를 맞춘다 */}
      <div className="h-[252px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
          >
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e3e7ee' }}
              tickLine={false}
              interval={0}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              hide
              domain={[minIndex - indexPadding, maxIndex + indexPadding]}
            />
            <ReferenceLine
              y={BASE_INDEX}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
            />
            <Tooltip
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              content={({ active, label, payload }) => {
                const row = payload?.[0]?.payload as
                  Record<string, number | string> | undefined;
                if (!active || !row) {
                  return null;
                }
                return (
                  <div className="rounded-lg border border-white/40 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {series.map((item) => (
                        <li
                          key={item.key}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-600">{item.label}</span>
                          <span className="ml-auto font-semibold text-gray-900">
                            {item.valueFormatter(Number(row[`${item.key}Raw`]))}
                          </span>
                          <span className="w-10 text-right text-gray-400">
                            {Number(row[item.key]).toFixed(1)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }}
            />
            {series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                dot={{ r: 2.5, fill: item.color, strokeWidth: 0 }}
                activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
