import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReactNode } from 'react';
import { CHART_COLOR } from '@/components/charts/chartColors';

export type TrendSeries = {
  key: string;
  label: string;
  /** 선 색 (CHART_COLOR 값) */
  color: string;
  dashed?: boolean;
  /** 마지막 값 라벨을 점 아래에 붙인다 (두 선이 가까울 때) */
  labelBelow?: boolean;
};

type TrendLineChartProps = {
  /** 각 행은 { label, [series.key]: number } */
  data: Record<string, string | number>[];
  series: TrendSeries[];
  yDomain: [number, number];
  yTicks: number[];
  yTickFormatter?: (value: number) => string;
  /** 툴팁·마지막 값 라벨 형식 */
  valueFormatter: (value: number) => string;
  /** 차트 높이 (Tailwind 클래스, 기본 h-52) */
  heightClassName?: string;
  /** 가로 기준선 (예: 발급 심사 기준선) */
  referenceLines?: { y: number; label: string; color?: string }[];
  /** 위험 구간처럼 칠할 가로 영역 */
  referenceBand?: { from: number; to: number; label?: string };
  /** 특정 x 라벨부터 오른쪽을 칠하는 영역 (예: 캠페인 시작 이후) */
  highlightFrom?: { x: string; label: string };
  /** x 라벨마다 점선 세로선 + 숫자 배지 (예: 그 달 발송 캠페인 수) */
  markers?: { x: string; count: number }[];
  /** 툴팁 아래에 덧붙일 내용 (x 라벨별) */
  renderTooltipExtra?: (label: string) => ReactNode;
};

/** 월별 추이 꺾은선. 마지막 값만 라벨로 보여주고 마지막 달 라벨을 굵게 한다. */
export function TrendLineChart({
  data,
  series,
  yDomain,
  yTicks,
  yTickFormatter = (value) => String(value),
  valueFormatter,
  heightClassName = 'h-52',
  referenceLines = [],
  referenceBand,
  highlightFrom,
  markers = [],
  renderTooltipExtra,
}: TrendLineChartProps) {
  const lastIndex = data.length - 1;
  const lastLabel = data[lastIndex]?.label;

  return (
    <div className={`w-full ${heightClassName}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          // 마커 배지가 잘리지 않도록 위 여백을 늘린다
          margin={{
            top: markers.length ? 28 : 16,
            right: 48,
            bottom: 0,
            left: 0,
          }}
        >
          {referenceBand && (
            <ReferenceArea
              y1={referenceBand.from}
              y2={referenceBand.to}
              fill={CHART_COLOR.dangerBand}
              fillOpacity={1}
              label={
                referenceBand.label
                  ? {
                      value: referenceBand.label,
                      position: 'insideTopLeft',
                      fill: CHART_COLOR.danger,
                      className: 'text-2xs font-bold',
                    }
                  : undefined
              }
            />
          )}
          {highlightFrom && (
            <ReferenceArea
              x1={highlightFrom.x}
              x2={lastLabel}
              fill={CHART_COLOR.highlightBand}
              fillOpacity={1}
              label={{
                value: highlightFrom.label,
                position: 'insideTopLeft',
                fill: CHART_COLOR.primary,
                className: 'text-2xs font-bold',
              }}
            />
          )}
          <CartesianGrid
            vertical={false}
            strokeDasharray="4 4"
            stroke={CHART_COLOR.grid}
          />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: CHART_COLOR.baseline }}
            tickLine={false}
            interval={0}
            tick={({ x, y, payload }) => {
              const isLast = payload.value === lastLabel;
              return (
                <text
                  x={x}
                  y={Number(y) + 12}
                  textAnchor="middle"
                  className="text-xs"
                  fill={isLast ? CHART_COLOR.axisStrong : CHART_COLOR.axis}
                  fontWeight={isLast ? 700 : 400}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            axisLine={false}
            tickLine={false}
            width={48}
            tick={{ fill: CHART_COLOR.axis, className: 'text-2xs' }}
            tickFormatter={yTickFormatter}
          />
          {markers.map((marker) => (
            <ReferenceLine
              key={marker.x}
              x={marker.x}
              stroke={CHART_COLOR.axisStrong}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={({
                viewBox,
              }: {
                viewBox?: { x?: number; y?: number };
              }) => (
                <g>
                  <circle
                    cx={viewBox?.x ?? 0}
                    cy={(viewBox?.y ?? 0) - 10}
                    r={9}
                    fill={CHART_COLOR.axisStrong}
                  />
                  <text
                    x={viewBox?.x ?? 0}
                    y={(viewBox?.y ?? 0) - 6}
                    textAnchor="middle"
                    className="text-2xs"
                    fontWeight={700}
                    fill={CHART_COLOR.white}
                  >
                    {marker.count}
                  </text>
                </g>
              )}
            />
          ))}
          {referenceLines.map((line) => (
            <ReferenceLine
              key={line.label}
              y={line.y}
              stroke={line.color ?? CHART_COLOR.muted}
              strokeDasharray="4 4"
              label={{
                value: line.label,
                position: 'insideBottomLeft',
                fill: line.color ?? CHART_COLOR.axis,
                className: 'text-2xs',
              }}
            />
          ))}
          <Tooltip
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              return (
                <div className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  {payload.map((entry) => (
                    <p
                      key={String(entry.dataKey)}
                      className="mt-1 text-sm font-semibold text-slate-900"
                    >
                      {series.find((item) => item.key === entry.dataKey)?.label}{' '}
                      {valueFormatter(Number(entry.value))}
                    </p>
                  ))}
                  {renderTooltipExtra?.(String(label))}
                </div>
              );
            }}
          />
          {series.map((item) => (
            <Line
              key={item.key}
              dataKey={item.key}
              stroke={item.color}
              strokeWidth={item.dashed ? 2 : 2.5}
              strokeDasharray={item.dashed ? '6 5' : undefined}
              isAnimationActive={false}
              dot={({ cx, cy, index }) => (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={index === lastIndex ? 5 : 3.5}
                  fill="#ffffff"
                  stroke={item.color}
                  strokeWidth={2.5}
                />
              )}
            >
              <LabelList
                dataKey={item.key}
                content={({ x, y, index, value }) =>
                  index === lastIndex ? (
                    <text
                      x={Number(x) + 10}
                      y={Number(y) + (item.labelBelow ? 18 : -8)}
                      className="text-xs"
                      fontWeight={700}
                      fill={item.color}
                    >
                      {valueFormatter(Number(value))}
                    </text>
                  ) : null
                }
              />
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 차트 제목 줄에 붙는 선 범례 */
export function LineLegend({ series }: { series: TrendSeries[] }) {
  return (
    <div className="flex items-center gap-5 text-xs text-slate-600">
      {series.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-2">
          {item.dashed ? (
            <span
              aria-hidden="true"
              className="w-6 border-t-2 border-dashed"
              style={{ borderColor: item.color }}
            />
          ) : (
            <span
              aria-hidden="true"
              className="relative inline-flex h-2.5 w-6 items-center"
            >
              <span
                className="h-0.5 w-6 rounded-sm"
                style={{ background: item.color }}
              />
              <span
                className="absolute left-2 top-0 size-2.5 rounded-full border-2 bg-white"
                style={{ borderColor: item.color }}
              />
            </span>
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
