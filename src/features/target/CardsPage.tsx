import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { SearchInput } from '@/components/atoms/SearchInput';
import { DeltaBadge } from '@/components/domain/DeltaBadge';
import { RankBadge } from '@/components/domain/RankBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/molecules/Card';
import { Dropdown } from '@/components/molecules/Dropdown';
import { KpiStrip, type KpiItem } from '@/components/molecules/KpiStrip';
import { Tabs } from '@/components/molecules/Tabs';
import {
  ALL_FILTER,
  CARD_BENEFIT_CATEGORIES,
  CARD_BRANDS,
  CARD_TREND_MONTHS,
} from '@/data/cards';
import { CARD_PRODUCTS, type CardProduct } from '@/data/target';
import { brandLabel, benefitCategoryLabel, cardName } from '@/i18n/domain';
import { formatMonth, formatNumber } from '@/i18n/format';
import type { BenefitCategory, CardBrand, CardId } from '@/types/churn';
import { CardTag } from './CardTag';

type SortKey = 'rate' | 'members';

/** 정렬 탭 (문구는 cards.sort.<key>) */
const SORT_KEYS: SortKey[] = ['rate', 'members'];

// 혜택 카테고리는 긴 배지 2개 + '+N'이 잘리지 않을 만큼 최소 너비를 둔다
const ROW_GRID =
  'grid grid-cols-[40px_minmax(200px,1.6fr)_minmax(290px,1.4fr)_minmax(140px,1fr)_88px_128px] items-center gap-3 px-6';

// 혜택 카테고리 칸에 색 배지로 보여줄 개수 (나머지는 +N)
const SHOWN_TAG_COUNT = 2;

const toCardPath = (id: CardId) => `/target/cards/${id}`;

/** 전체 카드 평균 이탈률 % */
const averageRate =
  CARD_PRODUCTS.reduce((sum, card) => sum + card.churnRate, 0) /
  CARD_PRODUCTS.length;
const worstRate = [...CARD_PRODUCTS].sort(
  (a, b) => b.churnRate - a.churnRate,
)[0];
const worstMix = [...CARD_PRODUCTS].sort(
  (a, b) => b.highShare + b.mediumShare - (a.highShare + a.mediumShare),
)[0];

/** 전월 ('YY.MM') */
const PREVIOUS_MONTH = CARD_TREND_MONTHS[CARD_TREND_MONTHS.length - 2];

export function CardsPage() {
  const { t } = useTranslation();
  // 검색어는 입력(draft)과 조회 적용(query)을 나눈다 (회원 검색과 같은 방식)
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState<string>(ALL_FILTER);
  const [category, setCategory] = useState<string>(ALL_FILTER);
  const [sortKey, setSortKey] = useState<SortKey>('rate');

  const keyword = query.trim();
  const applyQuery = () => setQuery(draft.trim());
  const resetFilter = () => {
    setDraft('');
    setQuery('');
    setBrand(ALL_FILTER);
    setCategory(ALL_FILTER);
    setSortKey('rate');
  };

  const kpis: KpiItem[] = [
    {
      label: t('cards.kpi.totalProducts.label'),
      labelClassName: 'text-blue-700',
      value: String(CARD_PRODUCTS.length),
      unit: t('cards.kpi.totalProducts.unit'),
      sub: t('cards.kpi.totalProducts.sub'),
    },
    {
      label: t('cards.kpi.averageRate.label'),
      value: averageRate.toFixed(1),
      unit: '%',
      badge: <DeltaBadge delta={0.1} size="md" />,
      sub: t('cards.kpi.averageRate.sub', {
        month: formatMonth(PREVIOUS_MONTH),
        rate: (averageRate - 0.1).toFixed(1),
      }),
    },
    {
      label: t('cards.kpi.worstRate.label'),
      labelClassName: 'text-red-700',
      value: worstRate.churnRate.toFixed(1),
      unit: '%',
      badge: <DeltaBadge delta={worstRate.churnRateDelta} size="md" />,
      sub: cardName(worstRate.id),
      to: toCardPath(worstRate.id),
    },
    {
      label: t('cards.kpi.worstRiskShare.label'),
      labelClassName: 'text-red-700',
      value: (worstMix.highShare + worstMix.mediumShare).toFixed(1),
      unit: '%',
      sub: t('cards.kpi.worstRiskShare.sub', { name: cardName(worstMix.id) }),
      to: toCardPath(worstMix.id),
    },
  ];

  const lowerKeyword = keyword.toLowerCase();
  const rows = CARD_PRODUCTS.filter(
    (card) =>
      (category === ALL_FILTER ||
        card.tags.includes(category as BenefitCategory)) &&
      (brand === ALL_FILTER || card.brands.includes(brand as CardBrand)) &&
      (!keyword || cardName(card.id).toLowerCase().includes(lowerKeyword)),
  ).sort((a, b) =>
    sortKey === 'rate' ? b.churnRate - a.churnRate : b.members - a.members,
  );

  return (
    <>
      <PageHeader
        section="target"
        titleSize="lg"
        eyebrow={t('cards.header.eyebrow')}
        title={t('cards.header.title')}
        description={t('cards.header.description', {
          count: CARD_PRODUCTS.length,
        })}
        back={{ label: t('layout.sidebar.nav.target'), to: '/target' }}
        // 데이터 기준일·기준 월 표시는 이 화면에서 쓰지 않는다
        actions={false}
      />
      <KpiStrip size="xl" items={kpis} />

      <Card flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <SearchInput
              aria-label={t('cards.search.label')}
              placeholder={t('cards.search.placeholder')}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyQuery();
              }}
            />
            <Button className="px-6" onClick={applyQuery}>
              {t('cards.search.submit')}
            </Button>
            <Button variant="outline" onClick={resetFilter}>
              {t('cards.search.reset')}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Dropdown
                label={t('cards.filter.brand.label')}
                value={brand}
                onChange={setBrand}
                options={[
                  { value: ALL_FILTER, label: t('cards.filter.brand.all') },
                  ...CARD_BRANDS.map((item) => ({
                    value: item,
                    label: brandLabel(item),
                  })),
                ]}
              />
              <Dropdown
                label={t('cards.filter.category.label')}
                value={category}
                onChange={setCategory}
                options={[
                  { value: ALL_FILTER, label: t('cards.filter.category.all') },
                  ...CARD_BENEFIT_CATEGORIES.map((item) => ({
                    value: item,
                    label: benefitCategoryLabel(item),
                  })),
                ]}
              />
              {keyword && (
                <span className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-50 pl-3 pr-1.5 text-xs font-semibold text-blue-700">
                  {t('cards.search.chip', { keyword })}
                  <button
                    type="button"
                    aria-label={t('cards.search.clear')}
                    onClick={() => {
                      setQuery('');
                      setDraft('');
                    }}
                    className="inline-flex size-5 items-center justify-center rounded-full"
                  >
                    <X className="size-3" strokeWidth={2.6} />
                  </button>
                </span>
              )}
            </div>
            <Tabs
              label={t('cards.sort.label')}
              tabs={SORT_KEYS.map((key) => ({
                key,
                label: t(`cards.sort.${key}`),
              }))}
              value={sortKey}
              onChange={setSortKey}
            />
          </div>
        </div>

        <div
          className={`${ROW_GRID} h-11 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500`}
        >
          <span>{t('cards.table.column.rank')}</span>
          <span>{t('cards.table.column.name')}</span>
          <span>{t('cards.table.column.category')}</span>
          <span>{t('cards.table.column.brand')}</span>
          <span className="text-right">{t('cards.table.column.members')}</span>
          <span className="text-right">
            {t('cards.table.column.churnRate')}
          </span>
        </div>
        {rows.map((card, index) => (
          <CardRow key={card.id} card={card} rank={index + 1} />
        ))}
        {rows.length === 0 && (
          <div className="flex h-36 items-center justify-center text-sm text-slate-500">
            {t('cards.table.empty')}
          </div>
        )}
        <div className="px-6 py-3.5 text-xs text-slate-500">
          {t('cards.table.footer', {
            total: CARD_PRODUCTS.length,
            count: rows.length,
          })}
        </div>
      </Card>
    </>
  );
}

function CardRow({ card, rank }: { card: CardProduct; rank: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const name = cardName(card.id);
  const delta = card.churnRateDelta;
  const deltaLabel =
    delta === 0 ? '–' : `${delta > 0 ? '▲' : '▼'}${Math.abs(delta).toFixed(1)}`;
  const deltaClassName =
    delta > 0
      ? 'text-red-600'
      : delta < 0
        ? 'text-green-700'
        : 'text-slate-400';
  const shownTags = card.tags.slice(0, SHOWN_TAG_COUNT);
  const restCount = card.tags.length - shownTags.length;

  return (
    <div
      onClick={() => navigate(toCardPath(card.id))}
      className={`${ROW_GRID} min-h-14 cursor-pointer border-b border-slate-100 py-2 text-xs hover:bg-slate-50`}
    >
      <RankBadge rank={rank} highlight="dark" size="md" />
      <Link
        to={toCardPath(card.id)}
        aria-label={t('common.action.viewDetail', { name })}
        title={name}
        className="truncate text-sm font-bold text-slate-900 hover:underline"
      >
        {name}
      </Link>
      {/* 앞의 두 카테고리만 색 배지로, 나머지는 +N (전체는 툴팁) */}
      <span
        className="flex min-w-0 items-center gap-1"
        title={card.tags.map(benefitCategoryLabel).join(', ')}
      >
        {shownTags.map((tag) => (
          <CardTag key={tag} category={tag} />
        ))}
        {restCount > 0 && (
          <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-slate-200 px-2 text-xs font-bold text-slate-500">
            +{restCount}
          </span>
        )}
      </span>
      <span className="leading-snug text-slate-700">
        {card.brands.map(brandLabel).join(' · ')}
      </span>
      <span className="text-right font-bold text-slate-900">
        {formatNumber(card.members)}
      </span>
      <span className="flex items-baseline justify-end gap-1.5">
        <span
          className={`text-base font-bold ${card.churnRate >= averageRate ? 'text-red-600' : 'text-slate-900'}`}
        >
          {card.churnRate.toFixed(1)}%
        </span>
        <span className={`text-xs font-bold ${deltaClassName}`}>
          {deltaLabel}
        </span>
      </span>
    </div>
  );
}
