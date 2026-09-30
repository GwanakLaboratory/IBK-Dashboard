import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router';
import { maskName } from '@/utils/format';
import { getLastUsedAt, getTopReason, RISK_LEVEL_META } from '@/utils/risk';
import type { Customer } from '@/types/churn';

export type SortableColumnKey = 'predictionScore' | 'riskLevel';
export type SortDirection = 'asc' | 'desc';

type CustomerTableProps = {
  customers: Customer[];
  sortColumnKey: SortableColumnKey | null;
  sortDirection: SortDirection;
  onSortColumnClick: (columnKey: SortableColumnKey) => void;
};

const SORTABLE_COLUMNS: {
  key: SortableColumnKey;
  label: string;
  align: 'left' | 'right';
}[] = [
  { key: 'predictionScore', label: '이탈예측점수', align: 'right' },
  { key: 'riskLevel', label: '위험도', align: 'left' },
];

function SortIndicatorIcon({
  direction,
}: {
  direction: SortDirection | 'none';
}) {
  if (direction === 'asc') {
    return <ArrowUp className="h-3 w-3 shrink-0" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="h-3 w-3 shrink-0" />;
  }
  return <ArrowUpDown className="h-3 w-3 shrink-0" />;
}

export function CustomerTable({
  customers,
  sortColumnKey,
  sortDirection,
  onSortColumnClick,
}: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[13%]" />
          <col className="w-[8%]" />
          <col className="w-[18%]" />
          <col className="w-[10%]" />
          <col className="w-[9%]" />
          <col className="w-[26%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr className="bg-[#F7F8FA] text-left text-xs text-gray-600">
            <th className="py-3 pl-5 pr-3 font-semibold">회원번호</th>
            <th className="px-3 py-3 font-semibold">이름</th>
            <th className="px-3 py-3 font-semibold">카드상품</th>
            {SORTABLE_COLUMNS.map((column) => {
              const isActiveColumn = sortColumnKey === column.key;

              return (
                <th
                  key={column.key}
                  className={`px-3 py-3 font-semibold ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  aria-sort={
                    isActiveColumn
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSortColumnClick(column.key)}
                    className={`inline-flex items-center gap-1 hover:text-gray-900 ${
                      isActiveColumn ? 'text-gray-900' : ''
                    }`}
                  >
                    {column.label}
                    <SortIndicatorIcon
                      direction={isActiveColumn ? sortDirection : 'none'}
                    />
                  </button>
                </th>
              );
            })}
            <th className="px-3 py-3 font-semibold">주요 이유</th>
            <th className="py-3 pl-3 pr-5 text-right font-semibold">
              최근 이용 날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const topReason = getTopReason(customer);
            const lastUsedAt = getLastUsedAt(customer);
            const riskLevelMeta = RISK_LEVEL_META[customer.riskLevel];

            return (
              <tr
                key={customer.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="truncate py-3 pl-5 pr-3 font-semibold">
                  <Link
                    to={`/customer-detail/${customer.id}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {customer.id}
                  </Link>
                </td>
                <td className="truncate px-3 py-3 text-gray-900">
                  {maskName(customer.name)}
                </td>
                <td
                  className="truncate px-3 py-3 text-gray-600"
                  title={customer.productName}
                >
                  {customer.productName}
                </td>
                <td className="px-3 py-3 text-right font-bold text-gray-900">
                  {customer.predictionScore}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ${riskLevelMeta.badgeClassName}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${riskLevelMeta.dotColorClassName}`}
                    />
                    {riskLevelMeta.label}
                  </span>
                </td>
                <td
                  className="truncate px-3 py-3 text-gray-700"
                  title={topReason.label}
                >
                  {topReason.label}
                </td>
                <td className="py-3 pl-3 pr-5 text-right text-gray-900">
                  {lastUsedAt ? lastUsedAt.replace(/-/g, '.') : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
