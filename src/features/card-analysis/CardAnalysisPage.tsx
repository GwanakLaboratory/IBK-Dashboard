import { useMemo, useState } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ChurnRankingTable } from '@/features/card-analysis/ChurnRankingTable';
import { buildCategoryChurnRanking } from '@/features/card-analysis/churnRankingStats';
import { ReasonImpactChart } from '@/features/reason-analysis/ReasonImpactChart';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import {
  customers,
  ibkCreditCardInfoByName,
  productUsageStats,
} from '@/data/customers';

const TOP_REASON_COUNT = 5;

export function CardAnalysisPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryRanking = useMemo(
    () => buildCategoryChurnRanking(productUsageStats, ibkCreditCardInfoByName),
    [],
  );

  function handleSelectCategory(category: string) {
    setSelectedCategory((current) => (current === category ? null : category));
  }

  const categoryReasonImpacts = useMemo(() => {
    const targetCustomers = selectedCategory
      ? customers.filter((customer) =>
          ibkCreditCardInfoByName[
            customer.productName
          ]?.benefitCategories.includes(selectedCategory),
        )
      : customers;
    return getAverageReasonImpact(targetCustomers).slice(0, TOP_REASON_COUNT);
  }, [selectedCategory]);

  return (
    <div>
      <PageHeading
        title="카드 카테고리 분석"
        description="혜택 카테고리별 이탈률을 랭킹으로 찾고, 클릭해서 이탈 사유까지 확인합니다. (카드상품 단위 분석은 상품 목록에서 확인하세요.)"
      />

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title="혜택 카테고리별 이탈률 랭킹"
          description="발급 회원 수와 함께 확인 (착시 방지). 클릭하면 오른쪽 이탈 사유가 바뀝니다."
        >
          <ChurnRankingTable
            items={categoryRanking}
            selectedKey={selectedCategory}
            onSelectItem={handleSelectCategory}
          />
        </Card>
        <Card
          title={
            selectedCategory
              ? `"${selectedCategory}" 이탈 사유 Top 5`
              : '혜택 카테고리별 이탈 사유 Top 5 (전체 회원)'
          }
          description="왼쪽 랭킹에서 선택한 회원 기준 평균 기여 점수 (높은 순)"
        >
          {categoryReasonImpacts.length > 0 ? (
            <ReasonImpactChart reasonImpacts={categoryReasonImpacts} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">
              선택한 카테고리에 해당하는 회원 데이터가 없습니다.
            </p>
          )}
        </Card>
      </CardGrid>
    </div>
  );
}
