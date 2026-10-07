/* version2 전체 현황 시안 데이터 (디자인 캔버스 OverviewV2 값 그대로) */

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

/** 월별 이탈 위험 고객 수 */
export const RISK_COUNTS = [
  24120, 25010, 25870, 26340, 27205, 28412, 30476, 31122, 33415, 34692, 36077,
  37402,
];

/** 월별 이탈 위험 비중 (%) */
export const RISK_RATIOS = [
  33.1, 33.9, 34.6, 35.0, 35.9, 36.8, 37.9, 38.5, 40.2, 41.5, 43.0, 44.2,
];

/** 고객군별 최신 월 위험 비중과 고객군 규모. slope 는 한 달 전으로 갈 때 줄어드는 %p */
export const CUSTOMER_GROUPS = [
  { name: '신규 발급 후 무실적', ratio: 69.4, size: 13115, slope: 1.1 },
  { name: '이용 감소 고객', ratio: 58.1, size: 20125, slope: 0.9 },
  { name: '고이용 고객 중 이용 급감', ratio: 39.0, size: 34070, slope: 0.6 },
  { name: '장기 미이용 이력', ratio: 35.6, size: 23990, slope: 0.7 },
  { name: '해지 이력 보유', ratio: 29.4, size: 9480, slope: 0.4 },
];

/** [고객군, 8월 위험 고객 수, 9월 위험 고객 수] */
export const GROUP_RISK_CHANGES: [string, number, number][] = [
  ['신규 발급 후 무실적', 7845, 9102],
  ['이용 감소 고객', 10376, 11693],
  ['장기 미이용 이력', 7623, 8540],
  ['고이용 고객 중 이용 급감', 12641, 13288],
  ['특정 업종 중심 이용 고객', 4952, 5437],
];

export const formatNumber = (value: number) => value.toLocaleString('ko-KR');
export const monthLabel = (month: string) => `${Number(month.slice(3))}월`;
export const fullMonthLabel = (month: string) =>
  `20${month.slice(0, 2)}년 ${Number(month.slice(3))}월`;
