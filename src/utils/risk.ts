import type { Customer, RiskLevel } from '@/types/churn';

type RiskLevelMeta = {
  label: string;
  dotColorClassName: string;
  badgeClassName: string;
  chartColor: string;
};

export const RISK_LEVEL_ORDER: RiskLevel[] = ['low', 'medium', 'high'];

export const RISK_LEVEL_DISPLAY_ORDER: RiskLevel[] = ['high', 'medium', 'low'];

export const RISK_LEVEL_META: Record<RiskLevel, RiskLevelMeta> = {
  low: {
    label: '저위험',
    dotColorClassName: 'bg-emerald-500',
    badgeClassName: 'bg-emerald-50 text-emerald-700',
    chartColor: '#10b981',
  },
  medium: {
    label: '중위험',
    dotColorClassName: 'bg-yellow-400',
    badgeClassName: 'bg-yellow-50 text-yellow-700',
    chartColor: '#f59e0b',
  },
  high: {
    label: '위험',
    dotColorClassName: 'bg-red-500',
    badgeClassName: 'bg-red-50 text-red-600',
    chartColor: '#ef4444',
  },
};

// Short labels for tight spaces (e.g. radar chart axis ticks).
export const REASON_SHORT_LABEL: Record<string, string> = {
  '타사 카드 신규 발급 이력': '타사 카드 발급',
  '휴면 전환 임박': '휴면 임박',
  '연회비 대비 혜택 미사용': '혜택 미사용',
  '리볼빙 이용 증가': '리볼빙 증가',
  '포인트 소멸 임박': '포인트 소멸',
  '고객센터 불만 접수': '불만 접수',
  '연체 이력 발생': '연체 이력',
  '최근 3개월 이용금액 급감': '이용금액 급감',
  '부가서비스 미이용': '부가서비스',
  '실적 조건 미충족': '실적 미충족',
};

export function getReasonShortLabel(label: string) {
  return REASON_SHORT_LABEL[label] ?? label;
}

export function getRiskLevelRank(riskLevel: RiskLevel) {
  return RISK_LEVEL_ORDER.indexOf(riskLevel);
}

/**
 * 기본(미정렬) 목록에서 위험도가 높은 회원이 회원번호 순서상 한 덩어리로
 * 몰려 보이지 않도록, 위험/중위험/저위험을 번갈아 섞는다. 각 위험도
 * 그룹 내부의 상대 순서는 그대로 유지한다(라운드로빈 interleave).
 */
export function interleaveByRiskLevel<T extends { riskLevel: RiskLevel }>(
  items: T[],
): T[] {
  const groups: Record<RiskLevel, T[]> = { high: [], medium: [], low: [] };
  items.forEach((item) => groups[item.riskLevel].push(item));

  const result: T[] = [];
  let index = 0;
  while (result.length < items.length) {
    for (const level of RISK_LEVEL_DISPLAY_ORDER) {
      const group = groups[level];
      if (index < group.length) {
        result.push(group[index]);
      }
    }
    index += 1;
  }
  return result;
}

/** 이탈 예측 점수로 위험도를 구한다. 기준은 회원 목데이터의 riskLevel 분포와 맞춘 값. */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

export function getTopReason(customer: Customer) {
  return customer.churnReasons[0];
}

export function getLastUsedAt(customer: Customer): string | null {
  if (customer.transactions.length === 0) {
    return null;
  }
  return customer.transactions.reduce(
    (latestDate, transaction) =>
      transaction.date > latestDate ? transaction.date : latestDate,
    customer.transactions[0].date,
  );
}
