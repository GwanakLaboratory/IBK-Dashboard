import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/molecules/Select';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Pagination } from '@/components/molecules/Pagination';
import { CustomerSearchBar } from '@/features/customer-detail/CustomerSearchBar';
import {
  CustomerTable,
  type SortableColumnKey,
  type SortDirection,
} from '@/features/customer-detail/CustomerTable';
import { customers } from '@/data/customers';
import {
  RISK_LEVEL_META,
  RISK_LEVEL_DISPLAY_ORDER,
  getRiskLevelRank,
} from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

type RiskLevelFilter = RiskLevel | 'all';

const CUSTOMERS_PER_PAGE = 6;

export function CustomerDetailPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] =
    useState<RiskLevelFilter>('all');
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
        customer.id.toLowerCase().includes(normalizedSearchKeyword);
      const matchesRiskLevelFilter =
        riskLevelFilter === 'all' || customer.riskLevel === riskLevelFilter;

      return matchesSearchKeyword && matchesRiskLevelFilter;
    });
  }, [normalizedSearchKeyword, riskLevelFilter]);
  const hasFilteredCustomers = filteredCustomers.length > 0;

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
  }, [normalizedSearchKeyword, riskLevelFilter]);

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
