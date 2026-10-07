import {
  ageGroupChurnStats,
  customers,
  memberCohortChurnStats,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  productUsageStats,
} from '@/data/customers';

// AI 어시스턴트는 데모용이라 실제 LLM에 연결하지 않는다. 질문의 키워드로
// 의도를 골라, 대시보드와 같은 더미 데이터로 미리 정해둔 형식의 답변을 만든다.

export type DemoAnswer = {
  text: string;
  link?: { to: string; label: string };
};

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

const latestActivity = monthlyMemberActivity[monthlyMemberActivity.length - 1];
const previousActivity =
  monthlyMemberActivity[monthlyMemberActivity.length - 2];
const latestDistribution =
  monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
const previousDistribution =
  monthlyRiskDistribution[monthlyRiskDistribution.length - 2];

function churnRate(point: typeof latestActivity): number {
  return (point.canceledMembers / point.activeMembers) * 100;
}

function riskCounts() {
  const high = Math.round(
    (latestActivity.activeMembers * latestDistribution.high) / 100,
  );
  const mid = Math.round(
    (latestActivity.activeMembers * latestDistribution.mid) / 100,
  );
  return { high, mid, low: latestActivity.activeMembers - high - mid };
}

function topChurnReasons(limit: number) {
  const counts = new Map<string, number>();
  customers.forEach((customer) => {
    const top = customer.churnReasons[0];
    if (top) counts.set(top.label, (counts.get(top.label) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      share: (count / customers.length) * 100,
    }));
}

function buildChurnRateAnswer(): DemoAnswer {
  const rate = churnRate(latestActivity);
  const deltaPp = rate - churnRate(previousActivity);
  return {
    text: [
      `${latestActivity.month} 기준 월 이탈률은 **${pct(rate, 2)}**입니다. 전월 대비 **${
        deltaPp >= 0 ? '+' : ''
      }${deltaPp.toFixed(2)}%p** ${deltaPp >= 0 ? '상승' : '하락'}했어요.`,
      '',
      '| 구분 | 전월 | 이번 달 |',
      '| --- | --- | --- |',
      `| 활동 회원 | ${n(previousActivity.activeMembers)}명 | ${n(latestActivity.activeMembers)}명 |`,
      `| 해지 회원 | ${n(previousActivity.canceledMembers)}명 | ${n(latestActivity.canceledMembers)}명 |`,
      `| 이탈률 | ${pct(churnRate(previousActivity), 2)} | ${pct(rate, 2)} |`,
    ].join('\n'),
    link: { to: '/dashboard', label: '대시보드 보기' },
  };
}

function buildRiskAnswer(): DemoAnswer {
  const counts = riskCounts();
  const highDelta = latestDistribution.high - previousDistribution.high;
  return {
    text: [
      `현재 **위험** 등급 회원은 **${n(counts.high)}명**, 중위험은 **${n(
        counts.mid,
      )}명**으로, 전체 ${n(latestActivity.activeMembers)}명 중 **${
        latestDistribution.high + latestDistribution.mid
      }%**가 이탈 위험 상태입니다.`,
      `위험 등급 비율은 전월보다 **${highDelta >= 0 ? '+' : ''}${highDelta}%p** 변했어요.`,
      '',
      '| 구분 | 인원수 | 비율 |',
      '| --- | --- | --- |',
      `| 위험 | ${n(counts.high)}명 | ${latestDistribution.high}% |`,
      `| 중위험 | ${n(counts.mid)}명 | ${latestDistribution.mid}% |`,
      `| 저위험 | ${n(counts.low)}명 | ${latestDistribution.low}% |`,
    ].join('\n'),
    link: { to: '/dashboard', label: '위험도 현황 보기' },
  };
}

function buildReasonAnswer(): DemoAnswer {
  const reasons = topChurnReasons(3);
  return {
    text: [
      `회원별 가장 큰 이탈 요인을 집계하면, **${reasons[0]?.label}**이(가) 가장 많았어요.`,
      '',
      '| 순위 | 이탈 이유 | 회원 비중 |',
      '| --- | --- | --- |',
      ...reasons.map(
        (reason, index) =>
          `| ${index + 1}위 | ${reason.label} | ${pct(reason.share)} |`,
      ),
    ].join('\n'),
    link: { to: '/target/members', label: '회원 목록 보기' },
  };
}

function buildSummaryAnswer(): DemoAnswer {
  const latestUsage = monthlyTotalUsage[monthlyTotalUsage.length - 1];
  const previousUsage = monthlyTotalUsage[monthlyTotalUsage.length - 2];
  const usageDelta =
    ((latestUsage.usage - previousUsage.usage) / previousUsage.usage) * 100;
  const counts = riskCounts();
  const topReason = topChurnReasons(1)[0];
  return {
    text: [
      `**${latestActivity.month} 전체 현황 요약**이에요.`,
      '',
      '| 지표 | 값 |',
      '| --- | --- |',
      `| 활동 회원 | ${n(latestActivity.activeMembers)}명 |`,
      `| 신규 가입 | ${n(latestActivity.newSignups)}명 |`,
      `| 월 이탈률 | ${pct(churnRate(latestActivity), 2)} |`,
      `| 위험 회원 | ${n(counts.high)}명 (${latestDistribution.high}%) |`,
      `| 총 이용액 | ${n(latestUsage.usage)}만원 (${usageDelta.toFixed(1)}%) |`,
      '',
      `이용액은 감소세이고 위험 회원 비율은 늘고 있어요. 주요 이탈 이유는 **${topReason?.label}**입니다.`,
    ].join('\n'),
    link: { to: '/dashboard', label: '대시보드 보기' },
  };
}

function buildProductAnswer(): DemoAnswer {
  const top = [...productUsageStats]
    .sort((a, b) => b.churnRate - a.churnRate)
    .slice(0, 3);
  return {
    text: [
      `이탈률이 가장 높은 카드는 **${top[0]?.productName}**(${pct(
        top[0]?.churnRate ?? 0,
      )})입니다.`,
      '',
      '| 카드 | 이탈률 | 위험 회원 |',
      '| --- | --- | --- |',
      ...top.map(
        (stat) =>
          `| ${stat.productName} | ${pct(stat.churnRate)} | ${n(stat.highRiskCount)}명 |`,
      ),
    ].join('\n'),
    link: { to: '/target/cards', label: '카드 분석 보기' },
  };
}

function buildSegmentAnswer(): DemoAnswer {
  const topAge = [...ageGroupChurnStats].sort(
    (a, b) => b.churnRate - a.churnRate,
  )[0];
  return {
    text: [
      `연령대 중에서는 **${topAge?.label}** 이탈률이 **${pct(
        topAge?.churnRate ?? 0,
      )}**로 가장 높아요.`,
      '',
      '| 구분 | 이탈률 |',
      '| --- | --- |',
      ...[...memberCohortChurnStats, ...ageGroupChurnStats].map(
        (stat) => `| ${stat.label} | ${pct(stat.churnRate)} |`,
      ),
    ].join('\n'),
    link: { to: '/target/members', label: '회원 분석 보기' },
  };
}

// 위에서부터 순서대로 검사한다 — 더 구체적인 의도를 앞에 둔다.
const INTENTS: Intent[] = [
  { keywords: /요약|현황|전체|브리핑/, build: buildSummaryAnswer },
  { keywords: /이유|원인|요인|왜/, build: buildReasonAnswer },
  { keywords: /카드|상품/, build: buildProductAnswer },
  {
    keywords: /연령|나이|세대|\d0대|신규|기존|세그먼트/,
    build: buildSegmentAnswer,
  },
  { keywords: /위험|리스크/, build: buildRiskAnswer },
  { keywords: /이탈률|이탈|해지/, build: buildChurnRateAnswer },
];

const FALLBACK_TEXT = [
  '데모 버전에서는 아래 질문에 답변할 수 있어요.',
  '',
  '- 이번 달 이탈률',
  '- 위험 회원 비율',
  '- 이탈 이유 TOP 3',
  '- 전체 현황 요약',
  '- 이탈률 높은 카드',
  '- 연령대별 이탈률',
].join('\n');

export function getDemoAnswer(question: string): DemoAnswer {
  const intent = INTENTS.find(({ keywords }) => keywords.test(question));
  return intent ? intent.build() : { text: FALLBACK_TEXT };
}
