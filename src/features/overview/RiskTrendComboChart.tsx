import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLOR } from '@/components/charts/chartColors';
import { formatNumber } from '@/data/overview';

type RiskTrendComboChartProps = {
  months: string[];
  counts: number[];
  ratios: number[];
  /** 강조할 지표. 다른 쪽은 흐리게 보여준다 (기본 고객 수) */
  focus?: 'count' | 'ratio';
};

// 강조하지 않는 지표의 투명도
const DIMMED_OPACITY = 0.35;

const COLOR = {
  bar: CHART_COLOR.primarySoft,
  barLast: CHART_COLOR.danger,
  line: CHART_COLOR.primary,
  band: CHART_COLOR.dangerBand,
  callout: CHART_COLOR.dangerStrong,
  axis: CHART_COLOR.axis,
  axisStrong: CHART_COLOR.axisStrong,
  barLabel: CHART_COLOR.label,
  grid: CHART_COLOR.grid,
  baseline: CHART_COLOR.baseline,
};

const COUNT_TICKS = [0, 20000, 40000, 60000, 80000];
const RATIO_TICKS = [20, 30, 40, 50, 60];

type LabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
  value?: unknown;
};

/** 막대(이탈 위험 고객 수, 왼쪽 축) + 선(이탈 위험 비중, 오른쪽 축). 마지막 달을 빨강으로 강조한다. */
export function RiskTrendComboChart({
  months,
  counts,
  ratios,
  focus = 'count',
}: RiskTrendComboChartProps) {
  const data = months.map((month, index) => ({
    // 월은 두 자리로 (예: 09월)
    month: `${month.slice(3)}월`,
    count: counts[index],
    ratio: ratios[index],
  }));
  const lastIndex = data.length - 1;
  const lastMonth = data[lastIndex].month;
  const lastDiff = counts[lastIndex] - counts[lastIndex - 1];
  const isLong = data.length > 6;
  const barOpacity = focus === 'count' ? 1 : DIMMED_OPACITY;
  const lineOpacity = focus === 'ratio' ? 1 : DIMMED_OPACITY;

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 28, right: 4, bottom: 0, left: 4 }}
        >
          <ReferenceArea
            yAxisId="count"
            x1={lastMonth}
            x2={lastMonth}
            fill={COLOR.band}
            fillOpacity={1}
            radius={10}
            ifOverflow="extendDomain"
          />
          <CartesianGrid
            yAxisId="count"
            vertical={false}
            strokeDasharray="4 4"
            stroke={COLOR.grid}
          />
          <XAxis
            dataKey="month"
            axisLine={{ stroke: COLOR.baseline }}
            tickLine={false}
            interval={0}
            tick={({ x, y, payload }) => {
              const isLast = payload.value === lastMonth;
              return (
                <text
                  x={x}
                  y={Number(y) + 12}
                  textAnchor="middle"
                  className="text-xs"
                  fill={isLast ? COLOR.axisStrong : COLOR.axis}
                  fontWeight={isLast ? 700 : 400}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis
            yAxisId="count"
            domain={[0, 80000]}
            ticks={COUNT_TICKS}
            axisLine={false}
            tickLine={false}
            width={60}
            tick={{ fill: COLOR.axis, className: 'text-2xs' }}
            tickFormatter={formatNumber}
          />
          <YAxis
            yAxisId="ratio"
            orientation="right"
            domain={[20, 60]}
            ticks={RATIO_TICKS}
            axisLine={false}
            tickLine={false}
            width={44}
            tick={{ fill: COLOR.axis, className: 'text-2xs' }}
            tickFormatter={(value: number) => `${value}%`}
          />

          <Bar
            yAxisId="count"
            dataKey="count"
            barSize={isLong ? 40 : 64}
            radius={[8, 8, 2, 2]}
            isAnimationActive={false}
          >
            {data.map((point, index) => (
              <Cell
                key={point.month}
                fill={index === lastIndex ? COLOR.barLast : COLOR.bar}
                fillOpacity={barOpacity}
              />
            ))}
            <LabelList
              dataKey="count"
              content={({ x, y, width, index, value }: LabelProps) => {
                // 위험 비중을 강조할 때는 막대 수치를 숨긴다
                if (focus === 'ratio') {
                  return null;
                }
                const isLast = index === lastIndex;
                return (
                  <text
                    x={Number(x) + Number(width) / 2}
                    y={Number(y) + (isLong ? 16 : 20)}
                    textAnchor="middle"
                    // 12개월은 막대가 좁아서 한 단계 작은 글씨로 막대 안에 맞춘다
                    className={isLong ? 'text-2xs' : 'text-xs'}
                    fontWeight={700}
                    fill={isLast ? '#ffffff' : COLOR.barLabel}
                  >
                    {formatNumber(Number(value))}
                  </text>
                );
              }}
            />
            {/* 마지막 달 위 "전월 대비" 말풍선 */}
            <LabelList
              dataKey="count"
              content={({ x, width, index }: LabelProps) => {
                if (index !== lastIndex) {
                  return null;
                }
                const text = `전월 대비 ${lastDiff >= 0 ? '+' : ''}${formatNumber(lastDiff)}명`;
                const boxWidth = text.length * 7 + 16;
                const centerX = Number(x) + Number(width) / 2;
                return (
                  <g>
                    <rect
                      x={centerX - boxWidth / 2}
                      y={4}
                      width={boxWidth}
                      height={22}
                      rx={11}
                      fill={COLOR.callout}
                    />
                    <text
                      x={centerX}
                      y={19}
                      textAnchor="middle"
                      className="text-2xs"
                      fontWeight={700}
                      fill="#ffffff"
                    >
                      {text}
                    </text>
                  </g>
                );
              }}
            />
          </Bar>

          <Line
            yAxisId="ratio"
            dataKey="ratio"
            stroke={COLOR.line}
            strokeWidth={2.5}
            strokeOpacity={lineOpacity}
            isAnimationActive={false}
            dot={({ cx, cy, index }) => (
              <circle
                key={index}
                opacity={lineOpacity}
                cx={cx}
                cy={cy}
                r={index === lastIndex ? 4 : 3}
                fill="#ffffff"
                stroke={COLOR.line}
                strokeWidth={2.5}
              />
            )}
            activeDot={false}
          >
            <LabelList
              dataKey="ratio"
              content={({ x, y, index, value }: LabelProps) => {
                const isLast = index === lastIndex;
                return (
                  <text
                    x={Number(x)}
                    y={Number(y) - 12}
                    textAnchor="middle"
                    className={isLast ? 'text-xs' : 'text-2xs'}
                    fontWeight={700}
                    fill={COLOR.line}
                  >
                    {Number(value).toFixed(1)}%
                  </text>
                );
              }}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 차트 제목 줄에 붙는 범례 */
export function RiskTrendLegend() {
  return (
    <div className="flex items-center gap-5 text-xs text-slate-600">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="inline-flex h-3 items-end gap-0.5">
          <span className="h-2 w-1.5 rounded-sm bg-blue-100" />
          <span className="h-3 w-1.5 rounded-sm bg-red-500" />
        </span>
        이탈 위험 고객 수 (좌측)
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="relative inline-flex h-2.5 w-6 items-center"
        >
          <span className="h-0.5 w-6 rounded-sm bg-blue-700" />
          <span className="absolute left-2 top-0 size-2.5 rounded-full border-2 border-blue-700 bg-white" />
        </span>
        이탈 위험 비중 (우측)
      </span>
    </div>
  );
}
