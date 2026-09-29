import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';
import { CardProfile } from '@/features/card-analysis/CardProfile';
import { CardRiskDonut } from '@/features/card-analysis/CardRiskDonut';
import { CategoryReasonRanking } from '@/features/card-analysis/CategoryReasonRanking';
import { ProductSearchBar } from '@/features/card-analysis/ProductSearchBar';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import { CARD_IMAGE_URLS } from '@/data/cardImages';
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

  const productReasonLabels = productReasonImpacts.map(
    (reason) => reason.label,
  );
  const categoryReasonLabels = categoryReasonImpacts.map(
    (reason) => reason.label,
  );

  return (
    <Screen>
      <PageHeading />

      <ProductSearchBar
        value={lookupValue}
        onValueChange={setLookupValue}
        disabled
      />

      <CardGrid columns={1}>
        <Card
          title="카드 기본 정보"
          description="상품 정보와 발급·이용·해지 회원 현황"
        >
          <CardProfile
            stat={stat}
            cardInfo={cardInfo}
            imageUrl={CARD_IMAGE_URLS[stat.productName]}
          />
        </Card>
      </CardGrid>

      <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card
          title="이용 회원 위험도 비중"
          description={`이용 회원 ${stat.activeCount.toLocaleString('ko-KR')}명을 위험도 등급별로 나눈 비중`}
        >
          <CardRiskDonut
            countsByRiskLevel={riskCounts}
            totalCustomerCount={stat.activeCount}
          />
        </Card>
        <Card
          title="위험도별 회원 수"
          description="위험·중위험·저위험 등급별 이용 회원 수와 비율"
        >
          <RiskSummaryTable
            countsByRiskLevel={riskCounts}
            totalCustomerCount={stat.activeCount}
            totalLabel="전체 이용 회원"
          />
        </Card>
      </div>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title={`카드 보유 회원 이탈 사유 Top ${TOP_REASON_COUNT}`}
          description="이 카드 회원의 사유별 평균 기여 점수 (0–100점, 높은 순)"
        >
          <div className="flex flex-col gap-4">
            <div className="flex h-9 items-center gap-2">
              <span className="text-[13px] font-bold text-gray-900">
                {stat.productName}
              </span>
              <span className="text-xs text-gray-500">
                보유 회원 {productCustomers.length.toLocaleString('ko-KR')}명
              </span>
            </div>
            {productReasonImpacts.length > 0 ? (
              <CategoryReasonRanking
                reasonImpacts={productReasonImpacts}
                sharedLabels={categoryReasonLabels}
              />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                해당 상품을 보유한 회원 데이터가 없습니다.
              </p>
            )}
          </div>
        </Card>

        <Card
          title={`혜택 카테고리 이탈 사유 Top ${TOP_REASON_COUNT}`}
          description={`같은 혜택 카테고리 회원 ${categoryCustomers.length.toLocaleString('ko-KR')}명의 사유별 평균 기여 점수`}
          actions={
            <Link
              to="/card-analysis"
              className="flex items-center gap-0.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              카테고리 분석
              <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
            </Link>
          }
        >
          <div className="flex flex-col gap-4">
            {selectedCategory && (
              <div className="self-start">
                <Tabs
                  variant="segmented"
                  tabs={cardInfo.benefitCategories.map((category) => ({
                    key: category,
                    label: category,
                  }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </div>
            )}
            {categoryReasonImpacts.length > 0 ? (
              <CategoryReasonRanking
                reasonImpacts={categoryReasonImpacts}
                sharedLabels={productReasonLabels}
              />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                선택한 카테고리에 해당하는 회원 데이터가 없습니다.
              </p>
            )}
          </div>
        </Card>
      </CardGrid>
    </Screen>
  );
}
