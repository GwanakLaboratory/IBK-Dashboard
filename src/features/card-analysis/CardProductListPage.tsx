import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Select } from '@/components/molecules/Select';
import {
  CardProductTable,
  type SortableColumnKey,
  type SortDirection,
} from '@/features/card-analysis/CardProductTable';
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
    <div>
      <PageHeading
        title="카드 상품 목록"
        description="상품명을 클릭하면 카드 상세 화면에서 발급 현황, 위험도, 이탈 사유를 확인합니다."
      />

      <ProductSearchBar
        value={searchKeyword}
        onValueChange={setSearchKeyword}
      />

      <CardGrid columns={1}>
        <Card
          title="전체 카드 상품"
          description={`${filteredStats.length}개 상품 / 총 ${productUsageStats.length}개`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
            <Select
              value={benefitCategoryFilter}
              onChange={(event) =>
                setBenefitCategoryFilter(
                  event.target.value as BenefitCategoryFilter,
                )
              }
            >
              <option value="all">전체 혜택 카테고리</option>
              {BENEFIT_CATEGORY_OPTIONS.map((benefitCategory) => (
                <option key={benefitCategory} value={benefitCategory}>
                  {benefitCategory}
                </option>
              ))}
            </Select>
            <Select
              value={brandFilter}
              onChange={(event) =>
                setBrandFilter(event.target.value as BrandFilter)
              }
            >
              <option value="all">전체 브랜드</option>
              {BRAND_OPTIONS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
          </div>
          {hasFilteredStats ? (
            <CardProductTable
              stats={sortedStats}
              cardInfoByName={ibkCreditCardInfoByName}
              sortColumnKey={sortColumnKey}
              sortDirection={sortDirection}
              onSortColumnClick={handleSortColumnClick}
              onRowClick={handleRowClick}
            />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">
              검색 결과가 없습니다.
            </p>
          )}
        </Card>
      </CardGrid>
    </div>
  );
}
