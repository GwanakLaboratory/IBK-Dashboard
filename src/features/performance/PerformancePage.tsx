import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { CHART_COLOR } from '@/components/charts/chartColors';
import {
  LineLegend,
  TrendLineChart,
  type TrendSeries,
} from '@/components/charts/TrendLineChart';
import { DeltaBadge } from '@/components/domain/DeltaBadge';
import { RankBadge } from '@/components/domain/RankBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/molecules/Card';
import { KpiStrip, type KpiItem } from '@/components/molecules/KpiStrip';
import { RankedBarList } from '@/components/molecules/RankedBarList';
import { CAMPAIGN_SOURCE_META, type Campaign } from '@/data/campaign';
import { findSendChannel } from '@/data/marketing';
import {
  CAMPAIGN_LOG,
  CAMPAIGN_MARKERS,
  CAMPAIGN_START_MONTH,
  CHANNEL_RESPONSE,
  CHURN_COMPARISON,
  PERFORMANCE_CAMPAIGNS,
  PERFORMANCE_KPIS,
} from '@/data/performance';
import { CampaignDetailModal } from '@/features/marketing/CampaignDetailModal';

const SERIES: TrendSeries[] = [
  {
    key: 'target',
    label: '타겟군 (발송)',
    color: CHART_COLOR.primary,
    labelBelow: true,
  },
  {
    key: 'control',
    label: '대조군 (미발송)',
    color: CHART_COLOR.muted,
    dashed: true,
  },
];

const CAMPAIGN_GRID =
  'grid grid-cols-[32px_minmax(0,1fr)_88px_72px_84px_96px] items-center gap-2 px-1';

// 채널별 반응률 막대는 50%를 끝으로 본다
const CHANNEL_SCALE = 50;

const formatNumber = (value: number) => value.toLocaleString('ko-KR');
const formatPercent = (value: number) => `${value.toFixed(1)}%`;
/** 억 원 금액 (소수 첫째 자리, 천 단위 쉼표) */
const formatEok = (value: number) =>
  value.toLocaleString('ko-KR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const KPIS: KpiItem[] = [
  {
    label: '이탈 방어 고객',
    labelClassName: 'text-blue-700',
    value: formatNumber(PERFORMANCE_KPIS.returned),
    unit: '명',
    sub: '9월 캠페인으로 다시 카드를 쓴 고객',
  },
  {
    label: '이탈률 차이',
    labelClassName: 'text-green-700',
    value: PERFORMANCE_KPIS.churnGap.toFixed(1),
    unit: '%p',
    // 타겟군이 대조군보다 낮을수록 좋으므로 음수(▼)로 보여준다
    badge: <DeltaBadge delta={-PERFORMANCE_KPIS.churnGap} size="md" />,
    sub: `타겟군 ${PERFORMANCE_KPIS.lastTarget}% · 대조군 ${PERFORMANCE_KPIS.lastControl}%`,
  },
  {
    label: '방어 이용금액',
    value: formatEok(PERFORMANCE_KPIS.amount),
    unit: '억 원',
    sub: '이용 재개 고객의 향후 12개월 예상 이용금액',
  },
  {
    label: '마케팅 효율 (ROI)',
    value: PERFORMANCE_KPIS.roi.toFixed(1),
    unit: '배',
    sub: `9월 집행 비용 ${PERFORMANCE_KPIS.spend}억 원 대비`,
  },
];

export function PerformancePage() {
  const navigate = useNavigate();
  const [openCampaign, setOpenCampaign] = useState<Campaign | null>(null);

  return (
    <>
      <PageHeader section="performance" titleSize="lg" />
      <KpiStrip size="xl" items={KPIS} />

      <Card
        title="타겟군 · 대조군 월별 이탈률"
        titleSize="lg"
        titleAddon={<DeltaBadge delta={-PERFORMANCE_KPIS.churnGap} />}
        description="같은 조건의 고객을 나눠 한쪽에만 마케팅을 보냈어요 (대조군은 미발송) · 숫자는 그 달 발송 캠페인 수, 올리면 목록이 보여요"
        gapClassName="gap-2.5"
        className="pb-3"
        actions={<LineLegend series={SERIES} />}
      >
        <TrendLineChart
          data={CHURN_COMPARISON}
          series={SERIES}
          yDomain={[1.5, 4]}
          yTicks={[1.5, 2, 2.5, 3, 3.5, 4]}
          yTickFormatter={formatPercent}
          valueFormatter={formatPercent}
          heightClassName="h-56"
          highlightFrom={{
            x: CAMPAIGN_START_MONTH,
            label: '3월 캠페인 시작',
          }}
          markers={CAMPAIGN_MARKERS}
          renderTooltipExtra={(month) => <MonthCampaigns month={month} />}
        />
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
        <Card
          title="채널별 반응률"
          titleSize="lg"
          description="9월 발송 기준 · 메시지 열람 후 7일 안에 카드 이용"
        >
          <RankedBarList
            accent="blue"
            labelClassName="w-20"
            valueClassName="w-14"
            items={CHANNEL_RESPONSE.map((item) => ({
              label: item.label,
              barPercent: (item.rate / CHANNEL_SCALE) * 100,
              display: formatPercent(item.rate),
            }))}
          />
        </Card>

        <Card
          title="캠페인별 성과"
          titleSize="lg"
          description="9월 발송 캠페인 · 이용 재개 많은 순 · 눌러서 상세 보기"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketing/history')}
            >
              접촉 이력 보기
            </Button>
          }
        >
          <div className="flex flex-col text-xs">
            <div
              className={`${CAMPAIGN_GRID} h-8 border-b border-slate-200 font-semibold text-slate-500`}
            >
              <span>순위</span>
              <span>캠페인</span>
              <span>채널</span>
              <span className="text-right">반응률</span>
              <span className="text-right">이용 재개</span>
              <span className="text-right">방어 이용금액</span>
            </div>
            {PERFORMANCE_CAMPAIGNS.map((campaign, index) => {
              const channel = findSendChannel(campaign.channel);
              return (
                <button
                  key={campaign.id}
                  type="button"
                  aria-label={`${campaign.name} 상세 보기`}
                  onClick={() => setOpenCampaign(campaign)}
                  className={`${CAMPAIGN_GRID} h-10 w-full border-b border-slate-100 text-left hover:bg-blue-50/40`}
                >
                  <RankBadge rank={index + 1} highlight="dark" size="md" />
                  <span className="truncate font-semibold text-slate-900">
                    {campaign.name}
                  </span>
                  <span>
                    <span
                      className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 font-bold ${channel.chipClassName}`}
                    >
                      {channel.shortLabel}
                    </span>
                  </span>
                  <span className="text-right text-slate-700">
                    {formatPercent(campaign.responseRate)}
                  </span>
                  <span className="text-right font-bold">
                    {formatNumber(campaign.returned)}명
                  </span>
                  <span className="text-right font-bold text-blue-700">
                    {formatEok(campaign.amount)}억 원
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {openCampaign && (
        <CampaignDetailModal
          campaign={openCampaign}
          onClose={() => setOpenCampaign(null)}
        />
      )}
    </>
  );
}

/** 그래프 툴팁에 붙는 그 달 발송 캠페인 목록 */
function MonthCampaigns({ month }: { month: string }) {
  const entries = CAMPAIGN_LOG.filter((entry) => entry.month === month);
  if (!entries.length) return null;
  return (
    <div className="mt-2 flex w-72 flex-col gap-1.5 border-t border-slate-100 pt-2">
      <p className="text-xs font-bold text-slate-900">
        캠페인 {entries.length}건
      </p>
      {entries.map((entry) => {
        const source = CAMPAIGN_SOURCE_META[entry.source];
        return (
          <div
            key={entry.name}
            className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2 text-xs"
          >
            <span
              className={`inline-flex h-5 items-center justify-center rounded px-1 text-2xs font-bold ${source.className}`}
            >
              {source.label}
            </span>
            <span className="truncate text-slate-900">{entry.name}</span>
            <span className="whitespace-nowrap text-slate-600">
              {findSendChannel(entry.channel).shortLabel} ·{' '}
              <strong className="text-slate-900">
                {formatPercent(entry.responseRate)}
              </strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
