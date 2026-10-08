/* version2 전체 현황 시안 데이터 (디자인 캔버스 OverviewV2 값 그대로) */
import { CHURN_REASONS } from '@/data/target';

export const MONTHS = [
  '25.10',
  '25.11',
  '25.12',
  '26.01',
  '26.02',
  '26.03',
  '26.04',
  '26.05',
  '26.06',
  '26.07',
  '26.08',
  '26.09',
];

/** 월별 분석 대상 고객 수 (9월 = 기대 효과 공식의 전체 회원 130만) */
const MEMBER_TOTALS = [
  1119490, 1133400, 1148660, 1156160, 1164190, 1186110, 1235350, 1241870,
  1276990, 1284260, 1288940, 1300000,
];

/** 월별 이탈 위험 고객 수 (9월 = 모델이 고른 마케팅 대상 29.7만) */
export const RISK_COUNTS = [
  191433, 198345, 205610, 209265, 216539, 225361, 242129, 247132, 265614,
  276116, 286145, 297143,
];

/** 월별 이탈 위험 비중 (%) */
export const RISK_RATIOS = RISK_COUNTS.map(
  (count, index) => (count / MEMBER_TOTALS[index]) * 100,
);

/**
 * 이탈 사유별 위험 고객 수 [사유, 8월, 9월]. 9월 합계 = RISK_COUNTS 9월, 8월 합계 = 8월.
 * CHURN_REASONS 순서(회원이 많은 순)대로 고객 수와 증가 폭이 크다.
 */
export const REASON_RISK_CHANGES: [string, number, number][] = [
  [CHURN_REASONS[0], 99700, 104000],
  [CHURN_REASONS[1], 71386, 74286],
  [CHURN_REASONS[2], 57429, 59429],
  [CHURN_REASONS[3], 43321, 44571],
  [CHURN_REASONS[4], 14309, 14857],
];

export const formatNumber = (value: number) => value.toLocaleString('ko-KR');
export const monthLabel = (month: string) => `${Number(month.slice(3))}월`;
export const fullMonthLabel = (month: string) =>
  `20${month.slice(0, 2)}년 ${Number(month.slice(3))}월`;
