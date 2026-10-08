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

/** 월별 최근 2개월 이용 고객 수 (기대 효과 공식의 전체 회원 130만 이상 언저리) */
const MEMBER_TOTALS = [
  1300512, 1301287, 1301934, 1302745, 1303168, 1303902, 1304651, 1305213,
  1305876, 1306429, 1307138, 1307694,
];

/** 월별 이탈 위험 고객 수 (공식의 이탈 비율 20% 언저리) */
export const RISK_COUNTS = [
  248398, 251148, 249971, 252733, 254118, 252957, 255712, 257127, 255952,
  258673, 257506, 258923,
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
  [CHURN_REASONS[0], 90035, 90623],
  [CHURN_REASONS[1], 64341, 64731],
  [CHURN_REASONS[2], 51525, 51785],
  [CHURN_REASONS[3], 38708, 38838],
  [CHURN_REASONS[4], 12897, 12946],
];

export const formatNumber = (value: number) => value.toLocaleString('ko-KR');
export const monthLabel = (month: string) => `${Number(month.slice(3))}월`;
export const fullMonthLabel = (month: string) =>
  `20${month.slice(0, 2)}년 ${Number(month.slice(3))}월`;
