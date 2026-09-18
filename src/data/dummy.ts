import { ibkCreditCardInfos } from '@/data/ibkCreditCardInfo';
import type {
  ChurnRateBreakdown,
  CreditScoreHistoryPoint,
  Customer,
  IbkCreditCardInfo,
  MonthlyMemberActivityPoint,
  MonthlyPoint,
  MonthlyRiskDistributionPoint,
  ProductUsageStat,
  RiskLevel,
  RiskScoreTrendPoint,
  Transaction,
} from '@/types/churn';

/* ── 개인 신용카드 상품 목록 (법인카드 제외) ─────────────────────── */
export { ibkCreditCardInfos };

export const ibkCreditCards = ibkCreditCardInfos.map(
  (cardInfo) => cardInfo.name,
);

export const ibkCreditCardInfoByName: Record<string, IbkCreditCardInfo> =
  Object.fromEntries(
    ibkCreditCardInfos.map((cardInfo) => [cardInfo.name, cardInfo]),
  );

/* ── 홈 대시보드 집계 데이터 ─────────────────────────────────── */
export const monthlyTotalUsage: MonthlyPoint[] = [
  { month: '25.09', usage: 3783000 },
  { month: '25.10', usage: 3711500 },
  { month: '25.11', usage: 3627000 },
  { month: '25.12', usage: 3698500 },
  { month: '26.01', usage: 3523000 },
  { month: '26.02', usage: 3451500 },
  { month: '26.03', usage: 3367000 },
  { month: '26.04', usage: 3230500 },
  { month: '26.05', usage: 3133000 },
  { month: '26.06', usage: 3022500 },
  { month: '26.07', usage: 2912000 },
  { month: '26.08', usage: 2808000 },
];

export const monthlyRiskDistribution: MonthlyRiskDistributionPoint[] = [
  { month: '25.09', high: 26, mid: 24, low: 50 },
  { month: '25.10', high: 27, mid: 23, low: 50 },
  { month: '25.11', high: 29, mid: 22, low: 49 },
  { month: '25.12', high: 31, mid: 23, low: 46 },
  { month: '26.01', high: 33, mid: 24, low: 43 },
  { month: '26.02', high: 35, mid: 23, low: 42 },
  { month: '26.03', high: 36, mid: 23, low: 41 },
  { month: '26.04', high: 38, mid: 22, low: 40 },
  { month: '26.05', high: 39, mid: 22, low: 39 },
  { month: '26.06', high: 41, mid: 21, low: 38 },
  { month: '26.07', high: 42, mid: 21, low: 37 },
  { month: '26.08', high: 43, mid: 21, low: 36 },
];

export const monthlyMemberActivity: MonthlyMemberActivityPoint[] = [
  { month: '25.09', activeMembers: 75200, newSignups: 640 },
  { month: '25.10', activeMembers: 76100, newSignups: 760 },
  { month: '25.11', activeMembers: 75800, newSignups: 700 },
  { month: '25.12', activeMembers: 77300, newSignups: 690 },
  { month: '26.01', activeMembers: 78100, newSignups: 730 },
  { month: '26.02', activeMembers: 77600, newSignups: 610 },
  { month: '26.03', activeMembers: 79400, newSignups: 700 },
  { month: '26.04', activeMembers: 80200, newSignups: 820 },
  { month: '26.05', activeMembers: 79800, newSignups: 580 },
  { month: '26.06', activeMembers: 81500, newSignups: 760 },
  { month: '26.07', activeMembers: 82600, newSignups: 810 },
  {
    month: '26.08',
    activeMembers: 83900,
    newSignups: 870,
    predicted: true,
  },
];

/* ── helpers ─────────────────────────────────────────────────── */
function mkMonthly(
  baseUsage: number,
  trend: 'declining' | 'stable' | 'growing',
): MonthlyPoint[] {
  const months = [
    '25.09',
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
  ];
  return months.map((m, i) => {
    const usageMult =
      trend === 'declining'
        ? 1 - i * 0.05
        : trend === 'growing'
          ? 1 + i * 0.03
          : 1 + (Math.random() - 0.5) * 0.06;
    return {
      month: m,
      usage: Math.round(baseUsage * usageMult * (0.92 + Math.random() * 0.16)),
    };
  });
}

const HIGH_TXN: Transaction[] = [
  {
    date: '2024-10-28',
    merchant: '스타벅스 강남점',
    category: '카페',
    amount: 8500,
    status: '승인',
  },
  {
    date: '2024-10-22',
    merchant: 'GS25 역삼점',
    category: '편의점',
    amount: 4200,
    status: '승인',
  },
  {
    date: '2024-10-15',
    merchant: '이마트 트레이더스',
    category: '대형마트',
    amount: 128000,
    status: '승인',
  },
  {
    date: '2024-10-08',
    merchant: 'CGV 강남',
    category: '여가',
    amount: 25000,
    status: '승인',
  },
  {
    date: '2024-09-30',
    merchant: '우리카드 리볼빙 수수료',
    category: '금융',
    amount: 18600,
    status: '승인',
  },
  {
    date: '2024-09-18',
    merchant: '배달의민족',
    category: '음식배달',
    amount: 32000,
    status: '취소',
  },
];

const MID_TXN: Transaction[] = [
  {
    date: '2024-10-29',
    merchant: '쿠팡',
    category: '온라인쇼핑',
    amount: 67400,
    status: '승인',
  },
  {
    date: '2024-10-21',
    merchant: '주유소 SK에너지',
    category: '주유',
    amount: 85000,
    status: '승인',
  },
  {
    date: '2024-10-14',
    merchant: '맥도날드 신논현점',
    category: '외식',
    amount: 12700,
    status: '승인',
  },
  {
    date: '2024-10-05',
    merchant: '롯데시네마 홍대점',
    category: '여가',
    amount: 22000,
    status: '승인',
  },
  {
    date: '2024-09-27',
    merchant: '올리브영 신촌점',
    category: '뷰티',
    amount: 43800,
    status: '승인',
  },
  {
    date: '2024-09-14',
    merchant: '이디야커피',
    category: '카페',
    amount: 5400,
    status: '승인',
  },
];

const LOW_TXN: Transaction[] = [
  {
    date: '2024-10-30',
    merchant: '이마트 성수점',
    category: '대형마트',
    amount: 215000,
    status: '승인',
  },
  {
    date: '2024-10-24',
    merchant: '네이버페이 정기결제',
    category: '구독',
    amount: 9900,
    status: '승인',
  },
  {
    date: '2024-10-17',
    merchant: '현대백화점 무역센터점',
    category: '백화점',
    amount: 384000,
    status: '승인',
  },
  {
    date: '2024-10-09',
    merchant: '테슬라코리아',
    category: '자동차',
    amount: 1240000,
    status: '승인',
  },
  {
    date: '2024-09-29',
    merchant: '신세계면세점',
    category: '면세점',
    amount: 520000,
    status: '승인',
  },
  {
    date: '2024-09-20',
    merchant: '교보문고 광화문점',
    category: '도서',
    amount: 34500,
    status: '승인',
  },
];

/* ── 30명 더미 데이터 ────────────────────────────────────────── */
const RAW_CUSTOMERS: Omit<
  Customer,
  | 'name'
  | 'phoneNumber'
  | 'cardProduct'
  | 'productName'
  | 'joinedAt'
  | 'gender'
  | 'age'
  | 'riskScoreTrend'
  | 'creditScoreHistory'
>[] = [
  {
    id: 'CUS-10000',
    predictionScore: 81,
    riskLevel: 'high',
    primaryReason: '타사 카드 신규 발급 이력',
    churnReasons: [
      { label: '타사 카드 신규 발급 이력', score: 91 },
      { label: '휴면 전환 임박', score: 34 },
      { label: '연회비 대비 혜택 미사용', score: 27 },
      { label: '리볼빙 이용 증가', score: 21 },
      { label: '포인트 소멸 임박', score: 16 },
      { label: '고객센터 불만 접수', score: 12 },
      { label: '연체 이력 발생', score: 9 },
      { label: '최근 3개월 이용금액 급감', score: 6 },
      { label: '부가서비스 미이용', score: 4 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(320, 'declining'),
    transactions: HIGH_TXN,
  },
  {
    id: 'CUS-10001',
    predictionScore: 94,
    riskLevel: 'high',
    primaryReason: '타사 카드 신규 발급 이력',
    churnReasons: [
      { label: '타사 카드 신규 발급 이력', score: 97 },
      { label: '연회비 대비 혜택 미사용', score: 89 },
      { label: '최근 3개월 이용금액 급감', score: 24 },
      { label: '포인트 소멸 임박', score: 17 },
      { label: '리볼빙 이용 증가', score: 13 },
      { label: '부가서비스 미이용', score: 10 },
      { label: '연체 이력 발생', score: 7 },
      { label: '고객센터 불만 접수', score: 5 },
      { label: '휴면 전환 임박', score: 3 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(280, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.7),
    })),
  },
  {
    id: 'CUS-10002',
    predictionScore: 77,
    riskLevel: 'high',
    primaryReason: '리볼빙 이용 증가',
    churnReasons: [
      { label: '리볼빙 이용 증가', score: 82 },
      { label: '연체 이력 발생', score: 74 },
      { label: '최근 3개월 이용금액 급감', score: 66 },
      { label: '고객센터 불만 접수', score: 22 },
      { label: '타사 카드 신규 발급 이력', score: 16 },
      { label: '휴면 전환 임박', score: 11 },
      { label: '포인트 소멸 임박', score: 8 },
      { label: '부가서비스 미이용', score: 5 },
      { label: '연회비 대비 혜택 미사용', score: 3 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(190, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.5),
    })),
  },
  {
    id: 'CUS-10003',
    predictionScore: 75,
    riskLevel: 'high',
    primaryReason: '타사 카드 신규 발급 이력',
    churnReasons: [
      { label: '타사 카드 신규 발급 이력', score: 79 },
      { label: '포인트 소멸 임박', score: 71 },
      { label: '연회비 대비 혜택 미사용', score: 64 },
      { label: '리볼빙 이용 증가', score: 57 },
      { label: '최근 3개월 이용금액 급감', score: 19 },
      { label: '휴면 전환 임박', score: 13 },
      { label: '고객센터 불만 접수', score: 9 },
      { label: '연체 이력 발생', score: 6 },
      { label: '부가서비스 미이용', score: 4 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(240, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      date: t.date.replace('10', '09'),
    })),
  },
  {
    id: 'CUS-10004',
    predictionScore: 97,
    riskLevel: 'high',
    primaryReason: '휴면 전환 임박',
    churnReasons: [
      { label: '휴면 전환 임박', score: 96 },
      { label: '최근 3개월 이용금액 급감', score: 88 },
      { label: '타사 카드 신규 발급 이력', score: 79 },
      { label: '연회비 대비 혜택 미사용', score: 69 },
      { label: '부가서비스 미이용', score: 58 },
      { label: '고객센터 불만 접수', score: 46 },
      { label: '포인트 소멸 임박', score: 34 },
      { label: '리볼빙 이용 증가', score: 23 },
      { label: '연체 이력 발생', score: 14 },
      { label: '실적 조건 미충족', score: 7 },
    ],
    monthly: mkMonthly(90, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.3),
    })),
  },
  {
    id: 'CUS-10005',
    predictionScore: 93,
    riskLevel: 'high',
    primaryReason: '휴면 전환 임박',
    churnReasons: [
      { label: '휴면 전환 임박', score: 95 },
      { label: '연회비 대비 혜택 미사용', score: 31 },
      { label: '타사 카드 신규 발급 이력', score: 24 },
      { label: '최근 3개월 이용금액 급감', score: 18 },
      { label: '리볼빙 이용 증가', score: 14 },
      { label: '포인트 소멸 임박', score: 10 },
      { label: '고객센터 불만 접수', score: 7 },
      { label: '부가서비스 미이용', score: 5 },
      { label: '연체 이력 발생', score: 3 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(150, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.45),
    })),
  },
  {
    id: 'CUS-10006',
    predictionScore: 85,
    riskLevel: 'high',
    primaryReason: '연회비 대비 혜택 미사용',
    churnReasons: [
      { label: '연회비 대비 혜택 미사용', score: 90 },
      { label: '타사 카드 신규 발급 이력', score: 83 },
      { label: '포인트 소멸 임박', score: 26 },
      { label: '리볼빙 이용 증가', score: 19 },
      { label: '휴면 전환 임박', score: 14 },
      { label: '최근 3개월 이용금액 급감', score: 10 },
      { label: '고객센터 불만 접수', score: 7 },
      { label: '부가서비스 미이용', score: 5 },
      { label: '연체 이력 발생', score: 3 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(210, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.6),
    })),
  },
  {
    id: 'CUS-10007',
    predictionScore: 79,
    riskLevel: 'high',
    primaryReason: '최근 3개월 이용금액 급감',
    churnReasons: [
      { label: '최근 3개월 이용금액 급감', score: 85 },
      { label: '휴면 전환 임박', score: 77 },
      { label: '리볼빙 이용 증가', score: 69 },
      { label: '연회비 대비 혜택 미사용', score: 20 },
      { label: '타사 카드 신규 발급 이력', score: 15 },
      { label: '포인트 소멸 임박', score: 10 },
      { label: '고객센터 불만 접수', score: 7 },
      { label: '연체 이력 발생', score: 5 },
      { label: '부가서비스 미이용', score: 3 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(170, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.55),
    })),
  },
  {
    id: 'CUS-10008',
    predictionScore: 83,
    riskLevel: 'high',
    primaryReason: '고객센터 불만 접수',
    churnReasons: [
      { label: '고객센터 불만 접수', score: 87 },
      { label: '연체 이력 발생', score: 79 },
      { label: '타사 카드 신규 발급 이력', score: 71 },
      { label: '리볼빙 이용 증가', score: 63 },
      { label: '연회비 대비 혜택 미사용', score: 21 },
      { label: '최근 3개월 이용금액 급감', score: 14 },
      { label: '포인트 소멸 임박', score: 10 },
      { label: '휴면 전환 임박', score: 6 },
      { label: '부가서비스 미이용', score: 4 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(260, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.65),
    })),
  },
  {
    id: 'CUS-10009',
    predictionScore: 76,
    riskLevel: 'high',
    primaryReason: '포인트 소멸 임박',
    churnReasons: [
      { label: '포인트 소멸 임박', score: 80 },
      { label: '연회비 대비 혜택 미사용', score: 72 },
      { label: '타사 카드 신규 발급 이력', score: 63 },
      { label: '최근 3개월 이용금액 급감', score: 53 },
      { label: '고객센터 불만 접수', score: 43 },
      { label: '리볼빙 이용 증가', score: 33 },
      { label: '휴면 전환 임박', score: 23 },
      { label: '연체 이력 발생', score: 15 },
      { label: '부가서비스 미이용', score: 9 },
      { label: '실적 조건 미충족', score: 4 },
    ],
    monthly: mkMonthly(300, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.8),
    })),
  },
  {
    id: 'CUS-10010',
    predictionScore: 88,
    riskLevel: 'high',
    primaryReason: '연체 이력 발생',
    churnReasons: [
      { label: '연체 이력 발생', score: 92 },
      { label: '리볼빙 이용 증가', score: 29 },
      { label: '고객센터 불만 접수', score: 22 },
      { label: '타사 카드 신규 발급 이력', score: 17 },
      { label: '최근 3개월 이용금액 급감', score: 13 },
      { label: '연회비 대비 혜택 미사용', score: 9 },
      { label: '휴면 전환 임박', score: 6 },
      { label: '포인트 소멸 임박', score: 4 },
      { label: '부가서비스 미이용', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(140, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.4),
    })),
  },
  {
    id: 'CUS-10011',
    predictionScore: 78,
    riskLevel: 'high',
    primaryReason: '부가서비스 미이용',
    churnReasons: [
      { label: '부가서비스 미이용', score: 84 },
      { label: '연회비 대비 혜택 미사용', score: 76 },
      { label: '포인트 소멸 임박', score: 23 },
      { label: '타사 카드 신규 발급 이력', score: 17 },
      { label: '최근 3개월 이용금액 급감', score: 12 },
      { label: '리볼빙 이용 증가', score: 9 },
      { label: '고객센터 불만 접수', score: 6 },
      { label: '연체 이력 발생', score: 4 },
      { label: '휴면 전환 임박', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(220, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.58),
    })),
  },
  {
    id: 'CUS-10012',
    predictionScore: 91,
    riskLevel: 'high',
    primaryReason: '타사 카드 신규 발급 이력',
    churnReasons: [
      { label: '타사 카드 신규 발급 이력', score: 94 },
      { label: '휴면 전환 임박', score: 85 },
      { label: '연회비 대비 혜택 미사용', score: 77 },
      { label: '최근 3개월 이용금액 급감', score: 25 },
      { label: '리볼빙 이용 증가', score: 17 },
      { label: '포인트 소멸 임박', score: 12 },
      { label: '부가서비스 미이용', score: 8 },
      { label: '고객센터 불만 접수', score: 5 },
      { label: '연체 이력 발생', score: 3 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(110, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.35),
    })),
  },
  {
    id: 'CUS-10013',
    predictionScore: 55,
    riskLevel: 'medium',
    primaryReason: '포인트 소멸 임박',
    churnReasons: [
      { label: '포인트 소멸 임박', score: 78 },
      { label: '연회비 대비 혜택 미사용', score: 20 },
      { label: '최근 3개월 이용금액 급감', score: 15 },
      { label: '리볼빙 이용 증가', score: 11 },
      { label: '부가서비스 미이용', score: 8 },
      { label: '타사 카드 신규 발급 이력', score: 6 },
      { label: '고객센터 불만 접수', score: 4 },
      { label: '연체 이력 발생', score: 3 },
      { label: '휴면 전환 임박', score: 2 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(380, 'stable'),
    transactions: MID_TXN,
  },
  {
    id: 'CUS-10014',
    predictionScore: 62,
    riskLevel: 'medium',
    primaryReason: '연회비 대비 혜택 미사용',
    churnReasons: [
      { label: '연회비 대비 혜택 미사용', score: 74 },
      { label: '포인트 소멸 임박', score: 66 },
      { label: '최근 3개월 이용금액 급감', score: 57 },
      { label: '타사 카드 신규 발급 이력', score: 48 },
      { label: '리볼빙 이용 증가', score: 39 },
      { label: '부가서비스 미이용', score: 30 },
      { label: '고객센터 불만 접수', score: 21 },
      { label: '연체 이력 발생', score: 13 },
      { label: '휴면 전환 임박', score: 7 },
      { label: '실적 조건 미충족', score: 3 },
    ],
    monthly: mkMonthly(420, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.1),
    })),
  },
  {
    id: 'CUS-10015',
    predictionScore: 58,
    riskLevel: 'medium',
    primaryReason: '리볼빙 이용 증가',
    churnReasons: [
      { label: '리볼빙 이용 증가', score: 70 },
      { label: '연체 이력 발생', score: 63 },
      { label: '연회비 대비 혜택 미사용', score: 18 },
      { label: '포인트 소멸 임박', score: 13 },
      { label: '최근 3개월 이용금액 급감', score: 9 },
      { label: '타사 카드 신규 발급 이력', score: 6 },
      { label: '고객센터 불만 접수', score: 4 },
      { label: '부가서비스 미이용', score: 3 },
      { label: '휴면 전환 임박', score: 2 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(290, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.9),
    })),
  },
  {
    id: 'CUS-10016',
    predictionScore: 67,
    riskLevel: 'medium',
    primaryReason: '최근 3개월 이용금액 급감',
    churnReasons: [
      { label: '최근 3개월 이용금액 급감', score: 76 },
      { label: '연회비 대비 혜택 미사용', score: 68 },
      { label: '포인트 소멸 임박', score: 60 },
      { label: '리볼빙 이용 증가', score: 19 },
      { label: '부가서비스 미이용', score: 13 },
      { label: '타사 카드 신규 발급 이력', score: 9 },
      { label: '고객센터 불만 접수', score: 6 },
      { label: '연체 이력 발생', score: 4 },
      { label: '휴면 전환 임박', score: 2 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(340, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.05),
    })),
  },
  {
    id: 'CUS-10017',
    predictionScore: 51,
    riskLevel: 'medium',
    primaryReason: '부가서비스 미이용',
    churnReasons: [
      { label: '부가서비스 미이용', score: 72 },
      { label: '연회비 대비 혜택 미사용', score: 16 },
      { label: '포인트 소멸 임박', score: 11 },
      { label: '최근 3개월 이용금액 급감', score: 8 },
      { label: '리볼빙 이용 증가', score: 6 },
      { label: '타사 카드 신규 발급 이력', score: 4 },
      { label: '연체 이력 발생', score: 3 },
      { label: '고객센터 불만 접수', score: 2 },
      { label: '휴면 전환 임박', score: 1 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(460, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.15),
    })),
  },
  {
    id: 'CUS-10018',
    predictionScore: 60,
    riskLevel: 'medium',
    primaryReason: '고객센터 불만 접수',
    churnReasons: [
      { label: '고객센터 불만 접수', score: 73 },
      { label: '연체 이력 발생', score: 65 },
      { label: '리볼빙 이용 증가', score: 57 },
      { label: '연회비 대비 혜택 미사용', score: 49 },
      { label: '최근 3개월 이용금액 급감', score: 16 },
      { label: '포인트 소멸 임박', score: 10 },
      { label: '타사 카드 신규 발급 이력', score: 7 },
      { label: '부가서비스 미이용', score: 4 },
      { label: '휴면 전환 임박', score: 2 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(310, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.95),
    })),
  },
  {
    id: 'CUS-10019',
    predictionScore: 25,
    riskLevel: 'low',
    primaryReason: '실적 조건 미충족',
    churnReasons: [
      { label: '실적 조건 미충족', score: 38 },
      { label: '부가서비스 미이용', score: 30 },
      { label: '포인트 소멸 임박', score: 24 },
      { label: '연회비 대비 혜택 미사용', score: 19 },
      { label: '최근 3개월 이용금액 급감', score: 15 },
      { label: '리볼빙 이용 증가', score: 11 },
      { label: '고객센터 불만 접수', score: 8 },
      { label: '연체 이력 발생', score: 6 },
      { label: '타사 카드 신규 발급 이력', score: 4 },
      { label: '휴면 전환 임박', score: 2 },
    ],
    monthly: mkMonthly(680, 'growing'),
    transactions: LOW_TXN,
  },
  {
    id: 'CUS-10020',
    predictionScore: 18,
    riskLevel: 'low',
    primaryReason: '실적 조건 미충족',
    churnReasons: [
      { label: '실적 조건 미충족', score: 33 },
      { label: '포인트 소멸 임박', score: 9 },
      { label: '부가서비스 미이용', score: 7 },
      { label: '연회비 대비 혜택 미사용', score: 5 },
      { label: '최근 3개월 이용금액 급감', score: 4 },
      { label: '리볼빙 이용 증가', score: 3 },
      { label: '고객센터 불만 접수', score: 2 },
      { label: '연체 이력 발생', score: 2 },
      { label: '타사 카드 신규 발급 이력', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(920, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.3),
    })),
  },
  {
    id: 'CUS-10021',
    predictionScore: 32,
    riskLevel: 'low',
    primaryReason: '포인트 소멸 임박',
    churnReasons: [
      { label: '포인트 소멸 임박', score: 47 },
      { label: '부가서비스 미이용', score: 40 },
      { label: '연회비 대비 혜택 미사용', score: 33 },
      { label: '실적 조건 미충족', score: 12 },
      { label: '최근 3개월 이용금액 급감', score: 8 },
      { label: '리볼빙 이용 증가', score: 6 },
      { label: '고객센터 불만 접수', score: 4 },
      { label: '연체 이력 발생', score: 3 },
      { label: '타사 카드 신규 발급 이력', score: 2 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(560, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.9),
    })),
  },
  {
    id: 'CUS-10022',
    predictionScore: 22,
    riskLevel: 'low',
    primaryReason: '부가서비스 미이용',
    churnReasons: [
      { label: '부가서비스 미이용', score: 34 },
      { label: '포인트 소멸 임박', score: 27 },
      { label: '연회비 대비 혜택 미사용', score: 21 },
      { label: '실적 조건 미충족', score: 16 },
      { label: '최근 3개월 이용금액 급감', score: 12 },
      { label: '리볼빙 이용 증가', score: 9 },
      { label: '고객센터 불만 접수', score: 6 },
      { label: '연체 이력 발생', score: 4 },
      { label: '타사 카드 신규 발급 이력', score: 3 },
      { label: '휴면 전환 임박', score: 2 },
    ],
    monthly: mkMonthly(780, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.1),
    })),
  },
  {
    id: 'CUS-10023',
    predictionScore: 29,
    riskLevel: 'low',
    primaryReason: '연회비 대비 혜택 미사용',
    churnReasons: [
      { label: '연회비 대비 혜택 미사용', score: 42 },
      { label: '포인트 소멸 임박', score: 36 },
      { label: '부가서비스 미이용', score: 13 },
      { label: '실적 조건 미충족', score: 9 },
      { label: '최근 3개월 이용금액 급감', score: 6 },
      { label: '리볼빙 이용 증가', score: 4 },
      { label: '고객센터 불만 접수', score: 3 },
      { label: '연체 이력 발생', score: 2 },
      { label: '타사 카드 신규 발급 이력', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(640, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.95),
    })),
  },
  {
    id: 'CUS-10024',
    predictionScore: 15,
    riskLevel: 'low',
    primaryReason: '실적 조건 미충족',
    churnReasons: [
      { label: '실적 조건 미충족', score: 27 },
      { label: '포인트 소멸 임박', score: 7 },
      { label: '부가서비스 미이용', score: 5 },
      { label: '연회비 대비 혜택 미사용', score: 4 },
      { label: '최근 3개월 이용금액 급감', score: 3 },
      { label: '리볼빙 이용 증가', score: 2 },
      { label: '고객센터 불만 접수', score: 2 },
      { label: '연체 이력 발생', score: 1 },
      { label: '타사 카드 신규 발급 이력', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(1100, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.5),
    })),
  },
  {
    id: 'CUS-10025',
    predictionScore: 37,
    riskLevel: 'low',
    primaryReason: '최근 3개월 이용금액 급감',
    churnReasons: [
      { label: '최근 3개월 이용금액 급감', score: 55 },
      { label: '포인트 소멸 임박', score: 47 },
      { label: '연회비 대비 혜택 미사용', score: 38 },
      { label: '부가서비스 미이용', score: 30 },
      { label: '실적 조건 미충족', score: 22 },
      { label: '리볼빙 이용 증가', score: 15 },
      { label: '고객센터 불만 접수', score: 10 },
      { label: '연체 이력 발생', score: 6 },
      { label: '타사 카드 신규 발급 이력', score: 3 },
      { label: '휴면 전환 임박', score: 2 },
    ],
    monthly: mkMonthly(510, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.85),
    })),
  },
  {
    id: 'CUS-10026',
    predictionScore: 20,
    riskLevel: 'low',
    primaryReason: '실적 조건 미충족',
    churnReasons: [
      { label: '실적 조건 미충족', score: 32 },
      { label: '부가서비스 미이용', score: 25 },
      { label: '포인트 소멸 임박', score: 19 },
      { label: '연회비 대비 혜택 미사용', score: 15 },
      { label: '최근 3개월 이용금액 급감', score: 11 },
      { label: '리볼빙 이용 증가', score: 8 },
      { label: '고객센터 불만 접수', score: 6 },
      { label: '연체 이력 발생', score: 4 },
      { label: '타사 카드 신규 발급 이력', score: 3 },
      { label: '휴면 전환 임박', score: 2 },
    ],
    monthly: mkMonthly(840, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.2),
    })),
  },
  {
    id: 'CUS-10027',
    predictionScore: 27,
    riskLevel: 'low',
    primaryReason: '포인트 소멸 임박',
    churnReasons: [
      { label: '포인트 소멸 임박', score: 43 },
      { label: '부가서비스 미이용', score: 36 },
      { label: '연회비 대비 혜택 미사용', score: 29 },
      { label: '실적 조건 미충족', score: 11 },
      { label: '최근 3개월 이용금액 급감', score: 7 },
      { label: '리볼빙 이용 증가', score: 5 },
      { label: '고객센터 불만 접수', score: 3 },
      { label: '연체 이력 발생', score: 2 },
      { label: '타사 카드 신규 발급 이력', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(720, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.05),
    })),
  },
  {
    id: 'CUS-10028',
    predictionScore: 33,
    riskLevel: 'low',
    primaryReason: '연회비 대비 혜택 미사용',
    churnReasons: [
      { label: '연회비 대비 혜택 미사용', score: 48 },
      { label: '포인트 소멸 임박', score: 41 },
      { label: '부가서비스 미이용', score: 15 },
      { label: '실적 조건 미충족', score: 10 },
      { label: '최근 3개월 이용금액 급감', score: 7 },
      { label: '리볼빙 이용 증가', score: 5 },
      { label: '고객센터 불만 접수', score: 3 },
      { label: '연체 이력 발생', score: 2 },
      { label: '타사 카드 신규 발급 이력', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(580, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.92),
    })),
  },
  {
    id: 'CUS-10029',
    predictionScore: 41,
    riskLevel: 'low',
    primaryReason: '최근 3개월 이용금액 급감',
    churnReasons: [
      { label: '최근 3개월 이용금액 급감', score: 60 },
      { label: '연회비 대비 혜택 미사용', score: 51 },
      { label: '포인트 소멸 임박', score: 42 },
      { label: '부가서비스 미이용', score: 33 },
      { label: '실적 조건 미충족', score: 24 },
      { label: '리볼빙 이용 증가', score: 16 },
      { label: '고객센터 불만 접수', score: 10 },
      { label: '연체 이력 발생', score: 6 },
      { label: '타사 카드 신규 발급 이력', score: 3 },
      { label: '휴면 전환 임박', score: 2 },
    ],
    monthly: mkMonthly(490, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.88),
    })),
  },
  {
    id: 'CUS-10030',
    predictionScore: 82,
    riskLevel: 'high',
    primaryReason: '연체 이력 발생',
    churnReasons: [
      { label: '연체 이력 발생', score: 88 },
      { label: '타사 카드 신규 발급 이력', score: 45 },
      { label: '리볼빙 이용 증가', score: 33 },
      { label: '고객센터 불만 접수', score: 24 },
      { label: '휴면 전환 임박', score: 18 },
      { label: '연회비 대비 혜택 미사용', score: 12 },
      { label: '포인트 소멸 임박', score: 9 },
      { label: '최근 3개월 이용금액 급감', score: 6 },
      { label: '부가서비스 미이용', score: 4 },
      { label: '실적 조건 미충족', score: 2 },
    ],
    monthly: mkMonthly(150, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.95),
    })),
  },
  {
    id: 'CUS-10031',
    predictionScore: 89,
    riskLevel: 'high',
    primaryReason: '타사 카드 신규 발급 이력',
    churnReasons: [
      { label: '타사 카드 신규 발급 이력', score: 92 },
      { label: '연체 이력 발생', score: 40 },
      { label: '고객센터 불만 접수', score: 29 },
      { label: '리볼빙 이용 증가', score: 22 },
      { label: '휴면 전환 임박', score: 16 },
      { label: '포인트 소멸 임박', score: 11 },
      { label: '연회비 대비 혜택 미사용', score: 8 },
      { label: '최근 3개월 이용금액 급감', score: 5 },
      { label: '부가서비스 미이용', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(110, 'declining'),
    transactions: HIGH_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.05),
    })),
  },
  {
    id: 'CUS-10032',
    predictionScore: 59,
    riskLevel: 'medium',
    primaryReason: '리볼빙 이용 증가',
    churnReasons: [
      { label: '리볼빙 이용 증가', score: 70 },
      { label: '포인트 소멸 임박', score: 55 },
      { label: '연회비 대비 혜택 미사용', score: 41 },
      { label: '최근 3개월 이용금액 급감', score: 30 },
      { label: '타사 카드 신규 발급 이력', score: 21 },
      { label: '부가서비스 미이용', score: 14 },
      { label: '고객센터 불만 접수', score: 9 },
      { label: '연체 이력 발생', score: 5 },
      { label: '휴면 전환 임박', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(350, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.9),
    })),
  },
  {
    id: 'CUS-10033',
    predictionScore: 64,
    riskLevel: 'medium',
    primaryReason: '연회비 대비 혜택 미사용',
    churnReasons: [
      { label: '연회비 대비 혜택 미사용', score: 76 },
      { label: '포인트 소멸 임박', score: 62 },
      { label: '최근 3개월 이용금액 급감', score: 48 },
      { label: '리볼빙 이용 증가', score: 35 },
      { label: '타사 카드 신규 발급 이력', score: 24 },
      { label: '부가서비스 미이용', score: 16 },
      { label: '고객센터 불만 접수', score: 10 },
      { label: '연체 이력 발생', score: 6 },
      { label: '휴면 전환 임박', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(400, 'stable'),
    transactions: MID_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.05),
    })),
  },
  {
    id: 'CUS-10034',
    predictionScore: 53,
    riskLevel: 'medium',
    primaryReason: '포인트 소멸 임박',
    churnReasons: [
      { label: '포인트 소멸 임박', score: 71 },
      { label: '연회비 대비 혜택 미사용', score: 58 },
      { label: '최근 3개월 이용금액 급감', score: 44 },
      { label: '부가서비스 미이용', score: 31 },
      { label: '타사 카드 신규 발급 이력', score: 20 },
      { label: '리볼빙 이용 증가', score: 13 },
      { label: '고객센터 불만 접수', score: 8 },
      { label: '연체 이력 발생', score: 5 },
      { label: '휴면 전환 임박', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(330, 'stable'),
    transactions: MID_TXN,
  },
  {
    id: 'CUS-10035',
    predictionScore: 24,
    riskLevel: 'low',
    primaryReason: '실적 조건 미충족',
    churnReasons: [
      { label: '실적 조건 미충족', score: 50 },
      { label: '부가서비스 미이용', score: 38 },
      { label: '포인트 소멸 임박', score: 27 },
      { label: '연회비 대비 혜택 미사용', score: 18 },
      { label: '최근 3개월 이용금액 급감', score: 11 },
      { label: '리볼빙 이용 증가', score: 7 },
      { label: '타사 카드 신규 발급 이력', score: 4 },
      { label: '고객센터 불만 접수', score: 2 },
      { label: '연체 이력 발생', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(700, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 1.02),
    })),
  },
  {
    id: 'CUS-10036',
    predictionScore: 19,
    riskLevel: 'low',
    primaryReason: '부가서비스 미이용',
    churnReasons: [
      { label: '부가서비스 미이용', score: 44 },
      { label: '실적 조건 미충족', score: 33 },
      { label: '포인트 소멸 임박', score: 24 },
      { label: '연회비 대비 혜택 미사용', score: 16 },
      { label: '최근 3개월 이용금액 급감', score: 10 },
      { label: '리볼빙 이용 증가', score: 6 },
      { label: '타사 카드 신규 발급 이력', score: 3 },
      { label: '고객센터 불만 접수', score: 2 },
      { label: '연체 이력 발생', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(650, 'growing'),
    transactions: LOW_TXN,
  },
  {
    id: 'CUS-10037',
    predictionScore: 35,
    riskLevel: 'low',
    primaryReason: '연회비 대비 혜택 미사용',
    churnReasons: [
      { label: '연회비 대비 혜택 미사용', score: 55 },
      { label: '포인트 소멸 임박', score: 46 },
      { label: '최근 3개월 이용금액 급감', score: 34 },
      { label: '부가서비스 미이용', score: 23 },
      { label: '실적 조건 미충족', score: 15 },
      { label: '리볼빙 이용 증가', score: 9 },
      { label: '타사 카드 신규 발급 이력', score: 5 },
      { label: '고객센터 불만 접수', score: 3 },
      { label: '연체 이력 발생', score: 1 },
      { label: '휴면 전환 임박', score: 1 },
    ],
    monthly: mkMonthly(830, 'growing'),
    transactions: LOW_TXN.map((t) => ({
      ...t,
      amount: Math.round(t.amount * 0.95),
    })),
  },
  {
    id: 'CUS-10038',
    predictionScore: 80,
    riskLevel: 'high',
    primaryReason: '고객센터 불만 접수',
    churnReasons: [
      { label: '고객센터 불만 접수', score: 85 },
      { label: '연체 이력 발생', score: 47 },
      { label: '타사 카드 신규 발급 이력', score: 35 },
      { label: '리볼빙 이용 증가', score: 26 },
      { label: '휴면 전환 임박', score: 19 },
      { label: '포인트 소멸 임박', score: 13 },
      { label: '연회비 대비 혜택 미사용', score: 9 },
      { label: '최근 3개월 이용금액 급감', score: 6 },
      { label: '부가서비스 미이용', score: 3 },
      { label: '실적 조건 미충족', score: 1 },
    ],
    monthly: mkMonthly(280, 'declining'),
    transactions: HIGH_TXN,
  },
];

const GENDERS: Customer['gender'][] = ['남', '여'];

const NAMES = [
  '김민준',
  '이서연',
  '박도윤',
  '최지우',
  '정하준',
  '강서윤',
  '조은우',
  '윤지호',
  '장하은',
  '임도현',
  '한소율',
  '오준서',
  '서지안',
  '신다은',
  '권민재',
  '황서준',
  '안수아',
  '송예준',
  '류지훈',
  '전서현',
  '홍시우',
  '문가은',
  '손우진',
  '배은서',
  '노준영',
  '남지원',
  '심하윤',
  '허준혁',
  '주다인',
  '구민서',
];

function buildJoinedAt(index: number) {
  const year = 2016 + (index % 8);
  const month = String(1 + ((index * 3) % 12)).padStart(2, '0');
  const day = String(1 + ((index * 5) % 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildPhoneNumber(index: number) {
  const middle = String(1000 + ((index * 37) % 9000));
  const last = String(1000 + ((index * 53) % 9000));
  return `010-${middle}-${last}`;
}

function mkRiskScoreTrend(
  currentScore: number,
  monthly: MonthlyPoint[],
): RiskScoreTrendPoint[] {
  const months = monthly.slice(-4).map((point) => point.month);
  const usageStart = monthly[0]?.usage ?? 0;
  const usageEnd = monthly[monthly.length - 1]?.usage ?? 0;
  const perStepDelta =
    usageEnd < usageStart * 0.97 ? 6 : usageEnd > usageStart * 1.03 ? -5 : 0;

  return months.map((month, index) => {
    const stepsFromNow = months.length - 1 - index;
    if (stepsFromNow === 0) {
      return { month, score: currentScore };
    }
    const noise = Math.round((Math.random() - 0.5) * 6);
    const score = Math.min(
      99,
      Math.max(5, currentScore - perStepDelta * stepsFromNow + noise),
    );
    return { month, score };
  });
}

const CREDIT_SCORE_BASE_BY_RISK: Record<RiskLevel, number> = {
  high: 740,
  medium: 780,
  low: 860,
};

const CREDIT_SCORE_TREND_BY_RISK: Record<RiskLevel, number> = {
  high: 14, // 최근으로 올수록 점수 하락 (위험도 상승 반영)
  medium: 6,
  low: -4, // 최근으로 올수록 점수 상승 (개선 추세)
};

const CREDIT_SCORE_HISTORY_MONTH_COUNT = 12;

function mkCreditScoreHistory(
  riskLevel: RiskLevel,
  monthly: MonthlyPoint[],
  seedIndex: number,
): CreditScoreHistoryPoint[] {
  const months = monthly
    .slice(-CREDIT_SCORE_HISTORY_MONTH_COUNT)
    .map((point) => point.month);
  const baseScore =
    CREDIT_SCORE_BASE_BY_RISK[riskLevel] + ((seedIndex * 17) % 40) - 20;
  const perStepDelta = CREDIT_SCORE_TREND_BY_RISK[riskLevel];

  return months.map((month, index) => {
    const stepsFromNow = months.length - 1 - index;
    const noise = Math.round((Math.random() - 0.5) * 12);
    const score = Math.min(
      1000,
      Math.max(300, baseScore + perStepDelta * stepsFromNow + noise),
    );
    return { month, score };
  });
}

export const customers: Customer[] = RAW_CUSTOMERS.map((customer, index) => {
  const age = 24 + ((index * 13) % 42);
  const gender = GENDERS[index % 2];

  return {
    ...customer,
    name: NAMES[index % NAMES.length],
    phoneNumber: buildPhoneNumber(index),
    cardProduct: ibkCreditCards[index % ibkCreditCards.length],
    productName: ibkCreditCards[index % ibkCreditCards.length],
    joinedAt: buildJoinedAt(index),
    gender,
    age,
    riskScoreTrend: mkRiskScoreTrend(
      customer.predictionScore,
      customer.monthly,
    ),
    creditScoreHistory: mkCreditScoreHistory(
      customer.riskLevel,
      customer.monthly,
      index,
    ),
  };
});

/* ── 카드 상품별 이용 현황 (Home 집계 데이터) ───────────────────── */
export const productUsageStats: ProductUsageStat[] = ibkCreditCards.map(
  (productName, index) => {
    const issuedCount =
      800 + ((index * 137) % 30) * 300 + Math.round(Math.random() * 4000);
    const targetChurnRate = 3 + ((index * 53) % 25) + (Math.random() - 0.5) * 4;
    const canceledCount = Math.round(
      issuedCount * (Math.max(1, targetChurnRate) / 100),
    );
    const churnRate = Math.round((canceledCount / issuedCount) * 1000) / 10;
    const activeCount = issuedCount - canceledCount;

    // 이용 회원 중 위험도 구성 (고/중/저) — 실제 예측 모델 대신, 상품별로
    // 그럴듯한 비중을 부여한 목데이터.
    const highRiskShare = 0.12 + ((index * 29) % 18) / 100;
    const mediumRiskShare = 0.2 + ((index * 11) % 15) / 100;
    const highRiskCount = Math.round(activeCount * highRiskShare);
    const mediumRiskCount = Math.round(activeCount * mediumRiskShare);
    const lowRiskCount = activeCount - highRiskCount - mediumRiskCount;

    return {
      productName,
      issuedCount,
      activeCount,
      canceledCount,
      churnRate,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    };
  },
);

/* ── 회원 세그먼트별 이탈률 (회원 분석 집계 데이터) ──────────────── */
function buildChurnRateBreakdown(
  label: string,
  issuedCount: number,
  churnRate: number,
): ChurnRateBreakdown {
  return {
    label,
    issuedCount,
    canceledCount: Math.round(issuedCount * (churnRate / 100)),
    churnRate,
  };
}

// "신규"는 최근 6개월(26.03~26.08) 내 가입한 회원 누적, "기존"은 그 이전 가입자.
const RECENT_6_MONTH_NEW_SIGNUPS = monthlyMemberActivity
  .slice(-6)
  .reduce((sum, point) => sum + point.newSignups, 0);
const LATEST_ACTIVE_MEMBERS =
  monthlyMemberActivity[monthlyMemberActivity.length - 1].activeMembers;

export const memberCohortChurnStats: ChurnRateBreakdown[] = [
  buildChurnRateBreakdown(
    '신규 회원 (6개월 이내)',
    RECENT_6_MONTH_NEW_SIGNUPS,
    16.5,
  ),
  buildChurnRateBreakdown(
    '기존 회원 (6개월 초과)',
    LATEST_ACTIVE_MEMBERS - RECENT_6_MONTH_NEW_SIGNUPS,
    7.2,
  ),
];

export const ageGroupChurnStats: ChurnRateBreakdown[] = [
  buildChurnRateBreakdown('20대', 14000, 15.8),
  buildChurnRateBreakdown('30대', 24500, 9.2),
  buildChurnRateBreakdown('40대', 22000, 7.5),
  buildChurnRateBreakdown('50대', 15500, 8.8),
  buildChurnRateBreakdown('60대 이상', 8000, 13.4),
];

export const genderChurnStats: ChurnRateBreakdown[] = [
  buildChurnRateBreakdown('남성', 43000, 9.8),
  buildChurnRateBreakdown('여성', 41000, 8.6),
];
