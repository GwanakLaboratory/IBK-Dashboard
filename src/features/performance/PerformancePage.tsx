import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  CAMPAIGN_SOURCE_META,
  campaignName,
  type Campaign,
} from '@/data/campaign';
import { findSendChannel } from '@/data/marketing';
import {
  campaignLogName,
  CAMPAIGN_LOG,
  CAMPAIGN_MARKERS,
  CAMPAIGN_START_MONTH,
  CHANNEL_RESPONSE,
  CHURN_COMPARISON,
  PERFORMANCE_CAMPAIGNS,
  PERFORMANCE_KPIS,
} from '@/data/performance';
import { CampaignDetailModal } from '@/features/marketing/CampaignDetailModal';
import i18n from '@/i18n';
import { channelShortLabel } from '@/i18n/domain';
import { formatMonth, formatNumber } from '@/i18n/format';

/** 그래프 선. 이름은 performance.chart.series.<key> */
const SERIES_STYLES: (Omit<TrendSeries, 'key' | 'label'> & {
  key: 'target' | 'control';
})[] = [
  {
    key: 'target',
    color: CHART_COLOR.primary,
    labelBelow: true,
  },
  {
    key: 'control',
    color: CHART_COLOR.muted,
    dashed: true,
  },
];

const CAMPAIGN_GRID =
  'grid grid-cols-[32px_minmax(0,1fr)_88px_72px_84px_96px] items-center gap-2 px-1';

// 채널별 반응률 막대는 50%를 끝으로 본다
const CHANNEL_SCALE = 50;

// 캠페인별 성과는 이용 재개 많은 순으로 5개만 보여준다 (전체는 접촉 이력에서)
const TOP_CAMPAIGNS = PERFORMANCE_CAMPAIGNS.slice(0, 5);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;
/**
 * 억 원 금액. 한국어는 억 원 그대로(소수 첫째 자리),
 * 영어는 십억 원(B) 단위로 바꿔 보여준다 (1억 = 0.1B).
 */
const formatEok = (value: number) =>
  formatNumber(i18n.resolvedLanguage === 'en' ? value / 10 : value, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export function PerformancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openCampaign, setOpenCampaign] = useState<Campaign | null>(null);

  const series: TrendSeries[] = SERIES_STYLES.map((style) => ({
    ...style,
    label: t(`performance.chart.series.${style.key}`),
  }));
  // 그래프 x 라벨은 현재 언어 월 이름 (예: 9월 / Sep)
  const chartData = CHURN_COMPARISON.map(({ month, ...values }) => ({
    label: formatMonth(month),
    ...values,
  }));
  const markers = CAMPAIGN_MARKERS.map((marker) => ({
    ...marker,
    x: formatMonth(marker.x),
  }));
  const monthByLabel = new Map(
    CHURN_COMPARISON.map(({ month }) => [formatMonth(month), month]),
  );

  const kpis: KpiItem[] = [
    {
      label: t('performance.kpi.returned.label'),
      labelClassName: 'text-blue-700',
      value: formatNumber(PERFORMANCE_KPIS.returned),
      unit: t('performance.kpi.returned.unit'),
      sub: t('performance.kpi.returned.sub'),
    },
    {
      label: t('performance.kpi.churnGap.label'),
      labelClassName: 'text-green-700',
      value: PERFORMANCE_KPIS.churnGap.toFixed(1),
      unit: t('performance.kpi.churnGap.unit'),
      // 타겟군이 대조군보다 낮을수록 좋으므로 음수(▼)로 보여준다
      badge: <DeltaBadge delta={-PERFORMANCE_KPIS.churnGap} size="md" />,
      sub: t('performance.kpi.churnGap.sub', {
        target: PERFORMANCE_KPIS.lastTarget,
        control: PERFORMANCE_KPIS.lastControl,
      }),
    },
    {
      label: t('performance.kpi.amount.label'),
      value: formatEok(PERFORMANCE_KPIS.amount),
      unit: t('performance.kpi.amount.unit'),
      sub: t('performance.kpi.amount.sub'),
    },
    {
      label: t('performance.kpi.roi.label'),
      value: PERFORMANCE_KPIS.roi.toFixed(1),
      unit: t('performance.kpi.roi.unit'),
      sub: t('performance.kpi.roi.sub', {
        spend: formatEok(PERFORMANCE_KPIS.spend),
      }),
    },
  ];

  return (
    <>
      <PageHeader section="performance" titleSize="lg" />
      <KpiStrip size="xl" items={kpis} />

      <Card
        title={t('performance.chart.title')}
        titleSize="lg"
        titleAddon={<DeltaBadge delta={-PERFORMANCE_KPIS.churnGap} />}
        description={t('performance.chart.description')}
        gapClassName="gap-2.5"
        className="pb-3"
        actions={<LineLegend series={series} />}
      >
        <TrendLineChart
          data={chartData}
          series={series}
          yDomain={[1.5, 4]}
          yTicks={[1.5, 2, 2.5, 3, 3.5, 4]}
          yTickFormatter={formatPercent}
          valueFormatter={formatPercent}
          heightClassName="h-56"
          highlightFrom={{
            x: formatMonth(CAMPAIGN_START_MONTH),
            label: t('performance.chart.campaignStart', {
              month: formatMonth(CAMPAIGN_START_MONTH),
            }),
          }}
          markers={markers}
          renderTooltipExtra={(label) => {
            const month = monthByLabel.get(label);
            return month ? <MonthCampaigns month={month} /> : null;
          }}
        />
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
        <Card
          title={t('performance.channel.title')}
          titleSize="lg"
          description={t('performance.channel.description')}
        >
          <RankedBarList
            accent="blue"
            labelClassName="w-20"
            valueClassName="w-14"
            items={CHANNEL_RESPONSE.map((item) => ({
              label: channelShortLabel(item.channel),
              barPercent: (item.rate / CHANNEL_SCALE) * 100,
              display: formatPercent(item.rate),
            }))}
          />
        </Card>

        <Card
          title={t('performance.campaign.title')}
          titleSize="lg"
          description={t('performance.campaign.description')}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketing/history')}
            >
              {t('performance.campaign.viewHistory')}
            </Button>
          }
        >
          <div className="flex flex-col text-xs">
            <div
              className={`${CAMPAIGN_GRID} h-8 border-b border-slate-200 font-semibold text-slate-500`}
            >
              <span>{t('performance.campaign.column.rank')}</span>
              <span>{t('performance.campaign.column.campaign')}</span>
              <span>{t('performance.campaign.column.channel')}</span>
              <span className="text-right">
                {t('performance.campaign.column.responseRate')}
              </span>
              <span className="text-right">
                {t('performance.campaign.column.returned')}
              </span>
              <span className="text-right">
                {t('performance.campaign.column.amount')}
              </span>
            </div>
            {TOP_CAMPAIGNS.map((campaign, index) => {
              const channel = findSendChannel(campaign.channel);
              const name = campaignName(campaign.id);
              return (
                <button
                  key={campaign.id}
                  type="button"
                  aria-label={t('common.action.viewDetail', { name })}
                  onClick={() => setOpenCampaign(campaign)}
                  className={`${CAMPAIGN_GRID} h-10 w-full border-b border-slate-100 text-left last:border-b-0 hover:bg-blue-50/40`}
                >
                  <RankBadge rank={index + 1} highlight="dark" size="md" />
                  <span className="truncate font-semibold text-slate-900">
                    {name}
                  </span>
                  <span>
                    <span
                      className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 font-bold ${channel.chipClassName}`}
                    >
                      {channelShortLabel(campaign.channel)}
                    </span>
                  </span>
                  <span className="text-right text-slate-700">
                    {formatPercent(campaign.responseRate)}
                  </span>
                  <span className="text-right font-bold">
                    {t('performance.campaign.returned', {
                      value: formatNumber(campaign.returned),
                    })}
                  </span>
                  <span className="text-right font-bold text-blue-700">
                    {t('performance.campaign.amount', {
                      value: formatEok(campaign.amount),
                    })}
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
  const { t } = useTranslation();
  const entries = CAMPAIGN_LOG.filter((entry) => entry.month === month);
  if (!entries.length) return null;
  return (
    <div className="mt-2 flex w-72 flex-col gap-1.5 border-t border-slate-100 pt-2">
      <p className="text-xs font-bold text-slate-900">
        {t('performance.chart.tooltipCount', { count: entries.length })}
      </p>
      {entries.map((entry) => {
        const source = CAMPAIGN_SOURCE_META[entry.source];
        return (
          <div
            key={entry.id}
            className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2 text-xs"
          >
            <span
              className={`inline-flex h-5 items-center justify-center rounded px-1 text-2xs font-bold ${source.className}`}
            >
              {t(`marketingHistory.source.${entry.source}.label`)}
            </span>
            <span className="truncate text-slate-900">
              {campaignLogName(entry)}
            </span>
            <span className="whitespace-nowrap text-slate-600">
              {channelShortLabel(entry.channel)} ·{' '}
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
