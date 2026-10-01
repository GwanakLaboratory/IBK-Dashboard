import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Select } from '@/components/molecules/Select';
import {
  CardProductTable,
  type SortableColumnKey,
  type SortDirection,
} from '@/features/card-analysis/CardProductTable';
import { CardShareSummary } from '@/features/card-analysis/CardShareSummary';
import { ProductSearchBar } from '@/features/card-analysis/ProductSearchBar';
import {
  ibkCreditCardInfoByName,
  ibkCreditCardInfos,
  productUsageStats,
} from '@/data/customers';

type BenefitCategoryFilter = string | 'all';
type BrandFilter = string | 'all';

const BENEFIT_CATEGORY_OPTIONS = Array.from(
  new Set(ibkCreditCardInfos.flatMap((cardInfo) => cardInfo.benefitCategories)),
).sort((a, b) => a.localeCompare(b, 'ko'));

const BRAND_OPTIONS = Array.from(
  new Set(ibkCreditCardInfos.flatMap((cardInfo) => cardInfo.brands)),
).sort((a, b) => a.localeCompare(b, 'ko'));

const MAX_CHURN_RATE = Math.max(
  ...productUsageStats.map((stat) => stat.churnRate),
);

export function CardProductListPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [benefitCategoryFilter, setBenefitCategoryFilter] =
    useState<BenefitCategoryFilter>('all');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('all');
  const [sortColumnKey, setSortColumnKey] =
    useState<SortableColumnKey>('churnRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();
  const filteredStats = productUsageStats.filter((stat) => {
    const matchesSearchKeyword =
      !normalizedSearchKeyword ||
      stat.productName.toLowerCase().includes(normalizedSearchKeyword);

    const cardInfo = ibkCreditCardInfoByName[stat.productName];
    const matchesBenefitCategoryFilter =
      benefitCategoryFilter === 'all' ||
      (cardInfo?.benefitCategories.includes(benefitCategoryFilter) ?? false);
    const matchesBrandFilter =
      brandFilter === 'all' ||
      (cardInfo?.brands.includes(brandFilter) ?? false);

    return (
      matchesSearchKeyword && matchesBenefitCategoryFilter && matchesBrandFilter
    );
  });
  const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
  const sortedStats = [...filteredStats].sort(
    (statA, statB) =>
      (statA[sortColumnKey] - statB[sortColumnKey]) * directionMultiplier,
  );
  const hasFilteredStats = sortedStats.length > 0;

  function handleRowClick(productName: string) {
    navigate(`/card-list/${encodeURIComponent(productName)}`);
  }

  function handleSortColumnClick(columnKey: SortableColumnKey) {
    if (sortColumnKey !== columnKey) {
      setSortColumnKey(columnKey);
      setSortDirection('desc');
      return;
    }
    setSortDirection((previousDirection) =>
      previousDirection === 'desc' ? 'asc' : 'desc',
    );
  }

  return (
    <Screen>
      <PageHeading />

      <div className="grid gap-6">
        <ProductSearchBar
          value={searchKeyword}
          onValueChange={setSearchKeyword}
        />

        <CardShareSummary stats={productUsageStats} />

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="benefit-category-filter"
            className="text-sm font-semibold text-gray-600"
          >
            혜택 카테고리
          </label>
          <Select
            id="benefit-category-filter"
            value={benefitCategoryFilter}
            onChange={(event) =>
              setBenefitCategoryFilter(
                event.target.value as BenefitCategoryFilter,
              )
            }
          >
            <option value="all">전체</option>
            {BENEFIT_CATEGORY_OPTIONS.map((benefitCategory) => (
              <option key={benefitCategory} value={benefitCategory}>
                {benefitCategory}
              </option>
            ))}
          </Select>
          <label
            htmlFor="brand-filter"
            className="ml-2 text-sm font-semibold text-gray-600"
          >
            브랜드
          </label>
          <Select
            id="brand-filter"
            value={brandFilter}
            onChange={(event) =>
              setBrandFilter(event.target.value as BrandFilter)
            }
          >
            <option value="all">전체</option>
            {BRAND_OPTIONS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Select>
          <span className="ml-auto text-sm text-gray-500">
            전체{' '}
            <strong className="text-gray-900">
              {productUsageStats.length}
            </strong>
            개 중{' '}
            <strong className="text-primary">{filteredStats.length}</strong>개
            표시
          </span>
        </div>

        <CardGrid columns={1}>
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {hasFilteredStats ? (
              <CardProductTable
                stats={sortedStats}
                cardInfoByName={ibkCreditCardInfoByName}
                maxChurnRate={MAX_CHURN_RATE}
                sortColumnKey={sortColumnKey}
                sortDirection={sortDirection}
                onSortColumnClick={handleSortColumnClick}
                onRowClick={handleRowClick}
              />
            ) : (
              <p className="py-14 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        </CardGrid>
      </div>
    </Screen>
  );
}
