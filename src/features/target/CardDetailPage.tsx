import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router';
import { Button } from '@/components/atoms/Button';
import { CHART_COLOR } from '@/components/charts/chartColors';
import {
  LineLegend,
  TrendLineChart,
  type TrendSeries,
} from '@/components/charts/TrendLineChart';
import { DeltaBadge } from '@/components/domain/DeltaBadge';
import { RankBadge } from '@/components/domain/RankBadge';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/molecules/Card';
import { Dropdown } from '@/components/molecules/Dropdown';
import { RankedBarList } from '@/components/molecules/RankedBarList';
import { CARD_IMAGE_URLS } from '@/data/cardImages';
import {
  CARD_TREND_MONTHS,
  getCardRateTrend,
  getCardReasonScores,
} from '@/data/cards';
import {
  CARD_PRODUCTS,
  TARGET_MEMBERS,
  findCardProduct,
  type CardDetailLinkState,
} from '@/data/target';
import {
  brandLabel,
  cardName,
  cardSummary,
  churnReasonLabel,
  memberNameLabel,
  riskLevelLabel,
} from '@/i18n/domain';
import { formatMonth, formatNumber } from '@/i18n/format';
import type { RiskLevel } from '@/types/churn';
import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';
import { CardImage } from './CardImage';
import { CardTag } from './CardTag';

// 열 너비는 내용 폭에 맞추고, 남는 폭은 justify-between 으로 열 사이 간격에 나눈다
const MEMBER_GRID =
  'grid grid-cols-[28px_48px_76px_76px_72px_40px_minmax(100px,170px)] items-center justify-between gap-2 px-1';

// 도넛 둘레 (반지름 62)
const DONUT_RADIUS = 62;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const DONUT_STROKE_CLASS_NAME: Record<RiskLevel, string> = {
  high: 'stroke-red-500',
  medium: 'stroke-amber-500',
  low: 'stroke-green-400',
};

export function CardDetailPage() {
  const { t } = useTranslation();
  const { cardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromMemberId = (location.state as CardDetailLinkState | null)
    ?.fromMemberId;
  const [trendRange, setTrendRange] = useState('12');
  const card = findCardProduct(cardId);

  if (!card) {
    return <Navigate to={`/target/cards/${CARD_PRODUCTS[0].id}`} replace />;
  }

  const membersPath = `/target/members?product=${card.id}`;
  const name = cardName(card.id);
  const lowShare = +(100 - card.highShare - card.mediumShare).toFixed(1);
  const riskShare = card.highShare + card.mediumShare;
  const mix: { level: RiskLevel; share: number }[] = [
    { level: 'high', share: card.highShare },
    { level: 'medium', share: card.mediumShare },
    { level: 'low', share: lowShare },
  ];
  const topMembers = TARGET_MEMBERS.filter(
    (member) => member.productId === card.id,
  )
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const reasons = getCardReasonScores(card);
  const trendData = getCardRateTrend(card)
    .slice(-Number(trendRange))
    .map(({ month, ...values }) => ({ ...values, label: formatMonth(month) }));
  const trendSeries: TrendSeries[] = [
    {
      key: 'card',
      label: name,
      color: CHART_COLOR.primary,
      labelBelow: card.churnRate < 2.6,
    },
    {
      key: 'average',
      label: t('cardDetail.trend.averageSeries'),
      color: CHART_COLOR.muted,
      dashed: true,
      labelBelow: card.churnRate >= 2.6,
    },
  ];

  const kpis = [
    {
      key: 'members',
      label: t('cardDetail.kpi.members.label'),
      labelClassName: 'text-blue-700',
      value: formatNumber(card.members),
      unit: t('cardDetail.kpi.members.unit'),
      sub: t('cardDetail.kpi.members.sub', {
        month: formatMonth(CARD_TREND_MONTHS[CARD_TREND_MONTHS.length - 1]),
      }),
    },
    {
      key: 'churnRate',
      label: t('cardDetail.kpi.churnRate.label'),
      labelClassName: 'text-red-700',
      value: card.churnRate.toFixed(1),
      unit: '%',
      badge: <DeltaBadge delta={card.churnRateDelta} size="md" />,
      sub: t('cardDetail.kpi.churnRate.sub'),
    },
    {
      key: 'riskMembers',
      label: t('cardDetail.kpi.riskMembers.label'),
      labelClassName: 'text-red-700',
      value: formatNumber(Math.round((card.members * riskShare) / 100)),
      unit: t('cardDetail.kpi.riskMembers.unit'),
      sub: t('cardDetail.kpi.riskMembers.sub', {
        share: riskShare.toFixed(1),
      }),
    },
  ];

  // 도넛 조각마다 시작 위치를 누적한다
  let donutOffset = 0;
  const donutSlices = mix.map((item) => {
    const length = (DONUT_CIRCUMFERENCE * item.share) / 100;
    const slice = { ...item, length, offset: donutOffset };
    donutOffset += length;
    return slice;
  });

  return (
    <>
      <PageHeader
        section="target"
        titleSize="lg"
        eyebrow={t('cardDetail.header.eyebrow')}
        title={name}
        description={card.brands.map(brandLabel).join(' · ')}
        back={
          fromMemberId
            ? {
                label: t('cardDetail.header.backToMember'),
                to: `/target/members/${fromMemberId}`,
              }
            : {
                label: t('cardDetail.header.backToList'),
                to: '/target/cards',
              }
        }
        actions={
          <Button variant="outline" onClick={() => navigate(membersPath)}>
            <Users className="h-4 w-4" />
            {t('cardDetail.header.viewMembers')}
          </Button>
        }
      />

      <div className="grid grid-cols-[minmax(0,4fr)_repeat(3,minmax(0,3fr))] divide-x divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-4 px-6 py-5">
          {CARD_IMAGE_URLS[card.id] ? (
            <CardImage
              key={card.id}
              src={CARD_IMAGE_URLS[card.id]}
              alt={t('cardDetail.summary.imageAlt', { name })}
            />
          ) : (
            <div className="flex h-20 w-32 shrink-0 flex-col justify-between rounded-lg bg-sidebar px-3 py-2.5">
              <span className="h-3.5 w-5 rounded-sm bg-yellow-600" />
              <span className="self-end text-2xs font-bold tracking-widest text-white">
                {brandLabel(card.brands[0])}
              </span>
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-bold text-blue-700">
              {t('cardDetail.summary.benefits')}
            </span>
            <span className="text-sm font-semibold leading-snug">
              {cardSummary(card.id)}
            </span>
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <CardTag key={tag} category={tag} size="sm" />
              ))}
            </div>
          </div>
        </div>
        {kpis.map((kpi) => (
          <div
            key={kpi.key}
            className="flex min-w-0 flex-col justify-center gap-3 px-6 py-5"
          >
            <span className={`text-lg font-bold ${kpi.labelClassName}`}>
              {kpi.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold leading-none tracking-tight">
                {kpi.value}
              </span>
              <span className="text-xl font-bold">{kpi.unit}</span>
            </div>
            <span className="flex min-w-0 items-center gap-2">
              {kpi.badge}
              <span className="truncate text-xs text-gray-600">{kpi.sub}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
        <Card
          title={t('cardDetail.riskMix.title')}
          titleSize="lg"
          description={t('cardDetail.riskMix.description')}
          gapClassName="gap-3.5"
        >
          <div className="flex items-center gap-6">
            <div className="relative size-40 shrink-0">
              <svg
                viewBox="0 0 160 160"
                role="img"
                aria-label={t('cardDetail.riskMix.chartLabel', {
                  high: riskLevelLabel('high'),
                  highShare: card.highShare,
                  medium: riskLevelLabel('medium'),
                  mediumShare: card.mediumShare,
                  low: riskLevelLabel('low'),
                  lowShare,
                })}
                className="size-40 -rotate-90"
              >
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.level}
                    cx="80"
                    cy="80"
                    r={DONUT_RADIUS}
                    fill="none"
                    strokeWidth="22"
                    className={DONUT_STROKE_CLASS_NAME[slice.level]}
                    // 조각 사이에 2px 틈을 둔다
                    strokeDasharray={`${Math.max(0, slice.length - 2)} ${DONUT_CIRCUMFERENCE}`}
                    strokeDashoffset={-slice.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className="text-xs text-slate-500">
                  {riskLevelLabel('high')}
                </span>
                <span className="text-2xl font-bold leading-tight text-red-600">
                  {card.highShare}%
                </span>
              </div>
            </div>
            <div className="flex min-w-0 grow flex-col text-xs">
              <div className="grid h-8 grid-cols-[minmax(0,1fr)_110px_70px] items-center gap-2 border-b border-slate-200 font-semibold text-slate-500">
                <span>{t('cardDetail.riskMix.column.level')}</span>
                <span className="text-right">
                  {t('cardDetail.riskMix.column.members')}
                </span>
                <span className="text-right">
                  {t('cardDetail.riskMix.column.share')}
                </span>
              </div>
              {mix.map((item) => (
                <div
                  key={item.level}
                  className="grid h-10 grid-cols-[minmax(0,1fr)_110px_70px] items-center gap-2 border-b border-slate-100"
                >
                  <span>
                    <RiskBadge riskLevel={item.level} />
                  </span>
                  <span className="text-right font-bold">
                    {t('cardDetail.riskMix.memberCount', {
                      value: formatNumber(
                        Math.round((card.members * item.share) / 100),
                      ),
                    })}
                  </span>
                  <span className="text-right text-slate-600">
                    {item.share}%
                  </span>
                </div>
              ))}
              <div className="grid h-10 grid-cols-[minmax(0,1fr)_110px_70px] items-center gap-2 font-bold">
                <span>{t('cardDetail.riskMix.total')}</span>
                <span className="text-right">
                  {t('cardDetail.riskMix.memberCount', {
                    value: formatNumber(card.members),
                  })}
                </span>
                <span className="text-right text-slate-600">100%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title={t('cardDetail.trend.title')}
          titleSize="lg"
          gapClassName="gap-2.5"
          className="pb-3"
          actions={
            <div className="flex items-center gap-5">
              <LineLegend series={trendSeries} />
              <Dropdown
                label={t('cardDetail.trend.range.label')}
                size="sm"
                align="right"
                className="w-32"
                value={trendRange}
                onChange={setTrendRange}
                options={[
                  { value: '6', label: t('cardDetail.trend.range.last6') },
                  { value: '12', label: t('cardDetail.trend.range.last12') },
                ]}
              />
            </div>
          }
        >
          <TrendLineChart
            data={trendData}
            series={trendSeries}
            yDomain={[0, 4]}
            yTicks={[0, 1, 2, 3, 4]}
            yTickFormatter={(value) => `${value}%`}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            heightClassName="h-[214px]"
          />
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
        <Card
          title={t('cardDetail.reasons.title')}
          titleSize="lg"
          description={t('cardDetail.reasons.description')}
        >
          <RankedBarList
            valueClassName="w-8"
            items={reasons.map((reason) => ({
              label: churnReasonLabel(reason.reason),
              barPercent: reason.score,
              display: String(reason.score),
            }))}
          />
        </Card>

        <Card
          title={t('cardDetail.topRiskMembers.title')}
          titleSize="lg"
          titleAddon={
            <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600">
              {t('cardDetail.topRiskMembers.badge')}
            </span>
          }
        >
          <div className="flex grow flex-col text-xs">
            <div
              className={`${MEMBER_GRID} h-8 border-b border-slate-200 font-semibold text-slate-500`}
            >
              <span>{t('cardDetail.topRiskMembers.column.rank')}</span>
              <span>{t('cardDetail.topRiskMembers.column.member')}</span>
              <span>{t('cardDetail.topRiskMembers.column.memberId')}</span>
              <span>{t('cardDetail.topRiskMembers.column.score')}</span>
              <span>{t('cardDetail.topRiskMembers.column.level')}</span>
              <span>{t('cardDetail.topRiskMembers.column.idle')}</span>
              <span>{t('cardDetail.topRiskMembers.column.reason')}</span>
            </div>
            {topMembers.map((member, index) => {
              const level = getRiskLevelFromScore(member.score);
              const memberName = memberNameLabel(member.name);
              const reason = churnReasonLabel(member.reason);
              return (
                <Link
                  key={member.id}
                  to={`/target/members/${member.id}`}
                  state={{ from: 'card' }}
                  aria-label={t('common.action.viewDetail', {
                    name: memberName,
                  })}
                  className={`${MEMBER_GRID} min-h-11 flex-1 border-b border-slate-100 last:border-b-0 hover:bg-blue-50/40`}
                >
                  <RankBadge rank={index + 1} highlight="dark" size="md" />
                  <span className="truncate font-semibold text-slate-900">
                    {memberName}
                  </span>
                  <span className="text-slate-500">{member.id}</span>
                  <span
                    className={`font-bold ${RISK_LEVEL_META[level].textClassName}`}
                  >
                    {t('common.unit.points', { count: member.score })}
                  </span>
                  <span>
                    <RiskBadge riskLevel={level} />
                  </span>
                  <span className="font-semibold text-slate-900">
                    {t('common.unit.days', { count: member.idleDays })}
                  </span>
                  <span className="truncate text-slate-700" title={reason}>
                    {reason}
                  </span>
                </Link>
              );
            })}
            {topMembers.length === 0 && (
              <div className="flex h-28 items-center justify-center text-slate-500">
                {t('cardDetail.topRiskMembers.empty')}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
