import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChurnRateBreakdown } from '@/types/churn';

type ChurnRateComparisonChartProps = {
  items: ChurnRateBreakdown[];
};

const CATEGORICAL_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
];

export function ChurnRateComparisonChart({
  items,
}: ChurnRateComparisonChartProps) {
  const chartHeight = items.length * 48 + 32;

  return (
    <div style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 8, right: 40, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 'dataMax + 5']}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width="auto"
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              const item = payload[0]?.payload as
                ChurnRateBreakdown | undefined;
              if (!item) {
                return null;
              }

              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    이탈률 {item.churnRate}%
                  </p>
                  <p className="text-xs text-gray-400">
                    발급 {item.issuedCount.toLocaleString('ko-KR')}명 · 해지{' '}
                    {item.canceledCount.toLocaleString('ko-KR')}명
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="churnRate" radius={[0, 4, 4, 0]}>
            {items.map((item, index) => (
              <Cell
                key={item.label}
                fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]}
              />
            ))}
            <LabelList
              dataKey="churnRate"
              position="right"
              formatter={(value: unknown) => `${value}%`}
              style={{ fontSize: 12, fill: '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
