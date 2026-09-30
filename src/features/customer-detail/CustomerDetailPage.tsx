import { useEffect, useMemo, useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { Select } from '@/components/molecules/Select';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Pagination } from '@/components/molecules/Pagination';
import { Tabs } from '@/components/molecules/Tabs';
import {
  CustomerSearchBar,
  type CustomerSearchField,
} from '@/features/customer-detail/CustomerSearchBar';
import { PriorityTargetPanel } from '@/features/customer-detail/PriorityTargetPanel';
import {
  CustomerTable,
  type SortableColumnKey,
  type SortDirection,
} from '@/features/customer-detail/CustomerTable';
import { customers, ibkCreditCards } from '@/data/customers';
import {
  RISK_LEVEL_META,
  RISK_LEVEL_DISPLAY_ORDER,
  getRiskLevelRank,
  interleaveByRiskLevel,
} from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskLevelFilter = RiskLevel | 'all';
type ProductNameFilter = string | 'all';
type MemberListTab = 'all' | 'priority';

const CUSTOMERS_PER_PAGE = 10;

const PRODUCT_NAME_OPTIONS = [...ibkCreditCards].sort((a, b) =>
  a.localeCompare(b, 'ko'),
);

export function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState<MemberListTab>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchField, setSearchField] = useState<CustomerSearchField>('name');
  const [riskLevelFilter, setRiskLevelFilter] =
    useState<RiskLevelFilter>('all');
  const [productNameFilter, setProductNameFilter] =
    useState<ProductNameFilter>('all');
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
        customer[searchField].toLowerCase().includes(normalizedSearchKeyword);
      const matchesRiskLevelFilter =
        riskLevelFilter === 'all' || customer.riskLevel === riskLevelFilter;
      const matchesProductNameFilter =
        productNameFilter === 'all' ||
        customer.productName === productNameFilter;

      return (
        matchesSearchKeyword &&
        matchesRiskLevelFilter &&
        matchesProductNameFilter
      );
    });
  }, [
    normalizedSearchKeyword,
    searchField,
    riskLevelFilter,
    productNameFilter,
  ]);
  const hasFilteredCustomers = filteredCustomers.length > 0;

  const sortedCustomers = useMemo(() => {
    if (!sortColumnKey) {
      return interleaveByRiskLevel(filteredCustomers);
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
  const displayRangeStart = hasFilteredCustomers
    ? (safeCurrentPage - 1) * CUSTOMERS_PER_PAGE + 1
    : 0;
  const displayRangeEnd = Math.min(
    safeCurrentPage * CUSTOMERS_PER_PAGE,
    filteredCustomers.length,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    normalizedSearchKeyword,
    searchField,
    riskLevelFilter,
    productNameFilter,
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
    <Screen>
      <PageHeading />

      <Tabs
        tabs={[
          { key: 'all', label: '전체 회원' },
          { key: 'priority', label: '위험군 우선순위' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      >
        {activeTab === 'all' ? (
          <div className="grid gap-6">
            <CustomerSearchBar
              value={searchKeyword}
              onValueChange={setSearchKeyword}
              searchField={searchField}
              onSearchFieldChange={setSearchField}
            />

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="risk-level-filter"
                className="text-sm font-semibold text-gray-600"
              >
                위험도
              </label>
              <Select
                id="risk-level-filter"
                value={riskLevelFilter}
                onChange={(event) =>
                  setRiskLevelFilter(event.target.value as RiskLevelFilter)
                }
              >
                <option value="all">전체</option>
                {RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => (
                  <option key={riskLevel} value={riskLevel}>
                    {RISK_LEVEL_META[riskLevel].label}
                  </option>
                ))}
              </Select>
              <label
                htmlFor="product-name-filter"
                className="ml-2 text-sm font-semibold text-gray-600"
              >
                카드상품
              </label>
              <Select
                id="product-name-filter"
                value={productNameFilter}
                onChange={(event) =>
                  setProductNameFilter(event.target.value as ProductNameFilter)
                }
              >
                <option value="all">전체 상품</option>
                {PRODUCT_NAME_OPTIONS.map((productName) => (
                  <option key={productName} value={productName}>
                    {productName}
                  </option>
                ))}
              </Select>
              <span className="ml-auto text-sm text-gray-500">
                전체{' '}
                <strong className="text-gray-900">
                  {filteredCustomers.length}
                </strong>
                명 중{' '}
                <strong className="text-primary">
                  {displayRangeStart}-{displayRangeEnd}
                </strong>
                명 표시
              </span>
            </div>

            <CardGrid columns={1}>
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                {hasFilteredCustomers ? (
                  <>
                    <CustomerTable
                      customers={paginatedCustomers}
                      sortColumnKey={sortColumnKey}
                      sortDirection={sortDirection}
                      onSortColumnClick={handleSortColumnClick}
                    />
                    <div className="flex justify-center border-t border-gray-100 p-3">
                      <Pagination
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </>
                ) : (
                  <p className="py-14 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </p>
                )}
              </div>
            </CardGrid>
          </div>
        ) : (
          <PriorityTargetPanel customers={customers} />
        )}
      </Tabs>
    </Screen>
  );
}
