import type { ChurnRankingItem } from '@/features/card-analysis/churnRankingStats';

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
    <div className="max-h-[420px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="w-8 px-3 pb-2 font-medium">순위</th>
            <th className="px-3 pb-2 font-medium">이름</th>
            <th className="px-3 pb-2 text-right font-medium">발급 회원 수</th>
            <th className="px-3 pb-2 text-right font-medium">이탈률</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, itemIndex) => {
            const isSelected = item.key === selectedKey;

            return (
              <tr
                key={item.key}
                onClick={() => onSelectItem(item.key)}
                className={`cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-3 py-2.5 text-gray-400">{itemIndex + 1}</td>
                <td
                  className={`px-3 py-2.5 ${
                    isSelected ? 'font-medium text-primary' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-900">
                  {item.issuedCount.toLocaleString('ko-KR')}명
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                  {item.churnRate.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
