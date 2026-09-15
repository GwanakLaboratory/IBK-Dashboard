import type { Customer, RiskLevel } from '@/types/churn';

type RiskLevelMeta = {
  label: string;
  dotColorClassName: string;
  chartColor: string;
};

export const RISK_LEVEL_ORDER: RiskLevel[] = ['low', 'medium', 'high'];

export const RISK_LEVEL_DISPLAY_ORDER: RiskLevel[] = ['high', 'medium', 'low'];

export const RISK_LEVEL_META: Record<RiskLevel, RiskLevelMeta> = {
  low: {
    label: '저위험',
    dotColorClassName: 'bg-emerald-500',
    chartColor: '#10b981',
  },
  medium: {
    label: '중위험',
    dotColorClassName: 'bg-yellow-400',
    chartColor: '#f59e0b',
  },
  high: {
    label: '위험',
    dotColorClassName: 'bg-red-500',
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

export function getTopReason(customer: Customer) {
  return customer.churnReasons[0];
}
