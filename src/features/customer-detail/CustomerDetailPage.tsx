import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/molecules/Select';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Pagination } from '@/components/molecules/Pagination';
import { ChurnScoreHistogramChart } from '@/features/customer-detail/ChurnScoreHistogramChart';
import { CustomerSearchBar } from '@/features/customer-detail/CustomerSearchBar';
import {
  CustomerTable,
  type SortableColumnKey,
  type SortDirection,
} from '@/features/customer-detail/CustomerTable';
import {
  customers,
  ibkCreditCardInfoByName,
  ibkCreditCardInfos,
  ibkCreditCards,
  monthlyMemberActivity,
} from '@/data/customers';
import {
  RISK_LEVEL_META,
  RISK_LEVEL_DISPLAY_ORDER,
  getRiskLevelRank,
} from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

const HIGH_RISK_SHARE = 0.05;
const MID_RISK_SHARE = 0.15;

type RiskLevelFilter = RiskLevel | 'all';
type ProductNameFilter = string | 'all';
type BenefitCategoryFilter = string | 'all';
type BrandFilter = string | 'all';

const CUSTOMERS_PER_PAGE = 6;

const PRODUCT_NAME_OPTIONS = [...ibkCreditCards].sort((a, b) =>
  a.localeCompare(b, 'ko'),
);

const BENEFIT_CATEGORY_OPTIONS = Array.from(
  new Set(ibkCreditCardInfos.flatMap((cardInfo) => cardInfo.benefitCategories)),
).sort((a, b) => a.localeCompare(b, 'ko'));

const BRAND_OPTIONS = Array.from(
  new Set(ibkCreditCardInfos.flatMap((cardInfo) => cardInfo.brands)),
).sort((a, b) => a.localeCompare(b, 'ko'));

export function CustomerDetailPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] =
    useState<RiskLevelFilter>('all');
  const [productNameFilter, setProductNameFilter] =
    useState<ProductNameFilter>('all');
  const [benefitCategoryFilter, setBenefitCategoryFilter] =
    useState<BenefitCategoryFilter>('all');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('all');
  const [sortColumnKey, setSortColumnKey] = useState<SortableColumnKey | null>(
    null,
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearchKeyword =
        !normalizedSearchKeyword ||
        customer.id.toLowerCase().includes(normalizedSearchKeyword) ||
        customer.name.toLowerCase().includes(normalizedSearchKeyword) ||
        customer.phoneNumber.includes(normalizedSearchKeyword);
      const matchesRiskLevelFilter =
        riskLevelFilter === 'all' || customer.riskLevel === riskLevelFilter;
      const matchesProductNameFilter =
        productNameFilter === 'all' ||
        customer.productName === productNameFilter;

      const productInfo = ibkCreditCardInfoByName[customer.productName];
      const matchesBenefitCategoryFilter =
        benefitCategoryFilter === 'all' ||
        (productInfo?.benefitCategories.includes(benefitCategoryFilter) ??
          false);
      const matchesBrandFilter =
        brandFilter === 'all' ||
        (productInfo?.brands.includes(brandFilter) ?? false);

      return (
        matchesSearchKeyword &&
        matchesRiskLevelFilter &&
        matchesProductNameFilter &&
        matchesBenefitCategoryFilter &&
        matchesBrandFilter
      );
    });
  }, [
    normalizedSearchKeyword,
    riskLevelFilter,
    productNameFilter,
    benefitCategoryFilter,
    brandFilter,
  ]);
  const hasFilteredCustomers = filteredCustomers.length > 0;

  const churnScoreHistogramData = useMemo(
    () =>
      monthlyMemberActivity.map((point) => {
        const high = Math.round(point.activeMembers * HIGH_RISK_SHARE);
        const mid = Math.round(point.activeMembers * MID_RISK_SHARE);
        const low = point.activeMembers - high - mid;
        return { month: point.month, high, mid, low };
      }),
    [],
  );

  const sortedCustomers = useMemo(() => {
    if (!sortColumnKey) {
      return filteredCustomers;
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...filteredCustomers].sort((customerA, customerB) => {
      const valueA =
        sortColumnKey === 'predictionScore'
          ? customerA.predictionScore
          : getRiskLevelRank(customerA.riskLevel);
      const valueB =
        sortColumnKey === 'predictionScore'
          ? customerB.predictionScore
          : getRiskLevelRank(customerB.riskLevel);

      return (valueA - valueB) * directionMultiplier;
    });
  }, [filteredCustomers, sortColumnKey, sortDirection]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedCustomers.length / CUSTOMERS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCustomers = sortedCustomers.slice(
    (safeCurrentPage - 1) * CUSTOMERS_PER_PAGE,
    safeCurrentPage * CUSTOMERS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    normalizedSearchKeyword,
    riskLevelFilter,
    productNameFilter,
    benefitCategoryFilter,
    brandFilter,
  ]);

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
      <PageHeading title="회원별 상세" />

      <CardGrid columns={1}>
        <Card
          title="회원 전체 이탈 스코어"
          description="위험 / 중위험 / 저위험 구성 (최근 12개월)"
        >
          <ChurnScoreHistogramChart data={churnScoreHistogramData} />
        </Card>
      </CardGrid>

      <CustomerSearchBar
        value={searchKeyword}
        onValueChange={setSearchKeyword}
      />

      <CardGrid columns={1}>
        <Card
          title="회원 목록"
          description={`${filteredCustomers.length}명 / 총 ${customers.length}명`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
            <Select
              value={riskLevelFilter}
              onChange={(event) =>
                setRiskLevelFilter(event.target.value as RiskLevelFilter)
              }
            >
              <option value="all">전체 위험도</option>
              {RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => (
                <option key={riskLevel} value={riskLevel}>
                  {RISK_LEVEL_META[riskLevel].label}
                </option>
              ))}
            </Select>
            <Select
              value={productNameFilter}
              onChange={(event) =>
                setProductNameFilter(event.target.value as ProductNameFilter)
              }
            >
              <option value="all">전체 카드상품</option>
              {PRODUCT_NAME_OPTIONS.map((productName) => (
                <option key={productName} value={productName}>
                  {productName}
                </option>
              ))}
            </Select>
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
          {hasFilteredCustomers ? (
            <>
              <CustomerTable
                customers={paginatedCustomers}
                sortColumnKey={sortColumnKey}
                sortDirection={sortDirection}
                onSortColumnClick={handleSortColumnClick}
              />
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
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
