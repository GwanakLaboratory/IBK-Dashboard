type RankBadgeProps = {
  rank: number;
  /** 1위 강조 색 */
  highlight?: 'red' | 'dark';
  size?: 'sm' | 'md';
};

const HIGHLIGHT_CLASS_NAME = {
  red: 'bg-red-500 text-white',
  dark: 'bg-slate-900 text-white',
};

/** 순위 동그라미. 1위만 강조색으로 채운다. */
export function RankBadge({
  rank,
  highlight = 'red',
  size = 'sm',
}: RankBadgeProps) {
  const sizeClassName = size === 'sm' ? 'size-5 text-2xs' : 'size-6 text-xs';
  const colorClassName =
    rank === 1
      ? HIGHLIGHT_CLASS_NAME[highlight]
      : 'bg-slate-100 text-slate-500';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClassName} ${colorClassName}`}
    >
      {rank}
    </span>
  );
}
