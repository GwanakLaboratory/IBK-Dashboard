import { useState } from 'react';
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
import { getCardRateTrend, getCardReasonScores } from '@/data/cards';
import {
  CARD_PRODUCTS,
  TARGET_MEMBERS,
  findCardProduct,
  type CardDetailLinkState,
} from '@/data/target';
import type { RiskLevel } from '@/types/churn';
import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';
import { CardTag } from './CardTag';

const formatNumber = (value: number) => value.toLocaleString('ko-KR');

const MEMBER_GRID =
  'grid grid-cols-[36px_80px_88px_96px_64px_minmax(0,1fr)_52px] items-center gap-2 px-1';

// 도넛 둘레 (반지름 62)
const DONUT_RADIUS = 62;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const DONUT_STROKE_CLASS_NAME: Record<RiskLevel, string> = {
  high: 'stroke-red-500',
  medium: 'stroke-amber-500',
  low: 'stroke-green-400',
};

export function CardDetailPage() {
  const { cardName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromMemberId = (location.state as CardDetailLinkState | null)
    ?.fromMemberId;
  const [trendRange, setTrendRange] = useState('12');
  const card = findCardProduct(cardName);

  if (!card) {
    return (
      <Navigate
        to={`/target/cards/${encodeURIComponent(CARD_PRODUCTS[0].name)}`}
        replace
      />
    );
  }

  const membersPath = `/target/members?product=${encodeURIComponent(card.name)}`;
  const lowShare = +(100 - card.highShare - card.mediumShare).toFixed(1);
  const riskShare = card.highShare + card.mediumShare;
  const mix: { level: RiskLevel; share: number }[] = [
    { level: 'high', share: card.highShare },
    { level: 'medium', share: card.mediumShare },
    { level: 'low', share: lowShare },
  ];
  const topMembers = TARGET_MEMBERS.filter(
    (member) => member.product === card.name,
  )
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const reasons = getCardReasonScores(card);
  const trendData = getCardRateTrend(card).slice(-Number(trendRange));
  const trendSeries: TrendSeries[] = [
    {
      key: 'card',
      label: card.name,
      color: CHART_COLOR.primary,
      labelBelow: card.churnRate < 2.6,
    },
    {
      key: 'average',
      label: '전체 카드 평균',
      color: CHART_COLOR.muted,
      dashed: true,
      labelBelow: card.churnRate >= 2.6,
    },
  ];

  const kpis = [
    {
      label: '보유 회원',
      labelClassName: 'text-blue-700',
      value: formatNumber(card.members),
      unit: '명',
      sub: '9월 말 유효 회원',
    },
    {
      label: '이탈률',
      labelClassName: 'text-red-700',
      value: card.churnRate.toFixed(1),
      unit: '%',
      badge: <DeltaBadge delta={card.churnRateDelta} size="md" />,
      sub: '전월 대비',
    },
    {
      label: '이탈 위험 회원',
      labelClassName: 'text-red-700',
      value: formatNumber(Math.round((card.members * riskShare) / 100)),
      unit: '명',
      sub: `위험 + 중위험 · 보유 회원의 ${riskShare.toFixed(1)}%`,
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
        eyebrow="RISK TARGET · 카드 상세"
        title={card.name}
        description={card.brands.join(' · ')}
        back={
          fromMemberId
            ? { label: '회원 상세', to: `/target/members/${fromMemberId}` }
            : { label: '카드 목록', to: '/target/cards' }
        }
        actions={
          <Button variant="outline" onClick={() => navigate(membersPath)}>
            <Users className="h-4 w-4" />
            보유 회원 보기
          </Button>
        }
      />

      <div className="grid grid-cols-[minmax(0,4fr)_repeat(3,minmax(0,3fr))] divide-x divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-4 px-6 py-5">
          {CARD_IMAGE_URLS[card.name] ? (
            <img
              src={CARD_IMAGE_URLS[card.name]}
              alt={`${card.name} 카드 이미지`}
              className="h-20 w-auto shrink-0 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-20 w-32 shrink-0 flex-col justify-between rounded-lg bg-sidebar px-3 py-2.5">
              <span className="h-3.5 w-5 rounded-sm bg-yellow-600" />
              <span className="self-end text-2xs font-bold tracking-widest text-white">
                {card.brands[0]}
              </span>
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-bold text-blue-700">주요 혜택</span>
            <span className="text-sm font-semibold leading-snug">
              {card.summary}
            </span>
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <CardTag key={tag} label={tag} size="sm" />
              ))}
            </div>
          </div>
        </div>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
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
          title="보유 회원 위험도 구성"
          titleSize="lg"
          description="이 카드를 쓰는 회원의 이탈 예측 등급별 분포"
          gapClassName="gap-3.5"
        >
          <div className="flex items-center gap-6">
            <div className="relative size-40 shrink-0">
              <svg
                viewBox="0 0 160 160"
                role="img"
                aria-label={`보유 회원 위험도 구성: 위험 ${card.highShare}%, 중위험 ${card.mediumShare}%, 저위험 ${lowShare}%`}
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
                <span className="text-xs text-slate-500">위험</span>
                <span className="text-2xl font-bold leading-tight text-red-600">
                  {card.highShare}%
                </span>
              </div>
            </div>
            <div className="flex min-w-0 grow flex-col text-xs">
              <div className="grid h-8 grid-cols-[minmax(0,1fr)_110px_70px] items-center gap-2 border-b border-slate-200 font-semibold text-slate-500">
                <span>위험도</span>
                <span className="text-right">회원 수</span>
                <span className="text-right">비율</span>
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
                    {formatNumber(
                      Math.round((card.members * item.share) / 100),
                    )}
                    명
                  </span>
                  <span className="text-right text-slate-600">
                    {item.share}%
                  </span>
                </div>
              ))}
              <div className="grid h-10 grid-cols-[minmax(0,1fr)_110px_70px] items-center gap-2 font-bold">
                <span>전체</span>
                <span className="text-right">
                  {formatNumber(card.members)}명
                </span>
                <span className="text-right text-slate-600">100%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="월별 이탈률 추이"
          titleSize="lg"
          gapClassName="gap-2.5"
          className="pb-3"
          actions={
            <div className="flex items-center gap-5">
              <LineLegend series={trendSeries} />
              <Dropdown
                label="추이 기간"
                size="sm"
                align="right"
                className="w-32"
                value={trendRange}
                onChange={setTrendRange}
                options={[
                  { value: '6', label: '최근 6개월' },
                  { value: '12', label: '최근 12개월' },
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
          title="보유 회원 이탈 이유 TOP 5"
          titleSize="lg"
          description="이 카드 회원의 사유별 평균 기여 점수 (0–100)"
        >
          <RankedBarList
            labelClassName="w-auto grow"
            valueClassName="w-8"
            items={reasons.map((reason) => ({
              label: reason.label,
              barPercent: reason.score,
              display: String(reason.score),
            }))}
          />
        </Card>

        <Card
          title="이 카드의 이탈 위험 회원 TOP3"
          titleSize="lg"
          titleAddon={
            <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600">
              이탈 예측 점수
            </span>
          }
        >
          <div className="flex grow flex-col text-xs">
            <div
              className={`${MEMBER_GRID} h-8 border-b border-slate-200 font-semibold text-slate-500`}
            >
              <span>순위</span>
              <span>회원</span>
              <span>회원번호</span>
              <span className="text-right">이탈 예측 점수</span>
              <span className="text-right">미이용</span>
              <span className="pl-4">주요 이유</span>
              <span />
            </div>
            {topMembers.map((member, index) => {
              const level = getRiskLevelFromScore(member.score);
              return (
                <div
                  key={member.id}
                  className={`${MEMBER_GRID} min-h-11 flex-1 border-b border-slate-100`}
                >
                  <RankBadge rank={index + 1} highlight="dark" size="md" />
                  <span className="truncate font-semibold text-slate-900">
                    {member.name}
                  </span>
                  <span className="text-slate-500">{member.id}</span>
                  <span
                    className={`text-right font-bold ${RISK_LEVEL_META[level].textClassName}`}
                  >
                    {member.score}점
                  </span>
                  <span className="text-right font-semibold text-slate-900">
                    {member.idleDays}일
                  </span>
                  <span className="truncate pl-4 text-slate-700">
                    {member.reason}
                  </span>
                  <Link
                    to={`/target/members/${member.id}`}
                    state={{ from: 'card' }}
                    aria-label={`${member.name} 상세 보기`}
                    className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    상세
                  </Link>
                </div>
              );
            })}
            {topMembers.length === 0 && (
              <div className="flex h-28 items-center justify-center text-slate-500">
                이 카드에는 표시할 위험 회원이 없어요.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
