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

/** 고객군별 최신 월 위험 비중과 고객군 규모. slope 는 한 달 전으로 갈 때 줄어드는 %p */
export const CUSTOMER_GROUPS = [
  { name: '신규 발급 후 무실적', ratio: 35.9, size: 201480, slope: 0.57 },
  { name: '이용 감소 고객', ratio: 30.0, size: 309180, slope: 0.47 },
  { name: '고이용 고객 중 이용 급감', ratio: 20.2, size: 523410, slope: 0.31 },
  { name: '장기 미이용 이력', ratio: 18.4, size: 368550, slope: 0.36 },
  { name: '해지 이력 보유', ratio: 15.2, size: 145640, slope: 0.21 },
];

/** [고객군, 8월 위험 고객 수, 9월 위험 고객 수] */
export const GROUP_RISK_CHANGES: [string, number, number][] = [
  ['신규 발급 후 무실적', 62342, 72331],
  ['이용 감소 고객', 82307, 92754],
  ['장기 미이용 이력', 60531, 67813],
  ['고이용 고객 중 이용 급감', 100581, 105729],
  ['특정 업종 중심 이용 고객', 39342, 43195],
];

export const formatNumber = (value: number) => value.toLocaleString('ko-KR');
export const monthLabel = (month: string) => `${Number(month.slice(3))}월`;
export const fullMonthLabel = (month: string) =>
  `20${month.slice(0, 2)}년 ${Number(month.slice(3))}월`;
