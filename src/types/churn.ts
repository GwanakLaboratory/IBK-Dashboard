import type ko from '@/i18n/locales/ko.json';

type KoDomain = (typeof ko)['domain'];

export type RiskLevel = 'low' | 'medium' | 'high';

/** 이탈 사유 코드. 화면 표시는 domain.churnReason.<코드> */
export type ChurnReason = keyof KoDomain['churnReason'];
export type Gender = keyof KoDomain['gender'];
export type AgeGroup = keyof KoDomain['ageGroup'];
/** 접촉 · 발송 채널 코드. 화면 표시는 domain.channel.<코드>.label / short */
export type ContactChannel = keyof KoDomain['channel'];
/** 관악연구소 맞춤카드찾기 '카드혜택' 필터 카테고리 코드 */
export type BenefitCategory = keyof KoDomain['benefitCategory'];
export type CardBrand = keyof KoDomain['brand'];
/** 카드 상품 id. 이름 · 요약은 domain.card.<id>.name / summary */
export type CardId = keyof KoDomain['card'];
export type MemberName = {
  surname: keyof KoDomain['memberName']['surname'];
  given: keyof KoDomain['memberName']['given'];
};

export type IbkCreditCardInfo = {
  id: CardId;
  benefitCategories: BenefitCategory[]; // 맞춤카드찾기 '카드혜택' 필터 카테고리
  brands: CardBrand[]; // 맞춤카드찾기 '브랜드' 필터 브랜드
};
