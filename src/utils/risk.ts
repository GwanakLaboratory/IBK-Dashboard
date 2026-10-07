import type { Customer, RiskLevel } from '@/types/churn';

type RiskLevelMeta = {
  label: string;
  dotColorClassName: string;
  badgeClassName: string;
  /** 점수·막대처럼 위험도 색으로 칠할 숫자 */
  textClassName: string;
  barClassName: string;
  chartColor: string;
};

export const RISK_LEVEL_ORDER: RiskLevel[] = ['low', 'medium', 'high'];

export const RISK_LEVEL_DISPLAY_ORDER: RiskLevel[] = ['high', 'medium', 'low'];

export const RISK_LEVEL_META: Record<RiskLevel, RiskLevelMeta> = {
  low: {
    label: '저위험',
    dotColorClassName: 'bg-green-500',
    badgeClassName: 'bg-green-100 text-green-700',
    textClassName: 'text-green-700',
    barClassName: 'bg-green-500',
    chartColor: '#22c55e',
  },
  medium: {
    label: '중위험',
    dotColorClassName: 'bg-amber-500',
    badgeClassName: 'bg-amber-100 text-amber-700',
    textClassName: 'text-amber-700',
    barClassName: 'bg-amber-500',
    chartColor: '#f59e0b',
  },
  high: {
    label: '위험',
    dotColorClassName: 'bg-red-500',
    badgeClassName: 'bg-red-100 text-red-700',
    textClassName: 'text-red-600',
    barClassName: 'bg-red-500',
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

/** 이탈 예측 점수로 위험도를 구한다. 기준: 70점 이상 위험, 40점 이상 중위험 (디자인 시안 기준). */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
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
