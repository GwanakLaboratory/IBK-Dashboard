export type RiskLevel = 'low' | 'medium' | 'high';

export type ChurnReason = {
  label: string;
  score: number;
};

export type MonthlyPoint = {
  month: string; // "24.01"
  usage: number; // 만원 단위
  riskScore: number;
  predicted?: boolean;
};

export type Transaction = {
  date: string; // "2024-11-03"
  merchant: string;
  category: string;
  amount: number; // 원 단위
  status: '승인' | '취소';
};

export type QuarterUsage = {
  quarter: string; // "Q1 2024"
  usage: number; // 만원
  riskScore: number;
  predicted?: boolean;
};

export type Customer = {
  id: string;
  predictionScore: number;
  riskLevel: RiskLevel;
  primaryReason: string;
  churnReasons: ChurnReason[];
  monthly: MonthlyPoint[];
  quarterly: QuarterUsage[];
  transactions: Transaction[];
};

export type QuarterlyOverallPoint = {
  quarter: string;
  totalUsage: number;
  high: number;
  mid: number;
  low: number;
  predicted?: boolean;
};
