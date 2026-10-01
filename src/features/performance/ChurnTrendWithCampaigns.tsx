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
import { Card } from '@/components/molecules/Card';
import {
  CAMPAIGN_TYPE_LABEL,
  MONTHLY_CAMPAIGN_LOG,
  MONTHLY_CONTROL_CHURN_RATE,
  MONTHLY_TARGET_CHURN_RATE,
  SEND_CHANNELS,
  type CampaignLogEntry,
  type CampaignLogType,
} from '@/data/marketing';

const TARGET_COLOR = '#466CFF';
const CONTROL_COLOR = '#9AA3B2';
const MARKER_COLOR = '#1F2937';

const channelLabelByKey = Object.fromEntries(
  SEND_CHANNELS.map((channel) => [channel.key, channel.shortLabel]),
);

const CAMPAIGN_TYPE_TAG_CLASS_NAME: Record<CampaignLogType, string> = {
  ai: 'bg-violet-50 text-violet-700',
  manual: 'bg-gray-100 text-gray-700',
  random: 'bg-orange-50 text-orange-800',
};

type ChartPoint = {
  month: string;
  targetRate: number;
  controlRate: number;
};

const controlRateByMonth = new Map(
  MONTHLY_CONTROL_CHURN_RATE.map((point) => [point.month, point.rate]),
);
const CHART_DATA: ChartPoint[] = MONTHLY_TARGET_CHURN_RATE.map((point) => ({
  month: point.month,
  targetRate: point.rate,
  controlRate: controlRateByMonth.get(point.month) ?? point.rate,
}));

const campaignsByMonth = new Map<string, CampaignLogEntry[]>();
MONTHLY_CAMPAIGN_LOG.forEach((entry) => {
  const existing = campaignsByMonth.get(entry.month) ?? [];
  existing.push(entry);
  campaignsByMonth.set(entry.month, existing);
});
const MONTH_MARKERS = [...campaignsByMonth.entries()].map(
  ([month, entries]) => ({ month, entries }),
);

const peakPoint = MONTHLY_TARGET_CHURN_RATE.reduce((peak, point) =>
  point.rate > peak.rate ? point : peak,
);
const latestPoint =
  MONTHLY_TARGET_CHURN_RATE[MONTHLY_TARGET_CHURN_RATE.length - 1];
const latestControlRate =
  controlRateByMonth.get(latestPoint.month) ?? latestPoint.rate;
const latestGapPoint =
  Math.round((latestControlRate - latestPoint.rate) * 10) / 10;

function getResponseRate(entry: CampaignLogEntry) {
  return entry.targetCount === 0
    ? 0
    : (entry.respondedCount / entry.targetCount) * 100;
}

type MarkerBadgeProps = {
  viewBox?: { x?: number; y?: number };
  count: number;
};

function MarkerBadge({ viewBox, count }: MarkerBadgeProps) {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;

  return (
    <g>
      <circle cx={x} cy={y - 12} r={9} fill={MARKER_COLOR} />
      <text
        x={x}
        y={y - 8}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#FFFFFF"
      >
        {count}
      </text>
    </g>
  );
}

export function ChurnTrendWithCampaigns() {
  return (
    <Card
      title="월별 이탈률 추이 · 마케팅 대상 vs 대조군"
      description={`최고 ${peakPoint.rate}% (${peakPoint.month}) → 최근 ${latestPoint.rate}% (${latestPoint.month}) · 대조군보다 ${latestGapPoint}%p 낮음 · 마커에 올리면 그 달 캠페인이 보여요`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-end gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span
              className="h-[3px] w-4 rounded-full"
              style={{ backgroundColor: TARGET_COLOR }}
            />
            마케팅 대상
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-gray-400" />
            미발송 대조군
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
              n
            </span>
            그 달 발송 캠페인 수
          </span>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={CHART_DATA}
              margin={{ top: 28, right: 16, bottom: 0, left: -8 }}
            >
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: '#4b5563' }}
                axisLine={{ stroke: '#e3e7ee' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(value: number) => `${value}%`}
                tick={{ fontSize: 13, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              {MONTH_MARKERS.map((marker) => (
                <ReferenceLine
                  key={marker.month}
                  x={marker.month}
                  stroke={MARKER_COLOR}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={(props: MarkerBadgeProps) => (
                    <MarkerBadge
                      viewBox={props.viewBox}
                      count={marker.entries.length}
                    />
                  )}
                />
              ))}
              <Tooltip
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  if (!active || !point) {
                    return null;
                  }
                  const entries = campaignsByMonth.get(point.month) ?? [];

                  return (
                    <div className="w-[260px] rounded-lg border border-white/40 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-xs font-bold text-gray-900">
                          {point.month}
                          {entries.length > 0 &&
                            ` · 캠페인 ${entries.length}건`}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          이탈률 {point.targetRate.toFixed(1)}%
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        대조군 {point.controlRate.toFixed(1)}%
                      </p>
                      {entries.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1.5 border-t border-gray-100 pt-2">
                          {entries.map((entry) => (
                            <div
                              key={entry.name}
                              className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-2 text-xs"
                            >
                              <span
                                className={`inline-flex h-[18px] shrink-0 items-center justify-center rounded px-1 text-[11px] font-bold ${CAMPAIGN_TYPE_TAG_CLASS_NAME[entry.type]}`}
                              >
                                {CAMPAIGN_TYPE_LABEL[entry.type]}
                              </span>
                              <span className="truncate text-gray-900">
                                {entry.name}
                              </span>
                              <span className="whitespace-nowrap text-gray-600">
                                {channelLabelByKey[entry.channel]} ·{' '}
                                <strong className="text-gray-900">
                                  {getResponseRate(entry).toFixed(1)}%
                                </strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="controlRate"
                stroke={CONTROL_COLOR}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="targetRate"
                stroke={TARGET_COLOR}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: TARGET_COLOR,
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
                activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
