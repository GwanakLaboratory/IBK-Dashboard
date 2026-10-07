import { RankBadge } from '@/components/domain/RankBadge';

export type RankedBarItem = {
  label: string;
  /** 막대 길이 (0–100, %) */
  barPercent: number;
  /** 오른쪽에 보여줄 값 */
  display: string;
};

type RankedBarListProps = {
  items: RankedBarItem[];
  /** 1위 강조색 */
  accent?: 'red' | 'blue';
  /** 순위 배지 표시 여부 */
  showRank?: boolean;
  /** 이름 칸 너비 (기본 w-40) */
  labelClassName?: string;
  /** 값 칸 너비 (기본 w-16) */
  valueClassName?: string;
};

const ACCENT = {
  red: { bar: 'bg-red-500', text: 'text-red-600' },
  blue: { bar: 'bg-blue-700', text: 'text-blue-700' },
};

/** 순위 + 이름 + 가로 막대 + 값 목록. 1위만 강조색, 나머지는 연파랑. */
export function RankedBarList({
  items,
  accent = 'red',
  showRank = true,
  labelClassName = 'w-40',
  valueClassName = 'w-16',
}: RankedBarListProps) {
  return (
    <ul className="flex grow flex-col justify-around gap-1.5">
      {items.map((item, index) => {
        const isTop = index === 0;
        return (
          <li key={item.label} className="flex min-h-8 items-center gap-3">
            {showRank && <RankBadge rank={index + 1} />}
            <span
              className={`shrink-0 truncate text-xs text-gray-900 ${labelClassName} ${isTop ? 'font-bold' : 'font-medium'}`}
            >
              {item.label}
            </span>
            <div className="h-2.5 grow overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${isTop ? ACCENT[accent].bar : 'bg-blue-300'}`}
                style={{ width: `${Math.min(100, item.barPercent)}%` }}
              />
            </div>
            <span
              className={`shrink-0 text-right text-sm font-bold ${valueClassName} ${isTop ? ACCENT[accent].text : 'text-gray-900'}`}
            >
              {item.display}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
