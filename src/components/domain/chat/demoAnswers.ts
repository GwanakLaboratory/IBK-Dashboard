import { CAMPAIGNS } from '@/data/campaign';
import {
  DEFAULT_ANALYSIS_FILTER,
  STATIC_DIMENSIONS,
  AVERAGE_RISK_RATIO,
  adjustRatio,
  getFilterOffset,
} from '@/data/customerAnalysis';
import {
  GROUP_RISK_CHANGES,
  MONTHS,
  RISK_COUNTS,
  RISK_RATIOS,
  fullMonthLabel,
} from '@/data/overview';
import { PERFORMANCE_CAMPAIGNS, PERFORMANCE_KPIS } from '@/data/performance';
import {
  CARD_PRODUCTS,
  MEMBER_COUNT_BY_LEVEL,
  TARGET_MEMBERS,
} from '@/data/target';

// AI 어시스턴트는 데모용이라 실제 LLM에 연결하지 않는다. 질문의 키워드로
// 의도를 골라, 각 화면과 같은 데이터로 미리 정해둔 형식의 답변을 만든다.
// 답변마다 그 숫자를 보여주는 화면으로 가는 링크를 붙인다.

export type DemoAnswer = {
  text: string;
  link?: { to: string; label: string };
  /** 누르면 바로 보내지는 질문 버튼 */
  suggestions?: string[];
};

/** 첫 화면 추천 질문이자, 답할 수 없는 질문에 대신 권하는 질문 */
export const SUGGESTED_QUESTIONS = [
  '이번 달 이탈 위험 고객 현황',
  '연령대별 이탈 위험 알려줘',
  '위험 점수 높은 회원은?',
  '이탈률 높은 카드는?',
  '9월 캠페인 반응률 어때?',
  '이탈 방지 성과 알려줘',
];

type Intent = {
  keywords: RegExp;
  build: () => DemoAnswer;
};

function n(value: number): string {
  return value.toLocaleString('ko-KR');
}

function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

function signed(value: number, digits = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`;
}

// 대시보드 (최신 월)
function buildOverviewAnswer(): DemoAnswer {
  const idx = MONTHS.length - 1;
  const risk = RISK_COUNTS[idx];
  const ratio = RISK_RATIOS[idx];
  const total = Math.round((risk / ratio) * 100);
  const ratioDelta = ratio - RISK_RATIOS[idx - 1];
  const topGroups = GROUP_RISK_CHANGES.map(([name, prev, cur]) => ({
    name,
    prev,
    cur,
  }))
    .sort((a, b) => b.cur - b.prev - (a.cur - a.prev))
    .slice(0, 3);
  return {
    text: [
      `${fullMonthLabel(MONTHS[idx])} 기준 최근 2개월 이용 고객 **${n(total)}명** 중 **${n(risk)}명(${pct(ratio)})**이 이탈 위험으로 예측돼요. 위험 비중은 전월보다 **${signed(ratioDelta)}%p** 늘었어요.`,
      '',
      '| 전월 대비 위험 증가 고객군 | 8월 | 9월 |',
      '| --- | --- | --- |',
      ...topGroups.map(
        (group) =>
          `| ${group.name} | ${n(group.prev)}명 | ${n(group.cur)}명 (+${n(group.cur - group.prev)}) |`,
      ),
    ].join('\n'),
    link: { to: '/dashboard', label: '대시보드에서 보기' },
  };
}

// 고객 분석 (기본 필터 기준)
function buildAgeAnswer(): DemoAnswer {
  const offset = getFilterOffset(DEFAULT_ANALYSIS_FILTER);
  const age = STATIC_DIMENSIONS.find((dimension) => dimension.key === 'age');
  const rows = (age?.rows ?? []).map(([label, baseRatio, total]) => {
    const ratio = adjustRatio(baseRatio, offset);
    return { label, ratio, count: Math.round((total * ratio) / 100) };
  });
  const top = [...rows].sort((a, b) => b.ratio - a.ratio)[0];
  return {
    text: [
      `연령대 중에서는 **${top?.label}** 위험비중이 **${pct(top?.ratio ?? 0)}**로 가장 높아요. 전체 평균(${pct(AVERAGE_RISK_RATIO)})보다 **${signed((top?.ratio ?? 0) - AVERAGE_RISK_RATIO)}%p** 높은 수준이에요.`,
      '',
      '| 연령대 | 위험비중 | 위험 고객 |',
      '| --- | --- | --- |',
      ...rows.map(
        (row) => `| ${row.label} | ${pct(row.ratio)} | ${n(row.count)}명 |`,
      ),
    ].join('\n'),
    link: { to: '/target', label: '고객 분석에서 보기' },
  };
}

// 회원 목록
function buildMembersAnswer(): DemoAnswer {
  const top = TARGET_MEMBERS.slice(0, 5);
  return {
    text: [
      `분석 대상 ${n(MEMBER_COUNT_BY_LEVEL.all)}명 중 **위험(70점 이상) ${n(MEMBER_COUNT_BY_LEVEL.high)}명**, 중위험 ${n(MEMBER_COUNT_BY_LEVEL.medium)}명이에요. 이탈 예측 점수가 가장 높은 회원은 다음과 같아요.`,
      '',
      '| 회원 | 점수 | 주요 이탈 이유 |',
      '| --- | --- | --- |',
      ...top.map(
        (member) => `| ${member.name} | ${member.score}점 | ${member.reason} |`,
      ),
    ].join('\n'),
    link: { to: '/target/members', label: '회원 목록에서 보기' },
  };
}

// 카드 분석
function buildCardAnswer(): DemoAnswer {
  const average =
    CARD_PRODUCTS.reduce((sum, card) => sum + card.churnRate, 0) /
    CARD_PRODUCTS.length;
  const top = [...CARD_PRODUCTS]
    .sort((a, b) => b.churnRate - a.churnRate)
    .slice(0, 3);
  return {
    text: [
      `이탈률이 가장 높은 카드는 **${top[0]?.name}**(${pct(top[0]?.churnRate ?? 0)})예요. 전체 ${CARD_PRODUCTS.length}개 상품의 평균 이탈률은 ${pct(average)}예요.`,
      '',
      '| 카드 | 이탈률 | 전월 대비 |',
      '| --- | --- | --- |',
      ...top.map(
        (card) =>
          `| ${card.name} | ${pct(card.churnRate)} | ${signed(card.churnRateDelta)}%p |`,
      ),
    ].join('\n'),
    link: { to: '/target/cards', label: '카드 분석에서 보기' },
  };
}

// 접촉 이력 (발송된 캠페인)
function buildCampaignAnswer(): DemoAnswer {
  const sent = CAMPAIGNS.filter((campaign) => campaign.status !== 'plan');
  const sentCount = sent.reduce((sum, campaign) => sum + campaign.count, 0);
  const returned = sent.reduce(
    (sum, campaign) => sum + (campaign.returned ?? 0),
    0,
  );
  const averageResponse =
    sent.reduce(
      (sum, campaign) => sum + campaign.count * (campaign.responseRate ?? 0),
      0,
    ) / sentCount;
  const top = [...sent]
    .sort((a, b) => (b.responseRate ?? 0) - (a.responseRate ?? 0))
    .slice(0, 3);
  return {
    text: [
      `9월에 캠페인 **${sent.length}건**을 ${n(sentCount)}명에게 보냈고, 평균 반응률은 **${pct(averageResponse)}**, 이용 재개는 **${n(returned)}명**이에요.`,
      '',
      '| 캠페인 | 반응률 | 이용 재개 |',
      '| --- | --- | --- |',
      ...top.map(
        (campaign) =>
          `| ${campaign.name} | ${pct(campaign.responseRate ?? 0)} | ${n(campaign.returned ?? 0)}명 |`,
      ),
    ].join('\n'),
    link: { to: '/marketing/history', label: '접촉 이력에서 보기' },
  };
}

// 관리 및 성과
function buildPerformanceAnswer(): DemoAnswer {
  const best = PERFORMANCE_CAMPAIGNS[0];
  return {
    text: [
      `9월 캠페인으로 **${n(PERFORMANCE_KPIS.returned)}명**이 다시 카드를 쓰기 시작했어요. 타겟군 이탈률이 대조군보다 **${PERFORMANCE_KPIS.churnGap.toFixed(1)}%p** 낮아요.`,
      '',
      '| 지표 | 값 |',
      '| --- | --- |',
      `| 이탈률 (타겟군 / 대조군) | ${PERFORMANCE_KPIS.lastTarget}% / ${PERFORMANCE_KPIS.lastControl}% |`,
      `| 방어 이용금액 | ${PERFORMANCE_KPIS.amount.toFixed(1)}억 원 |`,
      `| 마케팅 효율 (ROI) | ${PERFORMANCE_KPIS.roi.toFixed(1)}배 |`,
      '',
      best
        ? `이용 재개가 가장 많은 캠페인은 **${best.name}**(${n(best.returned)}명)이에요.`
        : '',
    ].join('\n'),
    link: { to: '/performance', label: '관리 및 성과에서 보기' },
  };
}

// 위에서부터 순서대로 검사한다 — 더 구체적인 의도를 앞에 둔다.
// ("이탈률 높은 카드"처럼 '이탈'이 함께 들어간 질문이 많아 대시보드는 맨 뒤)
const INTENTS: Intent[] = [
  {
    keywords: /성과|효과|ROI|방어|대조군|방지/i,
    build: buildPerformanceAnswer,
  },
  { keywords: /캠페인|발송|반응|접촉/, build: buildCampaignAnswer },
  { keywords: /카드|상품/, build: buildCardAnswer },
  { keywords: /회원|누구|명단|목록|점수/, build: buildMembersAnswer },
  { keywords: /연령|나이|세대|\d0대/, build: buildAgeAnswer },
  {
    keywords: /위험|이탈|현황|요약|전체|추이|고객군/,
    build: buildOverviewAnswer,
  },
];

const FALLBACK_TEXT =
  '아직 이 질문에는 답변할 수 없어요. 아래 질문으로 물어보시면 바로 답변해 드려요.';

export function getDemoAnswer(question: string): DemoAnswer {
  const intent = INTENTS.find(({ keywords }) => keywords.test(question));
  return intent
    ? intent.build()
    : { text: FALLBACK_TEXT, suggestions: SUGGESTED_QUESTIONS };
}
