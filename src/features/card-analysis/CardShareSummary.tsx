import { Link } from 'react-router';
import type { ProductUsageStat } from '@/types/churn';

type CardShareSummaryProps = {
  stats: ProductUsageStat[];
  topCount?: number;
};

type ShareSlice = {
  key: string;
  label: string;
  count: number;
  ratio: number;
  color: string;
  isOther: boolean;
};

const DONUT_SIZE = 100;
const DONUT_RADIUS = 38;
const DONUT_STROKE_WIDTH = 16;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const SLICE_COLORS = ['#466CFF', '#38BDF8', '#7C3AED', '#0D9488', '#DB2777'];
const OTHER_COLOR = '#CBD2DC';

function buildShareSlices(
  stats: ProductUsageStat[],
  topCount: number,
): ShareSlice[] {
  const sortedStats = [...stats].sort((a, b) => b.activeCount - a.activeCount);
  const totalCount = sortedStats.reduce(
    (sum, stat) => sum + stat.activeCount,
    0,
  );
  const toRatio = (count: number) =>
    totalCount === 0 ? 0 : (count / totalCount) * 100;

  const topSlices = sortedStats.slice(0, topCount).map((stat, index) => ({
    key: stat.productName,
    label: stat.productName,
    count: stat.activeCount,
    ratio: toRatio(stat.activeCount),
    color: SLICE_COLORS[index % SLICE_COLORS.length],
    isOther: false,
  }));

  const otherStats = sortedStats.slice(topCount);
  const otherCount = otherStats.reduce(
    (sum, stat) => sum + stat.activeCount,
    0,
  );
  if (otherCount === 0) {
    return topSlices;
  }

  return [
    ...topSlices,
    {
      key: '__other__',
      label: `기타 ${otherStats.length}개 상품`,
      count: otherCount,
      ratio: toRatio(otherCount),
      color: OTHER_COLOR,
      isOther: true,
    },
  ];
}

export function CardShareSummary({
  stats,
  topCount = 5,
}: CardShareSummaryProps) {
  const shareSlices = buildShareSlices(stats, topCount);
  const topRatio = shareSlices
    .filter((slice) => !slice.isOther)
    .reduce((sum, slice) => sum + slice.ratio, 0);

  let accumulatedRatio = 0;
  const donutSegments = shareSlices.map((slice) => {
    const segmentLength = (slice.ratio / 100) * DONUT_CIRCUMFERENCE;
    const segmentOffset = -(accumulatedRatio / 100) * DONUT_CIRCUMFERENCE;
    accumulatedRatio += slice.ratio;
    return { ...slice, segmentLength, segmentOffset };
  });

  return (
    <section className="flex items-center gap-5 rounded-lg border border-border bg-white px-5 py-4 shadow-sm">
      <svg
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        className="shrink-0"
        aria-hidden="true"
      >
        <g transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}>
          <circle
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={DONUT_RADIUS}
            fill="none"
            stroke="#EEF1F5"
            strokeWidth={DONUT_STROKE_WIDTH}
          />
          {donutSegments.map((segment) => (
            <circle
              key={segment.key}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={DONUT_RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={DONUT_STROKE_WIDTH}
              strokeDasharray={`${segment.segmentLength} ${DONUT_CIRCUMFERENCE}`}
              strokeDashoffset={segment.segmentOffset}
            />
          ))}
        </g>
      </svg>

      <div className="flex w-[150px] shrink-0 flex-col gap-1">
        <h2 className="text-sm font-bold text-gray-900">이용 중인 카드 비중</h2>
        <p className="text-xs text-gray-600">
          상위 {topCount}개 상품 {topRatio.toFixed(1)}%
        </p>
      </div>

      <ul className="grid flex-1 grid-cols-3 gap-x-4 gap-y-1">
        {shareSlices.map((slice) => {
          const content = (
            <>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="flex-1 truncate text-left text-xs">
                {slice.label}
              </span>
              <span className="shrink-0 text-xs font-bold">
                {slice.ratio.toFixed(1)}%
              </span>
            </>
          );
          const itemClassName =
            'flex min-h-[30px] items-center gap-2 rounded-md px-1.5 text-gray-900';

          return (
            <li
              key={slice.key}
              title={`${slice.count.toLocaleString('ko-KR')}명`}
            >
              {slice.isOther ? (
                <div className={itemClassName}>{content}</div>
              ) : (
                <Link
                  to={`/card-list/${encodeURIComponent(slice.key)}`}
                  className={`${itemClassName} transition-colors hover:bg-gray-50`}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
