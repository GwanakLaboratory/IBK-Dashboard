import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/molecules/Card';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Tabs } from '@/components/molecules/Tabs';
import {
  CAMPAIGNS,
  CAMPAIGN_SOURCE_META,
  CAMPAIGN_STATUS_META,
  campaignName,
  campaignSegment,
  type Campaign,
  type CampaignSource,
  type CampaignStatus,
} from '@/data/campaign';
import { SEND_CHANNELS, findSendChannel } from '@/data/marketing';
import { channelShortLabel } from '@/i18n/domain';
import { formatNumber } from '@/i18n/format';
import { CampaignDetailModal } from './CampaignDetailModal';
import { HelpTip } from './HelpTip';

type SortKey = 'date' | 'response';

const ROW_GRID =
  'grid grid-cols-[minmax(220px,1.6fr)_minmax(88px,0.6fr)_minmax(64px,0.5fr)_minmax(72px,0.4fr)_minmax(150px,1.3fr)_minmax(84px,0.6fr)_minmax(80px,0.5fr)] items-center gap-2.5 px-5';

/** MM.DD → 정렬용 숫자 */
const dateKey = (date: string) => Number(date.replace('.', ''));

const sentCampaigns = CAMPAIGNS.filter((c) => c.status !== 'plan');
const sentCount = sentCampaigns.reduce((sum, c) => sum + c.count, 0);
const returnedCount = sentCampaigns.reduce(
  (sum, c) => sum + (c.returned ?? 0),
  0,
);
// 발송 인원으로 가중한 평균 반응률
const averageResponse =
  sentCampaigns.reduce((sum, c) => sum + c.count * (c.responseRate ?? 0), 0) /
  sentCount;
const runningCount = CAMPAIGNS.filter((c) => c.status === 'run').length;
const doneCount = CAMPAIGNS.filter((c) => c.status === 'done').length;
const planCount = CAMPAIGNS.filter((c) => c.status === 'plan').length;

type KpiKey = 'campaigns' | 'sent' | 'responseRate' | 'returned';

/** KPI 카드 색 · 값. 이름 · 단위 · 설명은 marketingHistory.kpi.<key>.* */
const KPIS: {
  key: KpiKey;
  labelClassName: string;
  valueClassName: string;
}[] = [
  {
    key: 'campaigns',
    labelClassName: 'text-blue-700',
    valueClassName: 'text-slate-900',
  },
  {
    key: 'sent',
    labelClassName: 'text-slate-900',
    valueClassName: 'text-slate-900',
  },
  {
    key: 'responseRate',
    labelClassName: 'text-amber-700',
    valueClassName: 'text-amber-700',
  },
  {
    key: 'returned',
    labelClassName: 'text-green-700',
    valueClassName: 'text-green-700',
  },
];

const STATUSES = Object.keys(CAMPAIGN_STATUS_META) as CampaignStatus[];
const SOURCES = Object.keys(CAMPAIGN_SOURCE_META) as CampaignSource[];

/** 정렬 탭 순서. 이름은 marketingHistory.filter.sort.<key> */
const SORT_KEYS: SortKey[] = ['date', 'response'];

export function HistoryPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');
  const [channel, setChannel] = useState('all');
  const [sort, setSort] = useState<SortKey>('date');
  const [openCampaign, setOpenCampaign] = useState<Campaign | null>(null);

  // 모든 조건이 처음 상태면 초기화할 게 없다
  const isDefaultFilter =
    status === 'all' &&
    source === 'all' &&
    channel === 'all' &&
    sort === 'date';

  const resetFilter = () => {
    setStatus('all');
    setSource('all');
    setChannel('all');
    setSort('date');
  };

  // KPI 값 · 칩 · 설명 (현재 언어)
  const kpiContent: Record<
    KpiKey,
    { value: string; sub: string; chip?: string }
  > = {
    campaigns: {
      value: String(sentCampaigns.length),
      sub: t('marketingHistory.kpi.campaigns.sub', {
        run: runningCount,
        done: doneCount,
        plan: planCount,
      }),
      chip: t('marketingHistory.kpi.campaigns.chip', { count: runningCount }),
    },
    sent: {
      value: formatNumber(sentCount),
      sub: t('marketingHistory.kpi.sent.sub'),
    },
    responseRate: {
      value: averageResponse.toFixed(1),
      sub: t('marketingHistory.kpi.responseRate.sub'),
    },
    returned: {
      value: formatNumber(returnedCount),
      sub: t('marketingHistory.kpi.returned.sub'),
      chip: `${((returnedCount / sentCount) * 100).toFixed(1)}%`,
    },
  };

  const statusOptions = [
    { value: 'all', label: t('marketingHistory.filter.status.all') },
    ...STATUSES.map((key) => ({
      value: key,
      label: t(`marketingHistory.status.${key}`),
    })),
  ];
  const sourceOptions = [
    { value: 'all', label: t('marketingHistory.filter.source.all') },
    ...SOURCES.map((key) => ({
      value: key,
      label: t(`marketingHistory.source.${key}.filter`),
    })),
  ];
  const channelOptions = [
    { value: 'all', label: t('marketingHistory.filter.channel.all') },
    ...SEND_CHANNELS.map((item) => ({
      value: item.key,
      label: channelShortLabel(item.key),
    })),
  ];
  const sortTabs = SORT_KEYS.map((key) => ({
    key,
    label: t(`marketingHistory.filter.sort.${key}`),
  }));

  const rows = CAMPAIGNS.filter(
    (c) =>
      (status === 'all' || c.status === status) &&
      (source === 'all' || c.source === source) &&
      (channel === 'all' || c.channel === channel),
  ).sort((a, b) =>
    sort === 'response'
      ? (b.responseRate ?? -1) - (a.responseRate ?? -1)
      : dateKey(b.date) - dateKey(a.date),
  );

  return (
    <>
      <PageHeader
        section="marketing"
        titleSize="lg"
        eyebrow={t('marketingHistory.page.eyebrow')}
        title={t('marketingHistory.page.title')}
        description={t('marketingHistory.page.description')}
        actions={false}
      />

      <div className="grid grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          const content = kpiContent[kpi.key];
          return (
            <div
              key={kpi.key}
              className="flex min-w-0 flex-col items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-5"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`text-lg font-bold ${kpi.labelClassName}`}>
                  {t(`marketingHistory.kpi.${kpi.key}.label`)}
                </span>
                {content.chip && (
                  <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-2.5 text-xs font-bold text-slate-600">
                    {content.chip}
                  </span>
                )}
              </span>
              <span className="flex items-baseline gap-1">
                <span
                  className={`text-5xl font-bold leading-none tracking-tight ${kpi.valueClassName}`}
                >
                  {content.value}
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {t(`marketingHistory.kpi.${kpi.key}.unit`)}
                </span>
              </span>
              <span className="text-xs text-gray-600">{content.sub}</span>
            </div>
          );
        })}
      </div>

      <Card flush>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Dropdown
              label={t('marketingHistory.filter.status.label')}
              className="min-w-36"
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
            <Dropdown
              label={t('marketingHistory.filter.source.label')}
              className="min-w-40"
              value={source}
              onChange={setSource}
              options={sourceOptions}
            />
            <Dropdown
              label={t('marketingHistory.filter.channel.label')}
              className="min-w-36"
              value={channel}
              onChange={setChannel}
              options={channelOptions}
            />
            <Button
              variant="outline"
              disabled={isDefaultFilter}
              onClick={resetFilter}
            >
              {t('marketingHistory.filter.reset')}
            </Button>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="whitespace-nowrap text-xs text-slate-500">
              {t('marketingHistory.filter.period')} ·{' '}
              <strong className="font-bold text-slate-900">
                {t('marketingHistory.filter.count', { count: rows.length })}
              </strong>
            </span>
            <Tabs
              label={t('marketingHistory.filter.sort.label')}
              tabs={sortTabs}
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>

        <div
          className={`${ROW_GRID} h-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500`}
        >
          <span>{t('marketingHistory.table.column.campaign')}</span>
          <span>{t('marketingHistory.table.column.channel')}</span>
          <span>{t('marketingHistory.table.column.date')}</span>
          <span className="text-right">
            {t('marketingHistory.table.column.count')}
          </span>
          {/* 발송 대상(오른쪽 정렬)과 붙어 보이지 않게 반응률 칸은 왼쪽 여백을 둔다 */}
          <span className="flex items-center gap-1 pl-8">
            {t('marketingHistory.table.column.responseRate')}
            <HelpTip
              label={t('marketingHistory.table.tip.responseRateLabel')}
              text={t('marketingHistory.table.tip.responseRate')}
            />
          </span>
          <span className="flex items-center justify-end gap-1">
            {t('marketingHistory.table.column.returned')}
            <HelpTip
              label={t('marketingHistory.table.tip.returnedLabel')}
              text={t('marketingHistory.table.tip.returned')}
              align="right"
            />
          </span>
          <span className="pl-4">
            {t('marketingHistory.table.column.status')}
          </span>
        </div>
        {rows.map((campaign) => (
          <CampaignRow
            key={campaign.id}
            campaign={campaign}
            onOpen={() => setOpenCampaign(campaign)}
          />
        ))}
        {rows.length === 0 && (
          <div className="flex h-28 items-center justify-center text-xs text-slate-500">
            {t('marketingHistory.table.empty')}
          </div>
        )}
      </Card>

      {openCampaign && (
        <CampaignDetailModal
          campaign={openCampaign}
          onClose={() => setOpenCampaign(null)}
        />
      )}
    </>
  );
}

function CampaignRow({
  campaign,
  onOpen,
}: {
  campaign: Campaign;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const name = campaignName(campaign.id);
  const channel = findSendChannel(campaign.channel);
  const source = CAMPAIGN_SOURCE_META[campaign.source];
  const statusMeta = CAMPAIGN_STATUS_META[campaign.status];
  const rate = campaign.responseRate;

  return (
    <button
      type="button"
      aria-label={t('common.action.viewDetail', { name })}
      onClick={onOpen}
      className={`${ROW_GRID} min-h-[60px] w-full border-b border-slate-100 text-left text-xs transition-colors hover:bg-blue-50/40`}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-bold text-slate-900">
          {name}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={`inline-flex h-5 shrink-0 items-center rounded px-1.5 text-2xs font-bold ${source.className}`}
          >
            {t(`marketingHistory.source.${campaign.source}.label`)}
          </span>
          <span className="truncate text-xs text-slate-500">
            {campaignSegment(campaign.id)}
          </span>
        </span>
      </span>
      <span>
        <span
          className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-bold ${channel.chipClassName}`}
        >
          {channelShortLabel(campaign.channel)}
        </span>
      </span>
      <span className="text-slate-700">{campaign.date}</span>
      <span className="text-right font-semibold">
        {formatNumber(campaign.count)}
      </span>
      <span className="flex items-center gap-2.5 pl-8">
        <span className="h-2 max-w-44 grow overflow-hidden rounded-full bg-slate-100">
          <span
            className="block h-full rounded-full bg-blue-700"
            // 30%를 막대 끝으로 본다
            style={{ width: `${rate == null ? 0 : (rate / 30) * 100}%` }}
          />
        </span>
        <span
          className={`whitespace-nowrap font-bold ${rate == null ? 'text-slate-400' : 'text-slate-900'}`}
        >
          {rate == null
            ? t('marketingHistory.table.notSent')
            : `${rate.toFixed(1)}%`}
        </span>
      </span>
      <span className="text-right font-bold text-slate-900">
        {campaign.returned == null
          ? '–'
          : t('marketingHistory.table.people', {
              value: formatNumber(campaign.returned),
            })}
      </span>
      <span className="pl-4">
        <span
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${statusMeta.className}`}
        >
          {t(`marketingHistory.status.${campaign.status}`)}
        </span>
      </span>
    </button>
  );
}
