import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { getTopReason } from '@/utils/risk';
import type { Customer } from '@/types/churn';

export type SortableColumnKey = 'predictionScore' | 'riskLevel';
export type SortDirection = 'asc' | 'desc';

type CustomerTableProps = {
  customers: Customer[];
  sortColumnKey: SortableColumnKey | null;
  sortDirection: SortDirection;
  onSortColumnClick: (columnKey: SortableColumnKey) => void;
};

const SORTABLE_COLUMNS: { key: SortableColumnKey; label: string }[] = [
  { key: 'predictionScore', label: '예측점수' },
  { key: 'riskLevel', label: '위험도' },
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
          <col className="w-[20%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[42%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="px-3 pb-2 font-medium">회원번호</th>
            {SORTABLE_COLUMNS.map((column) => {
              const isActiveColumn = sortColumnKey === column.key;

              return (
                <th
                  key={column.key}
                  className="px-3 pb-2 text-center font-medium"
                >
                  <button
                    type="button"
                    onClick={() => onSortColumnClick(column.key)}
                    className={`inline-flex items-center gap-1 hover:text-gray-700 ${
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
            <th className="px-3 pb-2 font-medium">주요 이유</th>
            <th className="px-3 pb-2 text-right font-medium" />
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const topReason = getTopReason(customer);

            return (
              <tr
                key={customer.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="truncate px-3 py-3 font-medium">
                  <Link
                    to={`/customer-detail/${customer.id}`}
                    className="text-primary hover:underline"
                  >
                    {customer.id}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-gray-700">
                  {customer.predictionScore}
                </td>
                <td className="px-3 py-3 text-center">
                  <RiskIndicator riskLevel={customer.riskLevel} />
                </td>
                <td
                  className="truncate px-3 py-3 text-gray-500"
                  title={topReason.label}
                >
                  {topReason.label}
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    to={`/customer-detail/${customer.id}`}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-gray-600"
                  >
                    상세보기
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
