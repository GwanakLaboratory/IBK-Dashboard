import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { RISK_LEVEL_META, RISK_LEVEL_ORDER } from '@/utils/risk';
import type {
  IbkCreditCardInfo,
  ProductUsageStat,
  RiskLevel,
} from '@/types/churn';

export type SortableColumnKey = 'activeCount' | 'churnRate';
export type SortDirection = 'asc' | 'desc';

type CardProductTableProps = {
  stats: ProductUsageStat[];
  cardInfoByName: Record<string, IbkCreditCardInfo>;
  /** 이탈률 막대의 100% 기준. 필터와 상관없이 전체 상품 기준으로 넘긴다. */
  maxChurnRate: number;
  sortColumnKey: SortableColumnKey;
  sortDirection: SortDirection;
  onSortColumnClick: (columnKey: SortableColumnKey) => void;
  onRowClick: (productName: string) => void;
};

// 혜택 카테고리는 최대 8개까지 있어서, 앞의 몇 개만 뱃지로 보여주고 나머지는 +N 으로 접는다.
const VISIBLE_CATEGORY_COUNT = 2;
// 이 이상이면 이탈률을 강조색으로 표시한다.
const HIGH_CHURN_RATE = 20;

const RISK_COUNT_KEY: Record<
  RiskLevel,
  'lowRiskCount' | 'mediumRiskCount' | 'highRiskCount'
> = {
  low: 'lowRiskCount',
  medium: 'mediumRiskCount',
  high: 'highRiskCount',
};

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

function SortableHeader({
  columnKey,
  label,
  sortColumnKey,
  sortDirection,
  onSortColumnClick,
  align,
}: {
  columnKey: SortableColumnKey;
  label: string;
  sortColumnKey: SortableColumnKey;
  sortDirection: SortDirection;
  onSortColumnClick: (columnKey: SortableColumnKey) => void;
  align: 'left' | 'right';
}) {
  const isActiveColumn = sortColumnKey === columnKey;

  return (
    <th
      className={`px-3 py-3 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}
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
        onClick={() => onSortColumnClick(columnKey)}
        className={`inline-flex items-center gap-1 hover:text-gray-900 ${
          isActiveColumn ? 'text-gray-900' : ''
        }`}
      >
        {label}
        <SortIndicatorIcon
          direction={isActiveColumn ? sortDirection : 'none'}
        />
      </button>
    </th>
  );
}

export function CardProductTable({
  stats,
  cardInfoByName,
  maxChurnRate,
  sortColumnKey,
  sortDirection,
  onSortColumnClick,
  onRowClick,
}: CardProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F7F8FA] text-left text-xs text-gray-600">
            <th className="py-3 pl-5 pr-3 font-semibold">상품명</th>
            <th className="px-3 py-3 font-semibold">혜택 카테고리</th>
            <th className="px-3 py-3 font-semibold">브랜드</th>
            <SortableHeader
              columnKey="activeCount"
              label="보유 회원"
              align="right"
              sortColumnKey={sortColumnKey}
              sortDirection={sortDirection}
              onSortColumnClick={onSortColumnClick}
            />
            <SortableHeader
              columnKey="churnRate"
              label="이탈률"
              align="left"
              sortColumnKey={sortColumnKey}
              sortDirection={sortDirection}
              onSortColumnClick={onSortColumnClick}
            />
            <th className="w-[200px] py-3 pl-3 pr-5 font-semibold">
              위험도 구성
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => {
            const cardInfo = cardInfoByName[stat.productName];
            const categories = cardInfo?.benefitCategories ?? [];
            const visibleCategories = categories.slice(
              0,
              VISIBLE_CATEGORY_COUNT,
            );
            const hiddenCategories = categories.slice(VISIBLE_CATEGORY_COUNT);
            const isHighChurn = stat.churnRate >= HIGH_CHURN_RATE;
            const riskTitle = RISK_LEVEL_ORDER.map((riskLevel) => {
              const ratio =
                stat.activeCount === 0
                  ? 0
                  : (stat[RISK_COUNT_KEY[riskLevel]] / stat.activeCount) * 100;
              return `${RISK_LEVEL_META[riskLevel].label} ${ratio.toFixed(1)}%`;
            }).join(' · ');

            return (
              <tr
                key={stat.productName}
                onClick={() => onRowClick(stat.productName)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    onRowClick(stat.productName);
                  }
                }}
                tabIndex={0}
                className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
              >
                <td className="whitespace-nowrap py-3 pl-5 pr-3 font-semibold text-gray-900">
                  {stat.productName}
                </td>
                <td className="px-3 py-3">
                  <div
                    className="flex items-center gap-1.5"
                    title={categories.join(', ')}
                  >
                    {visibleCategories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md bg-indigo-50 px-2 text-xs text-indigo-800"
                      >
                        {category}
                      </span>
                    ))}
                    {hiddenCategories.length > 0 && (
                      <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold text-gray-500">
                        +{hiddenCategories.length}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(cardInfo?.brands ?? []).map((brand) => (
                      <span
                        key={brand}
                        className="inline-flex h-[22px] items-center rounded border border-gray-200 bg-white px-1.5 text-[11px] font-bold text-gray-600"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-gray-900">
                  {stat.activeCount.toLocaleString('ko-KR')}명
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${isHighChurn ? 'bg-red-500' : 'bg-red-300'}`}
                        style={{
                          width: `${(stat.churnRate / maxChurnRate) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`w-11 text-right font-bold ${isHighChurn ? 'text-red-700' : 'text-gray-900'}`}
                    >
                      {stat.churnRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 pl-3 pr-5">
                  <div
                    className="flex h-2.5 overflow-hidden rounded-sm"
                    title={riskTitle}
                    aria-label={riskTitle}
                    role="img"
                  >
                    {RISK_LEVEL_ORDER.map((riskLevel) => (
                      <div
                        key={riskLevel}
                        className="h-full"
                        style={{
                          width: `${stat.activeCount === 0 ? 0 : (stat[RISK_COUNT_KEY[riskLevel]] / stat.activeCount) * 100}%`,
                          backgroundColor:
                            RISK_LEVEL_META[riskLevel].chartColor,
                        }}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
