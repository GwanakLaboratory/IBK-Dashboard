import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { IbkCreditCardInfo, ProductUsageStat } from '@/types/churn';

export type SortableColumnKey =
  'issuedCount' | 'activeCount' | 'canceledCount' | 'churnRate';
export type SortDirection = 'asc' | 'desc';

type CardProductTableProps = {
  stats: ProductUsageStat[];
  cardInfoByName: Record<string, IbkCreditCardInfo>;
  sortColumnKey: SortableColumnKey;
  sortDirection: SortDirection;
  onSortColumnClick: (columnKey: SortableColumnKey) => void;
  onRowClick: (productName: string) => void;
};

const SORTABLE_COLUMNS: { key: SortableColumnKey; label: string }[] = [
  { key: 'issuedCount', label: '발급 회원 수' },
  { key: 'activeCount', label: '이용 회원 수' },
  { key: 'canceledCount', label: '해지 회원 수' },
  { key: 'churnRate', label: '이탈률' },
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

export function CardProductTable({
  stats,
  cardInfoByName,
  sortColumnKey,
  sortDirection,
  onSortColumnClick,
  onRowClick,
}: CardProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="px-3 pb-2 font-medium">카드 상품명</th>
            {SORTABLE_COLUMNS.map((column) => {
              const isActiveColumn = sortColumnKey === column.key;

              return (
                <th
                  key={column.key}
                  className="px-3 pb-2 text-right font-medium"
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
            <th className="px-3 pb-2 font-medium">브랜드</th>
            <th className="px-3 pb-2 font-medium">혜택 카테고리</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => {
            const cardInfo = cardInfoByName[stat.productName];
            const brandLabel = cardInfo?.brands.join(', ') ?? '-';
            const categoryLabel = cardInfo?.benefitCategories.join(', ') ?? '-';

            return (
              <tr
                key={stat.productName}
                onClick={() => onRowClick(stat.productName)}
                className="cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-3 py-2.5 font-medium text-primary">
                  {stat.productName}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-900">
                  {stat.issuedCount.toLocaleString('ko-KR')}명
                </td>
                <td className="px-3 py-2.5 text-right text-gray-900">
                  {stat.activeCount.toLocaleString('ko-KR')}명
                </td>
                <td className="px-3 py-2.5 text-right text-gray-900">
                  {stat.canceledCount.toLocaleString('ko-KR')}명
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                  {stat.churnRate.toFixed(1)}%
                </td>
                <td
                  className="max-w-[140px] truncate px-3 py-2.5 text-gray-500"
                  title={brandLabel}
                >
                  {brandLabel}
                </td>
                <td
                  className="max-w-[200px] truncate px-3 py-2.5 text-gray-500"
                  title={categoryLabel}
                >
                  {categoryLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
