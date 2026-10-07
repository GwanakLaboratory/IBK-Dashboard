/** 혜택 카테고리별 배지 색 (없는 카테고리는 회색) */
const TAG_CLASS_NAME: Record<string, string> = {
  특화서비스: 'bg-blue-50 text-blue-700',
  '교통/통신/주유/자동차': 'bg-teal-50 text-teal-700',
  리워드: 'bg-amber-100 text-amber-700',
  생활: 'bg-green-100 text-green-700',
  '쇼핑/패션/뷰티/미용': 'bg-pink-100 text-pink-700',
  '공연/문화': 'bg-sky-100 text-sky-700',
  '카페/외식': 'bg-orange-100 text-orange-700',
};

type CardTagProps = {
  label: string;
  size?: 'sm' | 'md';
};

/** 카드 혜택 카테고리 색 배지 */
export function CardTag({ label, size = 'md' }: CardTagProps) {
  return (
    <span
      className={`inline-flex min-w-0 items-center truncate whitespace-nowrap rounded-full font-bold ${
        size === 'sm' ? 'h-6 px-2.5 text-2xs' : 'h-7 px-2.5 text-xs'
      } ${TAG_CLASS_NAME[label] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {label}
    </span>
  );
}
