import { useTranslation } from 'react-i18next';
import { benefitCategoryLabel } from '@/i18n/domain';
import type { BenefitCategory } from '@/types/churn';

/** 혜택 카테고리별 배지 색 (없는 카테고리는 회색) */
const TAG_CLASS_NAME: Partial<Record<BenefitCategory, string>> = {
  specialService: 'bg-blue-50 text-blue-700',
  transportTelecomFuelCar: 'bg-teal-50 text-teal-700',
  reward: 'bg-amber-100 text-amber-700',
  living: 'bg-green-100 text-green-700',
  shoppingFashionBeauty: 'bg-pink-100 text-pink-700',
  cultureShows: 'bg-sky-100 text-sky-700',
  cafeDining: 'bg-orange-100 text-orange-700',
};

type CardTagProps = {
  category: BenefitCategory;
  size?: 'sm' | 'md';
};

/** 카드 혜택 카테고리 색 배지 */
export function CardTag({ category, size = 'md' }: CardTagProps) {
  // 언어를 바꾸면 다시 그리도록 구독한다
  useTranslation();

  return (
    <span
      className={`inline-flex min-w-0 items-center truncate whitespace-nowrap rounded-full font-bold ${
        size === 'sm' ? 'h-6 px-2.5 text-2xs' : 'h-7 px-2.5 text-xs'
      } ${TAG_CLASS_NAME[category] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {benefitCategoryLabel(category)}
    </span>
  );
}
