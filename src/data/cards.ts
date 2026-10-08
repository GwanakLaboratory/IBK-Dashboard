/* 카드 상품 목록 · 상세 화면 전용 목데이터. 카드 목록은 IBK 실제 상품 기준. */
import { CARD_PRODUCTS, CHURN_REASONS, type CardProduct } from '@/data/target';

/** 많이 쓰이는 순서로 정렬한 값 목록 */
function byFrequency(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
}

/** IBK 맞춤카드찾기 '카드혜택' 카테고리 */
export const CARD_BENEFIT_CATEGORIES = [
  '전체',
  ...byFrequency(CARD_PRODUCTS.flatMap((card) => card.tags)),
];

/** 발급 가능한 브랜드 (상품이 많은 순) */
export const CARD_BRANDS = [
  '전체',
  ...byFrequency(CARD_PRODUCTS.flatMap((card) => card.brands)),
];

const CARD_REASON_BASE = [78, 64, 52, 41, 23];

export const CARD_TREND_MONTHS = [
  '10월',
  '11월',
  '12월',
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
];

const CARD_RATE_SHAPE = [
  0.79, 0.8, 0.82, 0.83, 0.85, 0.87, 0.89, 0.9, 0.93, 0.95, 0.97, 1,
];

/** 전체 카드 평균 이탈률 % */
export const CARD_AVERAGE_RATE = [
  2.2, 2.2, 2.3, 2.3, 2.3, 2.4, 2.4, 2.4, 2.5, 2.5, 2.5, 2.6,
];

/** 이 카드 월별 이탈률 (마지막 달이 현재 이탈률) */
export function getCardRateTrend(card: CardProduct) {
  return CARD_TREND_MONTHS.map((label, index) => ({
    label,
    card: +(card.churnRate * CARD_RATE_SHAPE[index]).toFixed(2),
    average: CARD_AVERAGE_RATE[index],
  }));
}

/** 사유별 평균 기여 점수 (이탈률에 비례) */
export function getCardReasonScores(card: CardProduct) {
  return CHURN_REASONS.map((label, index) => ({
    label,
    score: Math.min(
      99,
      Math.round(CARD_REASON_BASE[index] * (card.churnRate / 2.9)),
    ),
  }));
}
