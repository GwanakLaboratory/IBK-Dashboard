import { ChevronRight, CreditCard, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { DeltaBadge } from '@/components/domain/DeltaBadge';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { CHART_COLOR } from '@/components/charts/chartColors';
import { Card } from '@/components/molecules/Card';
import { Dropdown } from '@/components/molecules/Dropdown';
import { RankedBarList } from '@/components/molecules/RankedBarList';
import {
  MEMBER_BASE_MONTH,
  MEMBER_CATEGORIES,
  MEMBER_MONTHS,
  getMemberDetail,
  type MemberProfile,
} from '@/data/memberDetail';
import {
  TARGET_MEMBERS,
  findMember,
  type CardDetailLinkState,
} from '@/data/target';
import {
  ageGroupLabel,
  cardName,
  churnReasonLabel,
  genderLabel,
  memberNameLabel,
  riskLevelLabel,
} from '@/i18n/domain';
import { formatMonth, formatNumber } from '@/i18n/format';
import type { RiskLevel } from '@/types/churn';
import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';

// 게이지 구간 (위험도 기준: 40 / 70). 문구는 위험도 이름 + 점수 범위
const GAUGE: { level: RiskLevel; width: number; range: string }[] = [
  { level: 'low', width: 40, range: '0–39' },
  { level: 'medium', width: 30, range: '40–69' },
  { level: 'high', width: 30, range: '70–100' },
];

const GAUGE_SOFT: Record<RiskLevel, string> = {
  low: 'bg-green-100',
  medium: 'bg-amber-100',
  high: 'bg-red-100',
};

function toChartData(values: number[]) {
  const months = MEMBER_MONTHS.slice(-values.length);
  return values.map((value, index) => ({
    label: formatMonth(months[index]),
    value,
  }));
}

// 사용량·신용점수 추이 기간 (개월)
const RANGE_VALUES = ['3', '6'];

type ProfileTile = {
  label: string;
  value: string;
  sub?: string;
  /** 보조 문구를 경고색으로 */
  warn?: boolean;
};

export function MemberDetailPage() {
  const { t } = useTranslation();
  const [usageRange, setUsageRange] = useState('6');
  const [creditRange, setCreditRange] = useState('6');
  const { memberId } = useParams();
  const location = useLocation();

  const member = findMember(memberId);
  if (!member) {
    return <Navigate to={`/target/members/${TARGET_MEMBERS[0].id}`} replace />;
  }

  const detail = getMemberDetail(member);
  const level = getRiskLevelFromScore(member.score);
  const meta = RISK_LEVEL_META[level];

  // 카드 상세에서 들어오면 카드 상세로 돌아간다
  const fromCard =
    (location.state as { from?: string } | null)?.from === 'card';
  const back = fromCard
    ? {
        label: t('memberDetail.header.back.card'),
        to: `/target/cards/${member.productId}`,
      }
    : { label: t('memberDetail.header.back.list'), to: '/target/members' };
  const product = cardName(member.productId);
  const rangeOptions = RANGE_VALUES.map((value) => ({
    value,
    label: t('memberDetail.trend.range', { count: Number(value) }),
  }));
  const usageLabel = (man: number) =>
    t('memberDetail.trend.usage.value', {
      man: formatNumber(man),
      k: formatNumber(man * 10),
    });

  const usageValues = detail.usage.slice(-Number(usageRange));
  const usageMax = Math.ceil((Math.max(...usageValues) * 1.2) / 20) * 20;
  const usageAvg = Math.round(
    usageValues.reduce((a, b) => a + b, 0) / usageValues.length,
  );
  const usageMin = Math.min(...usageValues);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        section="target"
        eyebrow={t('memberDetail.header.eyebrow')}
        titleSize="lg"
        title={t('memberDetail.header.title', {
          name: memberNameLabel(member.name),
        })}
        titleAddon={
          <span className="self-center">
            <RiskBadge riskLevel={level} size="lg" />
          </span>
        }
        description={t('memberDetail.header.description', {
          id: member.id,
          product,
        })}
        back={back}
        actions={
          // 이 회원이 쓰는 카드 상세로 (카드 상세에서는 이 회원에게 돌아오는 뒤로가기를 보여준다)
          <Link
            to={`/target/cards/${member.productId}`}
            state={{ fromMemberId: member.id } satisfies CardDetailLinkState}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white pl-3.5 pr-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <CreditCard className="size-4 text-slate-500" strokeWidth={2} />
            {t('memberDetail.header.cardLink', { product })}
            <ChevronRight
              className="size-3.5 text-slate-400"
              strokeWidth={2.4}
            />
          </Link>
        }
      />

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        <Card gapClassName="gap-0" className="justify-center py-3">
          <div className="grid grow auto-rows-fr grid-cols-3 gap-x-6">
            <ProfileTiles profile={detail.profile} />
          </div>
        </Card>

        <Card className="justify-center">
          <span className="text-lg font-bold text-red-700">
            {t('memberDetail.score.title')}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-5xl font-bold leading-none tracking-tight ${meta.textClassName}`}
            >
              {member.score}
            </span>
            <span className="text-lg font-semibold text-slate-400">/ 100</span>
            {/* 증감은 점수 옆에 배지로 붙여 한 줄을 줄인다 */}
            <span className="ml-auto flex items-center gap-1.5 self-center whitespace-nowrap">
              <DeltaBadge
                delta={detail.scoreDelta}
                unit={t('memberDetail.score.deltaUnit')}
                fractionDigits={0}
              />
              <span className="text-xs text-gray-500">
                {t('memberDetail.score.prev3', { score: detail.prev3 })}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="relative py-1">
              <div className="flex h-2.5 gap-0.5">
                {GAUGE.map((seg) => (
                  <span
                    key={seg.level}
                    className={`h-2.5 rounded-full ${seg.level === level ? RISK_LEVEL_META[seg.level].dotColorClassName : GAUGE_SOFT[seg.level]}`}
                    style={{ width: `${seg.width}%` }}
                  />
                ))}
              </div>
              <span
                aria-hidden="true"
                className="absolute top-0 -ml-1 h-[18px] w-2 rounded-sm border-2 border-white bg-slate-900"
                style={{ left: `${member.score}%` }}
              />
            </div>
            <div className="flex gap-0.5">
              {GAUGE.map((seg) => (
                <span
                  key={seg.level}
                  className={`whitespace-nowrap text-2xs ${seg.level === level ? `font-bold ${RISK_LEVEL_META[seg.level].textClassName}` : 'text-slate-400'}`}
                  style={{ width: `${seg.width}%` }}
                >
                  {t('memberDetail.score.gauge', {
                    level: riskLevelLabel(seg.level),
                    range: seg.range,
                  })}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card
          title={t('memberDetail.trend.usage.title')}
          titleSize="lg"
          actions={
            <Dropdown
              label={t('memberDetail.trend.usage.rangeLabel')}
              size="sm"
              align="right"
              className="min-w-32 shrink-0"
              options={rangeOptions}
              value={usageRange}
              onChange={setUsageRange}
            />
          }
          description={t('memberDetail.trend.usage.description')}
        >
          <TrendLineChart
            data={toChartData(usageValues)}
            series={[
              {
                key: 'value',
                label: t('memberDetail.trend.usage.series'),
                color: CHART_COLOR.primary,
              },
            ]}
            yDomain={[0, usageMax]}
            yTicks={[0, 1, 2, 3, 4].map((i) => (usageMax * i) / 4)}
            yTickFormatter={(v) => usageLabel(Math.round(v))}
            valueFormatter={(v) => usageLabel(v)}
            referenceLines={[
              {
                y: usageAvg,
                label: t('memberDetail.trend.usage.average', {
                  value: usageLabel(usageAvg),
                }),
              },
              {
                y: usageMin,
                label: t('memberDetail.trend.usage.minimum', {
                  value: usageLabel(usageMin),
                }),
                color: CHART_COLOR.warning,
              },
            ]}
          />
        </Card>
        <Card
          title={t('memberDetail.trend.credit.title')}
          titleSize="lg"
          actions={
            <Dropdown
              label={t('memberDetail.trend.credit.rangeLabel')}
              size="sm"
              align="right"
              className="min-w-32 shrink-0"
              options={rangeOptions}
              value={creditRange}
              onChange={setCreditRange}
            />
          }
          description={t('memberDetail.trend.credit.description')}
        >
          <TrendLineChart
            data={toChartData(detail.credit.slice(-Number(creditRange)))}
            series={[
              {
                key: 'value',
                label: t('memberDetail.trend.credit.series'),
                color: CHART_COLOR.primary,
              },
            ]}
            yDomain={[500, 900]}
            yTicks={[500, 600, 700, 800, 900]}
            valueFormatter={(v) =>
              t('memberDetail.trend.credit.value', { value: v })
            }
            referenceLines={[
              {
                y: 700,
                label: t('memberDetail.trend.credit.stable'),
                color: CHART_COLOR.success,
              },
              {
                y: 621,
                label: t('memberDetail.trend.credit.minimum'),
                color: CHART_COLOR.warning,
              },
            ]}
          />
        </Card>
        <Card
          title={t('memberDetail.trend.churn.title')}
          titleSize="lg"
          description={t('memberDetail.trend.churn.description')}
        >
          <TrendLineChart
            data={toChartData(detail.churn.slice(-4))}
            series={[
              {
                key: 'value',
                label: t('memberDetail.trend.churn.series'),
                color: CHART_COLOR.danger,
              },
            ]}
            yDomain={[0, 100]}
            yTicks={[0, 25, 50, 75, 100]}
            valueFormatter={(v) =>
              t('memberDetail.trend.churn.value', { value: v })
            }
            referenceBand={{
              from: 70,
              to: 100,
              label: t('memberDetail.trend.churn.riskBand'),
            }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,5fr)] gap-4">
        <Card
          title={t('memberDetail.reasons.title')}
          titleSize="lg"
          description={t('memberDetail.reasons.description')}
        >
          <RankedBarList
            labelClassName="flex-1 min-w-0"
            valueClassName="w-7"
            items={detail.reasons.map((reason) => ({
              label: churnReasonLabel(reason.reason),
              barPercent: reason.score,
              display: String(reason.score),
            }))}
          />
        </Card>
        <Card
          title={t('memberDetail.categories.title')}
          titleSize="lg"
          description={t('memberDetail.categories.description')}
        >
          <RankedBarList
            accent="blue"
            showRank={false}
            labelClassName="w-[70px]"
            valueClassName="w-9"
            items={MEMBER_CATEGORIES.map((category) => ({
              label: t(`memberDetail.category.${category.category}`),
              barPercent: (category.share / MEMBER_CATEGORIES[0].share) * 100,
              display: `${category.share}%`,
            }))}
          />
        </Card>
        <Card
          title={t('memberDetail.payments.title')}
          titleSize="lg"
          actions={
            <span className="text-xs text-gray-500">
              {t('memberDetail.payments.count')}
            </span>
          }
        >
          <div className="flex flex-col">
            <div className="grid h-8 grid-cols-[56px_minmax(0,1fr)_88px_76px] items-center gap-2 border-b border-slate-200 px-1 text-xs font-semibold text-slate-500">
              <span>{t('memberDetail.payments.column.date')}</span>
              <span>{t('memberDetail.payments.column.store')}</span>
              <span className="text-right">
                {t('memberDetail.payments.column.amount')}
              </span>
              <span className="text-right">
                {t('memberDetail.payments.column.method')}
              </span>
            </div>
            {detail.payments.map((payment) => (
              <div
                key={payment.store}
                className="grid min-h-[46px] grid-cols-[56px_minmax(0,1fr)_88px_76px] items-center gap-2 border-b border-slate-100 px-1 text-xs last:border-b-0"
              >
                <span className="text-slate-500">{payment.date}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-semibold">
                    {t(`memberDetail.payments.store.${payment.store}`)}
                  </span>
                  <span className="text-2xs text-slate-500">
                    {t(`memberDetail.category.${payment.category}`)}
                  </span>
                </span>
                <span className="text-right font-bold">
                  {t('memberDetail.payments.amount', {
                    amount: formatNumber(payment.amount),
                  })}
                </span>
                <span className="text-right text-slate-500">
                  {t(`memberDetail.payments.method.${payment.method}`)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5">
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-violet-50 px-2.5 text-xs font-bold text-violet-700">
          <Sparkles className="size-3.5" strokeWidth={2} />
          {t('memberDetail.aiAction.label')}
        </span>
        <span className="min-w-0 grow text-sm leading-normal text-gray-800">
          {detail.aiAction.type === 'usageDrop'
            ? t('memberDetail.aiAction.usageDrop', {
                drop: detail.aiAction.drop,
              })
            : t('memberDetail.aiAction.stable')}
        </span>
      </div>
    </div>
  );
}

/** 회원 정보 타일 (전화번호 · 성별 나이 · 가입일 · 최근 이용일 · 신용점수 · 기준 월 사용액) */
function ProfileTiles({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  const month = formatMonth(MEMBER_BASE_MONTH);
  const signedDiff = `${profile.creditDiff > 0 ? '+' : ''}${profile.creditDiff}`;
  const tiles: ProfileTile[] = [
    { label: t('memberDetail.profile.phone'), value: profile.phone },
    {
      label: t('memberDetail.profile.genderAge'),
      value: t('memberDetail.profile.genderAgeValue', {
        gender: genderLabel(profile.gender),
        age: ageGroupLabel(profile.ageGroup),
      }),
    },
    {
      label: t('memberDetail.profile.joinedAt'),
      value: profile.joinedDate,
      sub: t('memberDetail.profile.tenure', { years: profile.tenureYears }),
    },
    {
      label: t('memberDetail.profile.lastUse'),
      value: profile.lastUseDate,
      // 한 달 넘게 안 쓴 경우만 "미이용"으로 경고한다
      sub:
        profile.idleDays >= 30
          ? t('memberDetail.profile.idleWarning', { count: profile.idleDays })
          : t('memberDetail.profile.usedAgo', { count: profile.idleDays }),
      warn: profile.idleDays >= 30,
    },
    {
      label: t('memberDetail.profile.creditScore'),
      value: t('memberDetail.profile.creditValue', {
        score: profile.creditScore,
      }),
      sub: t('memberDetail.profile.creditDiff', { diff: signedDiff }),
      warn: profile.creditDiff < 0,
    },
    // 기준 월 결제가 없으면 금액 대신 미이용임을 알려 준다
    profile.monthUsage === 0
      ? {
          label: t('memberDetail.profile.monthUsage', { month }),
          value: t('memberDetail.profile.noUsageValue'),
          sub: t('memberDetail.profile.noPayment', { month }),
          warn: true,
        }
      : {
          label: t('memberDetail.profile.monthUsage', { month }),
          value: t('memberDetail.profile.monthUsageValue', {
            man: formatNumber(profile.monthUsage),
            won: formatNumber(profile.monthUsage * 10000),
          }),
          sub: t('memberDetail.profile.vsAverage', {
            pct: profile.monthUsageVsAverage,
          }),
          warn: profile.monthUsageBelowAverage,
        },
  ];

  return (
    <>
      {tiles.map((tile) => (
        <div key={tile.label} className="flex min-w-0 items-center py-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs text-slate-500">{tile.label}</span>
            <span className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-base font-bold text-slate-900">
                {tile.value}
              </span>
              {tile.sub && (
                <span
                  className={`truncate text-xs font-semibold ${tile.warn ? 'text-red-600' : 'text-slate-500'}`}
                >
                  {tile.sub}
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
