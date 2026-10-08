export type RiskLevel = 'low' | 'medium' | 'high';

export type IbkCreditCardInfo = {
  name: string;
  benefitCategories: string[]; // IBK 맞춤카드찾기 '카드혜택' 필터 카테고리
  summary: string;
  brands: string[]; // IBK 맞춤카드찾기 '브랜드' 필터 브랜드
};
