/* 카드 상품 목록 · 상세 화면 전용 목데이터. 카드 목록은 IBK 실제 상품 기준. */
import { MONTHS } from '@/data/overview';
import { CARD_PRODUCTS, CHURN_REASONS, type CardProduct } from '@/data/target';

/** 필터에서 '전체'를 뜻하는 값 (화면 표시는 common.all) */
export const ALL_FILTER = 'all';

/** 많이 쓰이는 순서로 정렬한 값 목록 */
function byFrequency<T>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
}

/** 맞춤카드찾기 '카드혜택' 카테고리 (상품이 많은 순, '전체' 제외) */
export const CARD_BENEFIT_CATEGORIES = byFrequency(
  CARD_PRODUCTS.flatMap((card) => card.tags),
);

/** 발급 가능한 브랜드 (상품이 많은 순, '전체' 제외) */
export const CARD_BRANDS = byFrequency(
  CARD_PRODUCTS.flatMap((card) => card.brands),
);

const CARD_REASON_BASE = [78, 64, 52, 41, 23];

/** 이탈률 추이 월 ('YY.MM'). 화면 표시는 formatMonth */
export const CARD_TREND_MONTHS = MONTHS;

const CARD_RATE_SHAPE = [
  0.79, 0.8, 0.82, 0.83, 0.85, 0.87, 0.89, 0.9, 0.93, 0.95, 0.97, 1,
];

/** 전체 카드 평균 이탈률 % */
export const CARD_AVERAGE_RATE = [
  2.2, 2.2, 2.3, 2.3, 2.3, 2.4, 2.4, 2.4, 2.5, 2.5, 2.5, 2.6,
];

/** 이 카드 월별 이탈률 (마지막 달이 현재 이탈률) */
export function getCardRateTrend(card: CardProduct) {
  return CARD_TREND_MONTHS.map((month, index) => ({
    month,
    card: +(card.churnRate * CARD_RATE_SHAPE[index]).toFixed(2),
    average: CARD_AVERAGE_RATE[index],
  }));
}

/** 사유별 평균 기여 점수 (이탈률에 비례) */
export function getCardReasonScores(card: CardProduct) {
  return CHURN_REASONS.map((reason, index) => ({
    reason,
    score: Math.min(
      99,
      Math.round(CARD_REASON_BASE[index] * (card.churnRate / 2.9)),
    ),
  }));
}
