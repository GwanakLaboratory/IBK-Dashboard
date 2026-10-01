import { getReasonShortLabel, getTopReason } from '@/utils/risk';
import type { Customer } from '@/types/churn';

export type ContactChannel = '문자' | '카카오' | '텔레마케팅';
export type ContactResponse = '반응' | '무반응' | '대기';

export type RecentContact = {
  date: string; // "09.18"
  channel: ContactChannel;
  response: ContactResponse;
};

export type PriorityTarget = {
  rank: number;
  customer: Customer;
  scoreDelta: number; // 전월 대비 이탈점수 변화
  annualUsage: number; // 최근 12개월 이용금액 합계 (만원)
  reasonLabels: string[]; // 핵심 사유 (짧은 라벨)
  recentContact: RecentContact | null;
  recommendedChannel: ContactChannel;
  recommendedBenefit: string;
};

const CORE_REASON_COUNT = 2;

// 핵심 사유 → 권장 혜택
const BENEFIT_BY_REASON: Record<string, string> = {
  '타사 카드 신규 발급 이력': '캐시백',
  '최근 3개월 이용금액 급감': '캐시백',
  '연회비 대비 혜택 미사용': '연회비 면제',
  '포인트 소멸 임박': '포인트 적립',
  '부가서비스 미이용': '할인 쿠폰',
  '실적 조건 미충족': '할인 쿠폰',
  '고객센터 불만 접수': '우대 상담',
};
const DEFAULT_BENEFIT = '맞춤 혜택';

// 이탈점수가 높을수록 즉시 대응 가능한 채널을 권장한다.
function getRecommendedChannel(predictionScore: number): ContactChannel {
  if (predictionScore >= 90) {
    return '텔레마케팅';
  }
  if (predictionScore >= 80) {
    return '카카오';
  }
  return '문자';
}

// 접촉 이력 데이터가 아직 없어서, 회원번호로 고정된 값을 뽑는 목데이터.
const MOCK_CONTACTS: (RecentContact | null)[] = [
  { date: '09.18', channel: '카카오', response: '무반응' },
  null,
  null,
  { date: '09.11', channel: '문자', response: '무반응' },
  { date: '09.20', channel: '카카오', response: '대기' },
  null,
  { date: '08.29', channel: '텔레마케팅', response: '반응' },
  null,
  { date: '09.04', channel: '카카오', response: '무반응' },
];

function getMockRecentContact(customer: Customer) {
  const seed = Number(customer.id.replace(/\D/g, '')) || 0;
  return MOCK_CONTACTS[seed % MOCK_CONTACTS.length];
}

function getScoreDelta(customer: Customer) {
  const trend = customer.riskScoreTrend;
  if (trend.length < 2) {
    return 0;
  }
  return trend[trend.length - 1].score - trend[trend.length - 2].score;
}

export function buildPriorityTargets(customers: Customer[]): PriorityTarget[] {
  return [...customers]
    .sort(
      (customerA, customerB) =>
        customerB.predictionScore - customerA.predictionScore,
    )
    .map((customer, index) => ({
      rank: index + 1,
      customer,
      scoreDelta: getScoreDelta(customer),
      annualUsage: customer.monthly
        .slice(-12)
        .reduce((sum, point) => sum + point.usage, 0),
      reasonLabels: customer.churnReasons
        .slice(0, CORE_REASON_COUNT)
        .map((reason) => getReasonShortLabel(reason.label)),
      recentContact: getMockRecentContact(customer),
      recommendedChannel: getRecommendedChannel(customer.predictionScore),
      recommendedBenefit:
        BENEFIT_BY_REASON[getTopReason(customer).label] ?? DEFAULT_BENEFIT,
    }));
}

export function getMostCommonTopReason(targets: PriorityTarget[]) {
  const countByLabel = new Map<string, number>();
  targets.forEach((target) => {
    const label = getTopReason(target.customer).label;
    countByLabel.set(label, (countByLabel.get(label) ?? 0) + 1);
  });

  let mostCommonLabel: string | null = null;
  let mostCommonCount = 0;
  countByLabel.forEach((count, label) => {
    if (count > mostCommonCount) {
      mostCommonLabel = label;
      mostCommonCount = count;
    }
  });
  return mostCommonLabel;
}

/** 만원 단위 금액을 "1,840만 원" / "1.33억 원" 형태로 표시한다. */
export function formatManwon(amount: number) {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(2)}억 원`;
  }
  return `${amount.toLocaleString('ko-KR')}만 원`;
}
