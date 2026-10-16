import { CAMPAIGNS, campaignName } from '@/data/campaign';
import {
  DEFAULT_ANALYSIS_FILTER,
  STATIC_DIMENSIONS,
  AVERAGE_RISK_RATIO,
  adjustRatio,
  getFilterOffset,
} from '@/data/customerAnalysis';
import {
  REASON_RISK_CHANGES,
  MONTHS,
  RISK_COUNTS,
  RISK_RATIOS,
} from '@/data/overview';
import { PERFORMANCE_CAMPAIGNS, PERFORMANCE_KPIS } from '@/data/performance';
import {
  CARD_PRODUCTS,
  MEMBER_COUNT_BY_LEVEL,
  TARGET_MEMBERS,
} from '@/data/target';
import i18n from '@/i18n';
import { cardName, churnReasonLabel, memberNameLabel } from '@/i18n/domain';
import { formatFullMonth, formatMonth, formatNumber } from '@/i18n/format';

// AI 어시스턴트는 데모용이라 실제 LLM에 연결하지 않는다. 질문의 키워드로
// 의도를 골라, 각 화면과 같은 데이터로 미리 정해둔 형식의 답변을 만든다.
// 답변마다 그 숫자를 보여주는 화면으로 가는 링크를 붙인다.
// 답변 문구는 질문한 순간의 언어로 만든다(이미 보낸 답변은 그 언어로 남는다).

const t = i18n.getFixedT(null, null, 'chat');

export type DemoAnswer = {
  text: string;
  link?: { to: string; label: string };
  /** 누르면 바로 보내지는 질문 버튼 */
  suggestions?: string[];
};

/** 추천 질문 키 (chat.suggestions.<key>) */
const SUGGESTION_KEYS = [
  'overview',
  'age',
  'members',
  'cards',
  'campaign',
  'performance',
] as const;

/** 첫 화면 추천 질문이자, 답할 수 없는 질문에 대신 권하는 질문 (현재 언어) */
export const getSuggestedQuestions = () =>
  SUGGESTION_KEYS.map((key) => t(`suggestions.${key}`));

type Intent = {
  keywords: RegExp;
  build: () => DemoAnswer;
};

/** 'N명' / 'N people' */
function people(count: number): string {
  return i18n.t('common.unit.people', { count });
}

function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

function signed(value: number, digits = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`;
}

function tableHeader(headers: string[]): string[] {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];
}

// 대시보드 (최신 월)
function buildOverviewAnswer(): DemoAnswer {
  const idx = MONTHS.length - 1;
  const risk = RISK_COUNTS[idx];
  const ratio = RISK_RATIOS[idx];
  const total = Math.round((risk / ratio) * 100);
  const ratioDelta = ratio - RISK_RATIOS[idx - 1];
  const topGroups = REASON_RISK_CHANGES.map(([reason, prev, cur]) => ({
    reason,
    prev,
    cur,
  }))
    .sort((a, b) => b.cur - b.prev - (a.cur - a.prev))
    .slice(0, 3);
  return {
    text: [
      t('answers.overview.summary', {
        month: formatFullMonth(MONTHS[idx]),
        total: formatNumber(total),
        risk: people(risk),
        ratio: pct(ratio),
        delta: signed(ratioDelta),
      }),
      '',
      ...tableHeader([
        t('answers.overview.column.reason'),
        formatMonth(MONTHS[idx - 1]),
        formatMonth(MONTHS[idx]),
      ]),
      ...topGroups.map(
        (group) =>
          `| ${churnReasonLabel(group.reason)} | ${people(group.prev)} | ${t(
            'answers.overview.increase',
            {
              value: people(group.cur),
              diff: formatNumber(group.cur - group.prev),
            },
          )} |`,
      ),
    ].join('\n'),
    link: { to: '/dashboard', label: t('links.overview') },
  };
}

// 고객 분석 (기본 필터 기준)
function buildAgeAnswer(): DemoAnswer {
  const offset = getFilterOffset(DEFAULT_ANALYSIS_FILTER);
  const age = STATIC_DIMENSIONS.find((dimension) => dimension.key === 'age');
  const rows = (age?.rows ?? []).map(([segment, baseRatio, total]) => {
    const ratio = adjustRatio(baseRatio, offset);
    return {
      label: i18n.t(`customerAnalysis.segment.${segment}`),
      ratio,
      count: Math.round((total * ratio) / 100),
    };
  });
  const top = [...rows].sort((a, b) => b.ratio - a.ratio)[0];
  return {
    text: [
      t('answers.age.summary', {
        group: top?.label ?? '',
        ratio: pct(top?.ratio ?? 0),
        average: pct(AVERAGE_RISK_RATIO),
        delta: signed((top?.ratio ?? 0) - AVERAGE_RISK_RATIO),
      }),
      '',
      ...tableHeader([
        t('answers.age.column.group'),
        t('answers.age.column.ratio'),
        t('answers.age.column.count'),
      ]),
      ...rows.map(
        (row) => `| ${row.label} | ${pct(row.ratio)} | ${people(row.count)} |`,
      ),
    ].join('\n'),
    link: { to: '/target', label: t('links.customerAnalysis') },
  };
}

// 회원 목록
function buildMembersAnswer(): DemoAnswer {
  const top = TARGET_MEMBERS.slice(0, 5);
  return {
    text: [
      t('answers.members.summary', {
        all: people(MEMBER_COUNT_BY_LEVEL.all),
        high: people(MEMBER_COUNT_BY_LEVEL.high),
        medium: people(MEMBER_COUNT_BY_LEVEL.medium),
      }),
      '',
      ...tableHeader([
        t('answers.members.column.member'),
        t('answers.members.column.score'),
        t('answers.members.column.reason'),
      ]),
      ...top.map(
        (member) =>
          `| ${memberNameLabel(member.name)} | ${i18n.t('common.unit.points', {
            count: member.score,
          })} | ${churnReasonLabel(member.reason)} |`,
      ),
    ].join('\n'),
    link: { to: '/target/members', label: t('links.members') },
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
      t('answers.cards.summary', {
        card: top[0] ? cardName(top[0].id) : '',
        rate: pct(top[0]?.churnRate ?? 0),
        count: CARD_PRODUCTS.length,
        average: pct(average),
      }),
      '',
      ...tableHeader([
        t('answers.cards.column.card'),
        t('answers.cards.column.rate'),
        t('answers.cards.column.delta'),
      ]),
      ...top.map(
        (card) =>
          `| ${cardName(card.id)} | ${pct(card.churnRate)} | ${signed(card.churnRateDelta)}%p |`,
      ),
    ].join('\n'),
    link: { to: '/target/cards', label: t('links.cards') },
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
      t('answers.campaign.summary', {
        count: sent.length,
        people: people(sentCount),
        rate: pct(averageResponse),
        returned: people(returned),
      }),
      '',
      ...tableHeader([
        t('answers.campaign.column.campaign'),
        t('answers.campaign.column.rate'),
        t('answers.campaign.column.returned'),
      ]),
      ...top.map(
        (campaign) =>
          `| ${campaignName(campaign.id)} | ${pct(campaign.responseRate ?? 0)} | ${people(campaign.returned ?? 0)} |`,
      ),
    ].join('\n'),
    link: { to: '/marketing/history', label: t('links.marketingHistory') },
  };
}

// 관리 및 성과
function buildPerformanceAnswer(): DemoAnswer {
  const best = PERFORMANCE_CAMPAIGNS[0];
  return {
    text: [
      t('answers.performance.summary', {
        returned: people(PERFORMANCE_KPIS.returned),
        gap: PERFORMANCE_KPIS.churnGap.toFixed(1),
      }),
      '',
      ...tableHeader([
        t('answers.performance.column.metric'),
        t('answers.performance.column.value'),
      ]),
      `| ${t('answers.performance.row.churnRate')} | ${PERFORMANCE_KPIS.lastTarget}% / ${PERFORMANCE_KPIS.lastControl}% |`,
      `| ${i18n.t('performance.kpi.amount.label')} | ${i18n.t(
        'performance.campaign.amount',
        {
          value: formatNumber(PERFORMANCE_KPIS.amount, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        },
      )} |`,
      `| ${i18n.t('performance.kpi.roi.label')} | ${t(
        'answers.performance.row.roiValue',
        { value: PERFORMANCE_KPIS.roi.toFixed(1) },
      )} |`,
      '',
      best
        ? t('answers.performance.best', {
            name: campaignName(best.id),
            returned: people(best.returned),
          })
        : '',
    ].join('\n'),
    link: { to: '/performance', label: t('links.performance') },
  };
}

// 위에서부터 순서대로 검사한다 — 더 구체적인 의도를 앞에 둔다.
// ("이탈률 높은 카드"처럼 '이탈'이 함께 들어간 질문이 많아 대시보드는 맨 뒤)
// 화면 언어와 상관없이 한국어·영어 키워드를 모두 받는다.
// 영어는 'age'가 average·usage 등에 들어가는 것처럼 다른 단어 속에 걸리지 않게 단어 경계로 찾는다.
const INTENTS: Intent[] = [
  {
    keywords:
      /성과|효과|\bROI\b|방어|대조군|방지|\bperformance|\bresults?\b|\beffect|\bimpact|\bprevent|\bretain|\bretention|control group/i,
    build: buildPerformanceAnswer,
  },
  {
    keywords:
      /캠페인|발송|반응|접촉|\bcampaigns?\b|\bsen[dt]|\brespon|\bcontact/i,
    build: buildCampaignAnswer,
  },
  { keywords: /카드|상품|\bcards?\b|\bproducts?\b/i, build: buildCardAnswer },
  {
    keywords:
      /회원|누구|명단|목록|점수|\bmembers?\b|\bwho\b|\blist\b|\bscores?\b/i,
    build: buildMembersAnswer,
  },
  {
    keywords: /연령|나이|세대|\d0대|\bages?\b|\d0s\b|\bgenerations?\b/i,
    build: buildAgeAnswer,
  },
  {
    keywords:
      /위험|이탈|현황|요약|전체|추이|고객군|\brisk|\bchurn|\boverview\b|\bsummary\b|\bstatus\b|\btrends?\b/i,
    build: buildOverviewAnswer,
  },
];

export function getDemoAnswer(question: string): DemoAnswer {
  const intent = INTENTS.find(({ keywords }) => keywords.test(question));
  return intent
    ? intent.build()
    : { text: t('fallback'), suggestions: getSuggestedQuestions() };
}
