import type { ChurnRankingItem } from '@/features/card-analysis/churnRankingStats';

// 이탈률 막대의 최대치(%)
const CHURN_BAR_MAX_RATE = 25;
const HIGHLIGHTED_RANK_COUNT = 3;

const GRID_COLUMNS = 'grid-cols-[40px_minmax(0,1fr)_96px_130px]';

type ChurnRankingTableProps = {
  items: ChurnRankingItem[];
  selectedKey: string | null;
  onSelectItem: (key: string) => void;
};

export function ChurnRankingTable({
  items,
  selectedKey,
  onSelectItem,
}: ChurnRankingTableProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`grid ${GRID_COLUMNS} gap-2 border-b border-gray-100 px-3 py-2 text-xs text-gray-500`}
      >
        <span>순위</span>
        <span>카테고리</span>
        <span className="text-right">발급 회원 수</span>
        <span className="text-right">이탈률</span>
      </div>

      <div className="mt-1 flex flex-col gap-0.5">
        {items.map((item, itemIndex) => {
          const isSelected = item.key === selectedKey;
          const barWidth = Math.min(
            100,
            Math.round((item.churnRate / CHURN_BAR_MAX_RATE) * 100),
          );

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectItem(item.key)}
              className={`grid ${GRID_COLUMNS} min-h-[46px] items-center gap-2 rounded-lg px-3 text-left transition-colors ${
                isSelected ? 'bg-primary/[0.08]' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isSelected
                    ? 'text-primary'
                    : itemIndex < HIGHLIGHTED_RANK_COUNT
                      ? 'text-gray-900'
                      : 'text-gray-400'
                }`}
              >
                {itemIndex + 1}
              </span>
              <span
                className={`truncate text-sm ${
                  isSelected
                    ? 'font-bold text-primary'
                    : 'font-medium text-gray-900'
                }`}
              >
                {item.label}
              </span>
              <span className="text-right text-xs text-gray-700">
                {item.issuedCount.toLocaleString('ko-KR')}명
              </span>
              <div className="flex items-center justify-end gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-[#C3D0FF]'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span
                  className={`w-12 text-right text-xs font-bold ${
                    isSelected ? 'text-primary' : 'text-gray-900'
                  }`}
                >
                  {item.churnRate.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
