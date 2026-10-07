import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/molecules/Card';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Tabs } from '@/components/molecules/Tabs';
import {
  CAMPAIGNS,
  CAMPAIGN_PERIOD_LABEL,
  CAMPAIGN_SOURCE_META,
  CAMPAIGN_STATUS_META,
  RESPONSE_RATE_TIP,
  RETURNED_TIP,
  type Campaign,
  type CampaignSource,
  type CampaignStatus,
} from '@/data/campaign';
import { SEND_CHANNELS, findSendChannel } from '@/data/marketing';
import { CampaignDetailModal } from './CampaignDetailModal';
import { HelpTip } from './HelpTip';

type SortKey = 'date' | 'response';

const ROW_GRID =
  'grid grid-cols-[minmax(220px,1.6fr)_minmax(88px,0.6fr)_minmax(64px,0.5fr)_minmax(72px,0.4fr)_minmax(150px,1.3fr)_minmax(84px,0.6fr)_minmax(80px,0.5fr)] items-center gap-2.5 px-5';

const formatNumber = (value: number) => value.toLocaleString('ko-KR');
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

const KPIS: {
  label: string;
  labelClassName: string;
  valueClassName: string;
  value: string;
  unit: string;
  sub: string;
  chip?: string;
}[] = [
  {
    label: '9월 캠페인',
    labelClassName: 'text-blue-700',
    valueClassName: 'text-slate-900',
    value: String(sentCampaigns.length),
    unit: '건',
    sub: `진행 ${runningCount} · 완료 ${doneCount} · 10월 예약 ${planCount}`,
    chip: `진행 ${runningCount}`,
  },
  {
    label: '발송 대상',
    labelClassName: 'text-slate-900',
    valueClassName: 'text-slate-900',
    value: formatNumber(sentCount),
    unit: '명',
    sub: '중복 제외 실발송 기준',
  },
  {
    label: '평균 반응률',
    labelClassName: 'text-amber-700',
    valueClassName: 'text-amber-700',
    value: averageResponse.toFixed(1),
    unit: '%',
    sub: '열람 후 7일 안에 카드 이용',
  },
  {
    label: '이용 재개',
    labelClassName: 'text-green-700',
    valueClassName: 'text-green-700',
    value: formatNumber(returnedCount),
    unit: '명',
    sub: '30일 안에 2회 이상 다시 이용',
    chip: `${((returnedCount / sentCount) * 100).toFixed(1)}%`,
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  ...(Object.keys(CAMPAIGN_STATUS_META) as CampaignStatus[]).map((key) => ({
    value: key,
    label: CAMPAIGN_STATUS_META[key].label,
  })),
];

const SOURCE_OPTIONS = [
  { value: 'all', label: '전체 선택 방식' },
  ...(Object.keys(CAMPAIGN_SOURCE_META) as CampaignSource[]).map((key) => ({
    value: key,
    label: CAMPAIGN_SOURCE_META[key].filterLabel,
  })),
];

const CHANNEL_OPTIONS = [
  { value: 'all', label: '전체 채널' },
  ...SEND_CHANNELS.map((channel) => ({
    value: channel.key,
    label: channel.shortLabel,
  })),
];

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'date', label: '발송일 최신 순' },
  { key: 'response', label: '반응률 높은 순' },
];

export function HistoryPage() {
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');
  const [channel, setChannel] = useState('all');
  const [sort, setSort] = useState<SortKey>('date');
  const [openCampaign, setOpenCampaign] = useState<Campaign | null>(null);

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
        eyebrow="TARGET MARKETING"
        title="접촉 이력"
        description="캠페인별 발송 내역과 고객 반응을 확인해요"
        actions={false}
      />

      <div className="grid grid-cols-4 gap-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="flex min-w-0 flex-col items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-5"
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className={`text-lg font-bold ${kpi.labelClassName}`}>
                {kpi.label}
              </span>
              {kpi.chip && (
                <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-2.5 text-xs font-bold text-slate-600">
                  {kpi.chip}
                </span>
              )}
            </span>
            <span className="flex items-baseline gap-1">
              <span
                className={`text-5xl font-bold leading-none tracking-tight ${kpi.valueClassName}`}
              >
                {kpi.value}
              </span>
              <span className="text-xl font-bold text-slate-900">
                {kpi.unit}
              </span>
            </span>
            <span className="text-xs text-gray-600">{kpi.sub}</span>
          </div>
        ))}
      </div>

      <Card flush>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Dropdown
              label="캠페인 상태"
              className="min-w-36"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
            <Dropdown
              label="선택 방식"
              className="min-w-40"
              value={source}
              onChange={setSource}
              options={SOURCE_OPTIONS}
            />
            <Dropdown
              label="채널"
              className="min-w-36"
              value={channel}
              onChange={setChannel}
              options={CHANNEL_OPTIONS}
            />
          </div>
          <div className="flex items-center gap-3.5">
            <span className="whitespace-nowrap text-xs text-slate-500">
              {CAMPAIGN_PERIOD_LABEL} ·{' '}
              <strong className="font-bold text-slate-900">
                {rows.length}건
              </strong>
            </span>
            <Tabs
              label="정렬"
              tabs={SORT_TABS}
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>

        <div
          className={`${ROW_GRID} h-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500`}
        >
          <span>캠페인</span>
          <span>채널</span>
          <span>발송일</span>
          <span className="text-right">발송 대상</span>
          <span className="flex items-center gap-1">
            반응률
            <HelpTip label="반응률 기준 보기" text={RESPONSE_RATE_TIP} />
          </span>
          <span className="flex items-center justify-end gap-1">
            이용 재개
            <HelpTip
              label="이용 재개 기준 보기"
              text={RETURNED_TIP}
              align="right"
            />
          </span>
          <span className="pl-4">상태</span>
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
            조건에 맞는 캠페인이 없어요.
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
  const channel = findSendChannel(campaign.channel);
  const source = CAMPAIGN_SOURCE_META[campaign.source];
  const statusMeta = CAMPAIGN_STATUS_META[campaign.status];
  const rate = campaign.responseRate;

  return (
    <button
      type="button"
      aria-label={`${campaign.name} 상세 보기`}
      onClick={onOpen}
      className={`${ROW_GRID} min-h-[60px] w-full border-b border-slate-100 text-left text-xs transition-colors hover:bg-blue-50/40`}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-bold text-slate-900">
          {campaign.name}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={`inline-flex h-5 shrink-0 items-center rounded px-1.5 text-2xs font-bold ${source.className}`}
          >
            {source.label}
          </span>
          <span className="truncate text-xs text-slate-500">
            {campaign.segment}
          </span>
        </span>
      </span>
      <span>
        <span
          className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-bold ${channel.chipClassName}`}
        >
          {channel.shortLabel}
        </span>
      </span>
      <span className="text-slate-700">{campaign.date}</span>
      <span className="text-right font-semibold">
        {formatNumber(campaign.count)}
      </span>
      <span className="flex items-center gap-2.5">
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
          {rate == null ? '발송 전' : `${rate.toFixed(1)}%`}
        </span>
      </span>
      <span className="text-right font-bold text-slate-900">
        {campaign.returned == null
          ? '–'
          : `${formatNumber(campaign.returned)}명`}
      </span>
      <span className="pl-4">
        <span
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </span>
    </button>
  );
}
