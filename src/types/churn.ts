export type RiskLevel = 'low' | 'medium' | 'high';

export type ChurnReason = {
  label: string;
  score: number;
};

export type MonthlyPoint = {
  month: string; // "26.08"
  usage: number; // 만원 단위
};

export type RiskScoreTrendPoint = {
  month: string; // "26.08"
  score: number;
};

export type CreditScoreHistoryPoint = {
  month: string; // "26.08"
  score: number; // 신용점수, 0~1000 스케일
};

export type Transaction = {
  date: string; // "2026-08-03"
  merchant: string;
  category: string;
  amount: number; // 원 단위
  status: '승인' | '취소';
};

export type Customer = {
  id: string;
  name: string;
  phoneNumber: string;
  cardProduct: string;
  productName: string; // 개인 신용카드 상품명 (ibkCreditCards 중 하나)
  joinedAt: string;
  gender: '남' | '여';
  age: number;
  predictionScore: number;
  riskLevel: RiskLevel;
  primaryReason: string;
  churnReasons: ChurnReason[];
  monthly: MonthlyPoint[];
  riskScoreTrend: RiskScoreTrendPoint[];
  creditScoreHistory: CreditScoreHistoryPoint[];
  transactions: Transaction[];
};

export type MonthlyMemberActivityPoint = {
  month: string; // "26.08"
  activeMembers: number; // 카드 이용 중인 회원 수
  newSignups: number; // 신규 가입 회원 수
  predicted?: boolean;
};

export type MonthlyRiskDistributionPoint = {
  month: string; // "26.08"
  high: number; // 위험 비율(%)
  mid: number; // 중위험 비율(%)
  low: number; // 저위험 비율(%)
};

export type IbkCreditCardInfo = {
  name: string;
  benefitCategories: string[]; // IBK 맞춤카드찾기 '카드혜택' 필터 카테고리
  brands: string[]; // IBK 맞춤카드찾기 '브랜드' 필터 브랜드
};

export type ProductUsageStat = {
  productName: string;
  issuedCount: number; // 발급 회원 수
  activeCount: number; // 이용 회원 수 (발급 - 해지)
  canceledCount: number; // 해지 회원 수
  churnRate: number; // 이탈률(%)
  highRiskCount: number; // 이용 회원 중 고위험 회원 수
  mediumRiskCount: number; // 이용 회원 중 중위험 회원 수
  lowRiskCount: number; // 이용 회원 중 저위험 회원 수
};

export type ChurnRateBreakdown = {
  label: string;
  issuedCount: number;
  canceledCount: number;
  churnRate: number; // 이탈률(%)
};
