import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ProductSearchBar } from '@/features/card-analysis/ProductSearchBar';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import { ReasonImpactChart } from '@/features/reason-analysis/ReasonImpactChart';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import {
  customers,
  ibkCreditCardInfoByName,
  productUsageStats,
} from '@/data/customers';
import type { RiskLevel } from '@/types/churn';

const TOP_REASON_COUNT = 5;

export function CardDetailPage() {
  const { productName: encodedProductName } = useParams<{
    productName: string;
  }>();
  const productName = encodedProductName
    ? decodeURIComponent(encodedProductName)
    : '';

  const stat = productUsageStats.find(
    (item) => item.productName === productName,
  );
  const cardInfo = ibkCreditCardInfoByName[productName];

  const [lookupValue, setLookupValue] = useState(productName);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    cardInfo?.benefitCategories[0] ?? null,
  );

  useEffect(() => {
    setLookupValue(productName);
    setSelectedCategory(cardInfo?.benefitCategories[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName]);

  const productCustomers = useMemo(
    () => customers.filter((customer) => customer.productName === productName),
    [productName],
  );
  const productReasonImpacts = useMemo(
    () => getAverageReasonImpact(productCustomers).slice(0, TOP_REASON_COUNT),
    [productCustomers],
  );

  const categoryCustomers = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return customers.filter((customer) =>
      ibkCreditCardInfoByName[customer.productName]?.benefitCategories.includes(
        selectedCategory,
      ),
    );
  }, [selectedCategory]);
  const categoryReasonImpacts = useMemo(
    () => getAverageReasonImpact(categoryCustomers).slice(0, TOP_REASON_COUNT),
    [categoryCustomers],
  );

  if (!stat || !cardInfo) {
    return <Navigate to="/card-list" replace />;
  }

  const riskCounts: Record<RiskLevel, number> = {
    high: stat.highRiskCount,
    medium: stat.mediumRiskCount,
    low: stat.lowRiskCount,
  };

  const cardInfoItems = [
    { label: '카드 이름', value: stat.productName },
    {
      label: '발급 회원 수',
      value: `${stat.issuedCount.toLocaleString('ko-KR')}명`,
    },
    {
      label: '이용 회원 수',
      value: `${stat.activeCount.toLocaleString('ko-KR')}명`,
    },
    {
      label: '해지 회원 수',
      value: `${stat.canceledCount.toLocaleString('ko-KR')}명`,
    },
    { label: '브랜드', value: cardInfo.brands.join(', ') },
    { label: '혜택 카테고리', value: cardInfo.benefitCategories.join(', ') },
  ];

  return (
    <div>
      <PageHeading title="카드 상세 정보" />

      <ProductSearchBar value={lookupValue} onValueChange={setLookupValue} />

      <CardGrid columns={1}>
        <Card title="카드 정보">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {cardInfoItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card title="위험도 구성비" description="이용 회원 기준 위험도별 비중">
          <RiskDistributionChart
            countsByRiskLevel={riskCounts}
            totalCustomerCount={stat.activeCount}
          />
        </Card>
        <Card
          title="위험도별 인원 현황"
          description="이용 회원 기준 위험도별 인원수와 비율"
        >
          <RiskSummaryTable
            countsByRiskLevel={riskCounts}
            totalCustomerCount={stat.activeCount}
          />
        </Card>
      </CardGrid>

      <CardGrid columns={2}>
        <Card
          title="이 카드를 소유한 사람들의 이탈 사유"
          description={`이 카드 회원 ${productCustomers.length}명 기준 평균 기여 점수 (높은 순)`}
        >
          {productReasonImpacts.length > 0 ? (
            <ReasonImpactChart reasonImpacts={productReasonImpacts} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">
              해당 상품을 보유한 회원 데이터가 없습니다.
            </p>
          )}
        </Card>

        <Card
          title="이 카드가 속한 카테고리의 이탈 사유"
          description={`이 카테고리 회원 ${categoryCustomers.length}명 기준 평균 기여 점수 (높은 순)`}
          seeMoreHref="/card-analysis"
        >
          {cardInfo.benefitCategories.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {cardInfo.benefitCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
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
