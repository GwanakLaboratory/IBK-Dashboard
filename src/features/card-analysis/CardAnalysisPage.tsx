import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { CategoryReasonRanking } from '@/features/card-analysis/CategoryReasonRanking';
import { ChurnRankingTable } from '@/features/card-analysis/ChurnRankingTable';
import { buildCategoryChurnRanking } from '@/features/card-analysis/churnRankingStats';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import {
  customers,
  ibkCreditCardInfoByName,
  productUsageStats,
} from '@/data/customers';

const TOP_REASON_COUNT = 5;
const CATEGORY_PRODUCT_COUNT = 4;

export function CardAnalysisPage() {
  const categoryRanking = useMemo(
    () => buildCategoryChurnRanking(productUsageStats, ibkCreditCardInfoByName),
    [],
  );

  const [pickedCategory, setPickedCategory] = useState<string | null>(null);
  const selectedCategory = pickedCategory ?? categoryRanking[0]?.key ?? null;

  const categoryReasonImpacts = useMemo(() => {
    const targetCustomers = customers.filter((customer) =>
      ibkCreditCardInfoByName[customer.productName]?.benefitCategories.includes(
        selectedCategory ?? '',
      ),
    );
    return getAverageReasonImpact(targetCustomers).slice(0, TOP_REASON_COUNT);
  }, [selectedCategory]);

  const categoryProducts = useMemo(
    () =>
      productUsageStats
        .filter((stat) =>
          ibkCreditCardInfoByName[stat.productName]?.benefitCategories.includes(
            selectedCategory ?? '',
          ),
        )
        .sort((statA, statB) => statB.churnRate - statA.churnRate)
        .slice(0, CATEGORY_PRODUCT_COUNT),
    [selectedCategory],
  );

  return (
    <Screen>
      <PageHeading />

      <div
        role="tablist"
        aria-label="혜택 카테고리"
        className="flex flex-wrap gap-2"
      >
        {categoryRanking.map((item) => {
          const isSelected = item.key === selectedCategory;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setPickedCategory(item.key)}
              className={`h-9 rounded-full border px-4 text-[13px] transition-colors ${
                isSelected
                  ? 'border-primary bg-primary font-bold text-primary-foreground shadow-[0_4px_10px_rgba(70,108,255,0.25)]'
                  : 'border-border bg-white font-medium text-gray-700 hover:bg-gray-50'
              }`}
            >
              {/* 선택 시 굵게 바뀌어도 칩 너비가 변하지 않도록 굵은 글씨 폭을 미리 확보한다. */}
              <span className="grid">
                <span className="invisible col-start-1 row-start-1 font-bold">
                  {item.label}
                </span>
                <span className="col-start-1 row-start-1">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <CardGrid columns={2} breakpoint="lg">
        {/* 왼쪽 랭킹과 오른쪽 열의 높이를 맞추지 않고 각자 내용 높이만큼만 차지한다. */}
        <div className="self-start">
          <Card
            title="혜택 카테고리별 이탈률 랭킹"
            description="발급 회원 수와 함께 확인하세요 · 행을 누르면 오른쪽 이탈 사유가 바뀝니다"
          >
            <ChurnRankingTable
              items={categoryRanking}
              selectedKey={selectedCategory}
              onSelectItem={setPickedCategory}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6 self-start">
          <Card
            title={`"${selectedCategory ?? ''}" 이탈 사유 Top 5`}
            description="해당 카테고리 보유 회원 기준 평균 기여 점수 (높은 순)"
          >
            {categoryReasonImpacts.length > 0 ? (
              <CategoryReasonRanking reasonImpacts={categoryReasonImpacts} />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                선택한 카테고리에 해당하는 회원 데이터가 없습니다.
              </p>
            )}
          </Card>

          <section className="flex shrink-0 flex-col gap-3 rounded-lg border border-border bg-white px-6 py-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-bold text-gray-900">
                이 혜택이 있는 카드상품
              </h2>
              <Link
                to="/card-list"
                className="text-xs font-semibold text-primary hover:underline"
              >
                카드 목록 전체 →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryProducts.map((stat) => (
                <Link
                  key={stat.productName}
                  to={`/card-list/${encodeURIComponent(stat.productName)}`}
                  className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-border bg-gray-50 px-3.5 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  {stat.productName}
                  <ChevronRight className="h-3 w-3 text-gray-500" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </CardGrid>
    </Screen>
  );
}
