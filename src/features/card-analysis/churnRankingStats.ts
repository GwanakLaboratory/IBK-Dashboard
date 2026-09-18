import type { IbkCreditCardInfo, ProductUsageStat } from '@/types/churn';

export type ChurnRankingItem = {
  key: string;
  label: string;
  issuedCount: number;
  canceledCount: number;
  churnRate: number;
};

// 카드 하나가 여러 혜택 카테고리에 속할 수 있으므로, 상품별 집계치를
// 그 상품이 속한 카테고리 각각에 중복으로 더한다.
export function buildCategoryChurnRanking(
  productUsageStats: ProductUsageStat[],
  cardInfoByName: Record<string, IbkCreditCardInfo>,
): ChurnRankingItem[] {
  const totalsByCategory = new Map<
    string,
    { issuedCount: number; canceledCount: number }
  >();

  for (const stat of productUsageStats) {
    const categories =
      cardInfoByName[stat.productName]?.benefitCategories ?? [];

    for (const category of categories) {
      const totals = totalsByCategory.get(category) ?? {
        issuedCount: 0,
        canceledCount: 0,
      };
      totals.issuedCount += stat.issuedCount;
      totals.canceledCount += stat.canceledCount;
      totalsByCategory.set(category, totals);
    }
  }

  return [...totalsByCategory.entries()]
    .map(([category, totals]) => ({
      key: category,
      label: category,
      issuedCount: totals.issuedCount,
      canceledCount: totals.canceledCount,
      churnRate:
        Math.round((totals.canceledCount / totals.issuedCount) * 1000) / 10,
    }))
    .sort((itemA, itemB) => itemB.churnRate - itemA.churnRate);
}
