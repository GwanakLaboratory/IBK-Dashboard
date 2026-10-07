import { ChevronRight, CreditCard, Sparkles } from 'lucide-react';
import { useState } from 'react';
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
  MEMBER_CATEGORIES,
  MEMBER_MONTHS,
  getMemberDetail,
  monthLabel,
} from '@/data/memberDetail';
import {
  TARGET_MEMBERS,
  findMember,
  type CardDetailLinkState,
} from '@/data/target';
import type { RiskLevel } from '@/types/churn';
import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';

// 게이지 구간 (위험도 기준: 40 / 70)
const GAUGE: { level: RiskLevel; width: number; label: string }[] = [
  { level: 'low', width: 40, label: '저위험 0–39' },
  { level: 'medium', width: 30, label: '중위험 40–69' },
  { level: 'high', width: 30, label: '위험 70–100' },
];

const GAUGE_SOFT: Record<RiskLevel, string> = {
  low: 'bg-green-100',
  medium: 'bg-amber-100',
  high: 'bg-red-100',
};

function toChartData(values: number[]) {
  const months = MEMBER_MONTHS.slice(-values.length);
  return values.map((value, index) => ({
    label: monthLabel(months[index]),
    value,
  }));
}

// 사용량·신용점수 추이 기간
const RANGE_OPTIONS = ['3', '6'].map((value) => ({
  value,
  label: `최근 ${value}개월`,
}));

export function MemberDetailPage() {
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
        label: '카드 상세',
        to: `/target/cards/${encodeURIComponent(member.product)}`,
      }
    : { label: '회원 목록', to: '/target/members' };

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
        eyebrow="RISK TARGET · 회원 상세"
        titleSize="lg"
        title={`${member.name} 님`}
        titleAddon={
          <span className="self-center">
            <RiskBadge riskLevel={level} size="lg" />
          </span>
        }
        description={`${member.id} · ${member.product}`}
        back={back}
        actions={
          // 이 회원이 쓰는 카드 상세로 (카드 상세에서는 이 회원에게 돌아오는 뒤로가기를 보여준다)
          <Link
            to={`/target/cards/${encodeURIComponent(member.product)}`}
            state={{ fromMemberId: member.id } satisfies CardDetailLinkState}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white pl-3.5 pr-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <CreditCard className="size-4 text-slate-500" strokeWidth={2} />
            {member.product} 상세
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
            {detail.tiles.map((tile) => (
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
          </div>
        </Card>

        <Card className="justify-center">
          <span className="text-lg font-bold text-red-700">이탈 예측 점수</span>
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
                unit="점"
                fractionDigits={0}
              />
              <span className="text-xs text-gray-500">
                3개월 전 {detail.prev3}점
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
                  {seg.label}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card
          title="카드 사용량 추이"
          titleSize="lg"
          actions={
            <Dropdown
              label="카드 사용량 추이 기간"
              size="sm"
              align="right"
              className="min-w-32 shrink-0"
              options={RANGE_OPTIONS}
              value={usageRange}
              onChange={setUsageRange}
            />
          }
          description="월 이용금액 (만 원)"
        >
          <TrendLineChart
            data={toChartData(usageValues)}
            series={[
              { key: 'value', label: '이용금액', color: CHART_COLOR.primary },
            ]}
            yDomain={[0, usageMax]}
            yTicks={[0, 1, 2, 3, 4].map((i) => (usageMax * i) / 4)}
            yTickFormatter={(v) => `${Math.round(v)}만`}
            valueFormatter={(v) => `${v}만`}
            referenceLines={[
              { y: usageAvg, label: `평균 ${usageAvg}만` },
              {
                y: usageMin,
                label: `최저 ${usageMin}만`,
                color: CHART_COLOR.warning,
              },
            ]}
          />
        </Card>
        <Card
          title="신용점수 변동 추이"
          titleSize="lg"
          actions={
            <Dropdown
              label="신용점수 변동 추이 기간"
              size="sm"
              align="right"
              className="min-w-32 shrink-0"
              options={RANGE_OPTIONS}
              value={creditRange}
              onChange={setCreditRange}
            />
          }
          description="NICE 신용점수 · 카드 발급 심사 기준선"
        >
          <TrendLineChart
            data={toChartData(detail.credit.slice(-Number(creditRange)))}
            series={[
              { key: 'value', label: '신용점수', color: CHART_COLOR.primary },
            ]}
            yDomain={[500, 900]}
            yTicks={[500, 600, 700, 800, 900]}
            valueFormatter={(v) => `${v}점`}
            referenceLines={[
              { y: 700, label: '안정 승인 700점' },
              {
                y: 621,
                label: '발급 최소기준 621점',
                color: CHART_COLOR.warning,
              },
            ]}
          />
        </Card>
        <Card
          title="이탈 스코어 변동 추이"
          titleSize="lg"
          description="최근 4개월 (과거 3개월 + 이번 달)"
        >
          <TrendLineChart
            data={toChartData(detail.churn.slice(-4))}
            series={[
              { key: 'value', label: '이탈 스코어', color: CHART_COLOR.danger },
            ]}
            yDomain={[0, 100]}
            yTicks={[0, 25, 50, 75, 100]}
            valueFormatter={(v) => `${v}점`}
            referenceBand={{ from: 70, to: 100, label: '위험 구간 70점 이상' }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,5fr)] gap-4">
        <Card
          title="이탈 이유 TOP 5"
          titleSize="lg"
          description="이탈 점수에 크게 기여한 순서 (기여 점수 0–100)"
        >
          <RankedBarList
            labelClassName="flex-1 min-w-0"
            valueClassName="w-7"
            items={detail.reasons.map((reason) => ({
              label: reason.label,
              barPercent: reason.score,
              display: String(reason.score),
            }))}
          />
        </Card>
        <Card
          title="주 이용 업종"
          titleSize="lg"
          description="최근 3개월 결제 금액 기준"
        >
          <RankedBarList
            accent="blue"
            showRank={false}
            labelClassName="w-[70px]"
            valueClassName="w-9"
            items={MEMBER_CATEGORIES.map((category) => ({
              label: category.label,
              barPercent: (category.share / MEMBER_CATEGORIES[0].share) * 100,
              display: `${category.share}%`,
            }))}
          />
        </Card>
        <Card
          title="최근 결제 내역"
          titleSize="lg"
          actions={<span className="text-xs text-gray-500">최근 5건</span>}
        >
          <div className="flex flex-col">
            <div className="grid h-8 grid-cols-[56px_minmax(0,1fr)_88px_76px] items-center gap-2 border-b border-slate-200 px-1 text-xs font-semibold text-slate-500">
              <span>결제일</span>
              <span>가맹점</span>
              <span className="text-right">금액</span>
              <span className="text-right">결제 방식</span>
            </div>
            {detail.payments.map((payment) => (
              <div
                key={payment.store}
                className="grid min-h-[46px] grid-cols-[56px_minmax(0,1fr)_88px_76px] items-center gap-2 border-b border-slate-100 px-1 text-xs"
              >
                <span className="text-slate-500">{payment.date}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-semibold">
                    {payment.store}
                  </span>
                  <span className="text-2xs text-slate-500">
                    {payment.category}
                  </span>
                </span>
                <span className="text-right font-bold">{payment.amount}</span>
                <span className="text-right text-slate-500">
                  {payment.method}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5">
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-violet-50 px-2.5 text-xs font-bold text-violet-700">
          <Sparkles className="size-3.5" strokeWidth={2} />
          AI 추천 대응
        </span>
        <span className="min-w-0 grow text-sm leading-normal text-gray-800">
          {detail.aiText}
        </span>
      </div>
    </div>
  );
}
