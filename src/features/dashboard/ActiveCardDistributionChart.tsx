import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router';
import type { ProductUsageStat } from '@/types/churn';

type ActiveCardDistributionChartProps = {
  stats: ProductUsageStat[];
  topCount?: number;
};

type ChartSlice = {
  key: string;
  label: string;
  count: number;
  isOther: boolean;
};

const OTHER_KEY = '__other__';
const OTHER_COLOR = '#c3c2b7';
const CATEGORICAL_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
];

function getSliceColor(slice: ChartSlice, index: number) {
  return slice.isOther ? OTHER_COLOR : CATEGORICAL_COLORS[index];
}

export function ActiveCardDistributionChart({
  stats,
  topCount = 5,
}: ActiveCardDistributionChartProps) {
  const navigate = useNavigate();
  const sortedStats = [...stats].sort((a, b) => b.activeCount - a.activeCount);
  const topStats = sortedStats.slice(0, topCount);
  const otherCount = sortedStats
    .slice(topCount)
    .reduce((sum, stat) => sum + stat.activeCount, 0);
  const totalCount = sortedStats.reduce(
    (sum, stat) => sum + stat.activeCount,
    0,
  );

  const chartSlices: ChartSlice[] = [
    ...topStats.map((stat) => ({
      key: stat.productName,
      label: stat.productName,
      count: stat.activeCount,
      isOther: false,
    })),
    ...(otherCount > 0
      ? [{ key: OTHER_KEY, label: '기타', count: otherCount, isOther: true }]
      : []),
  ];

  function handleSliceClick(slice: ChartSlice) {
    if (slice.isOther) {
      return;
    }
    navigate(`/card-list/${encodeURIComponent(slice.key)}`);
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartSlices}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {chartSlices.map((slice, index) => (
                <Cell
                  key={slice.key}
                  fill={getSliceColor(slice, index)}
                  onClick={() => handleSliceClick(slice)}
                  className={slice.isOther ? '' : 'cursor-pointer'}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const hoveredSlice = payload[0]?.payload as
                  ChartSlice | undefined;
                if (!hoveredSlice) {
                  return null;
                }

                const sliceRatio =
                  totalCount === 0
                    ? 0
                    : (hoveredSlice.count / totalCount) * 100;

                return (
                  <div className="rounded-lg border border-white/40 bg-white/60 px-3 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-xs font-medium text-gray-500">
                      {hoveredSlice.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {hoveredSlice.count.toLocaleString('ko-KR')}명
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        ({sliceRatio.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-3">
        {chartSlices.map((slice, index) => {
          const sliceRatio =
            totalCount === 0 ? 0 : (slice.count / totalCount) * 100;

          return (
            <li key={slice.key} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getSliceColor(slice, index) }}
              />
              {slice.isOther ? (
                <span className="font-medium text-gray-700">{slice.label}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSliceClick(slice)}
                  className="max-w-[180px] truncate font-medium text-primary hover:underline"
                  title={slice.label}
                >
                  {slice.label}
                </button>
              )}
              <span className="shrink-0 text-gray-400">
                {slice.count.toLocaleString('ko-KR')}명 ({sliceRatio.toFixed(1)}
                %)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
