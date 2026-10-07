import { X } from 'lucide-react';
import { useState } from 'react';
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
import { CARD_BENEFIT_CATEGORIES, CARD_BRANDS } from '@/data/cards';
import { CARD_PRODUCTS, type CardProduct } from '@/data/target';
import { CardTag } from './CardTag';

type SortKey = 'rate' | 'members';

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'rate', label: '이탈률 높은 순' },
  { key: 'members', label: '보유 회원 많은 순' },
];

const ROW_GRID =
  'grid grid-cols-[40px_minmax(200px,2fr)_minmax(160px,1.2fr)_minmax(120px,1fr)_110px_120px] items-center gap-3 px-6';

const toCardPath = (name: string) =>
  `/target/cards/${encodeURIComponent(name)}`;

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

const CARD_KPIS: KpiItem[] = [
  {
    label: '전체 카드 상품',
    labelClassName: 'text-blue-700',
    value: String(CARD_PRODUCTS.length),
    unit: '개',
    sub: '신용카드 · 판매 중 상품 기준',
  },
  {
    label: '평균 이탈률',
    value: averageRate.toFixed(1),
    unit: '%',
    badge: <DeltaBadge delta={0.1} size="md" />,
    sub: `전월 대비 (8월 ${(averageRate - 0.1).toFixed(1)}%)`,
  },
  {
    label: '이탈률 가장 높은 상품',
    labelClassName: 'text-red-700',
    value: worstRate.churnRate.toFixed(1),
    unit: '%',
    badge: <DeltaBadge delta={worstRate.churnRateDelta} size="md" />,
    sub: worstRate.name,
  },
  {
    label: '위험 회원 비중 가장 높은 상품',
    labelClassName: 'text-red-700',
    value: (worstMix.highShare + worstMix.mediumShare).toFixed(1),
    unit: '%',
    sub: `${worstMix.name} · 위험 + 중위험 회원`,
  },
];

export function CardsPage() {
  // 검색어는 입력(draft)과 조회 적용(query)을 나눈다 (회원 검색과 같은 방식)
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('전체');
  const [category, setCategory] = useState('전체');
  const [sortKey, setSortKey] = useState<SortKey>('rate');

  const keyword = query.trim();
  const applyQuery = () => setQuery(draft.trim());
  const resetFilter = () => {
    setDraft('');
    setQuery('');
    setBrand('전체');
    setCategory('전체');
    setSortKey('rate');
  };

  const rows = CARD_PRODUCTS.filter(
    (card) =>
      (category === '전체' || card.tags.includes(category)) &&
      (brand === '전체' || card.brands.includes(brand)) &&
      (!keyword || card.name.includes(keyword)),
  ).sort((a, b) =>
    sortKey === 'rate' ? b.churnRate - a.churnRate : b.members - a.members,
  );

  return (
    <>
      <PageHeader
        section="target"
        titleSize="lg"
        eyebrow="RISK TARGET · 카드 상품"
        title="카드 상품별 이탈 위험"
        description={`${CARD_PRODUCTS.length}개 상품의 이탈률을 한눈에 비교해요`}
        back={{ label: '고객 분석', to: '/target' }}
        // 데이터 기준일·기준 월 표시는 이 화면에서 쓰지 않는다
        actions={false}
      />
      <KpiStrip size="xl" items={CARD_KPIS} />

      <Card flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <SearchInput
              aria-label="상품명 검색"
              placeholder="상품명을 입력하세요"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyQuery();
              }}
            />
            <Button className="px-6" onClick={applyQuery}>
              조회
            </Button>
            <Button variant="outline" onClick={resetFilter}>
              초기화
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Dropdown
                label="브랜드"
                value={brand}
                onChange={setBrand}
                options={CARD_BRANDS.map((item) => ({
                  value: item,
                  label: item === '전체' ? '전체 브랜드' : item,
                }))}
              />
              <Dropdown
                label="혜택 카테고리"
                value={category}
                onChange={setCategory}
                options={CARD_BENEFIT_CATEGORIES.map((item) => ({
                  value: item,
                  label: item === '전체' ? '전체 혜택 카테고리' : item,
                }))}
              />
              {keyword && (
                <span className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-50 pl-3 pr-1.5 text-xs font-semibold text-blue-700">
                  상품명 · {keyword}
                  <button
                    type="button"
                    aria-label="검색어 지우기"
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
              label="정렬"
              tabs={SORT_TABS}
              value={sortKey}
              onChange={setSortKey}
            />
          </div>
        </div>

        <div
          className={`${ROW_GRID} h-11 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500`}
        >
          <span>순위</span>
          <span>상품명</span>
          <span>혜택 카테고리</span>
          <span>브랜드</span>
          <span className="text-right">보유 회원</span>
          <span className="text-right">이탈률</span>
        </div>
        {rows.map((card, index) => (
          <CardRow key={card.name} card={card} rank={index + 1} />
        ))}
        {rows.length === 0 && (
          <div className="flex h-36 items-center justify-center text-sm text-slate-500">
            조건에 맞는 카드 상품이 없어요
          </div>
        )}
        <div className="px-6 py-3.5 text-xs text-slate-500">
          전체 {CARD_PRODUCTS.length}개 중 {rows.length}개 표시
        </div>
      </Card>
    </>
  );
}

function CardRow({ card, rank }: { card: CardProduct; rank: number }) {
  const navigate = useNavigate();
  const delta = card.churnRateDelta;
  const deltaLabel =
    delta === 0 ? '–' : `${delta > 0 ? '▲' : '▼'}${Math.abs(delta).toFixed(1)}`;
  const deltaClassName =
    delta > 0
      ? 'text-red-600'
      : delta < 0
        ? 'text-green-700'
        : 'text-slate-400';
  const [firstTag, ...restTags] = card.tags;

  return (
    <div
      onClick={() => navigate(toCardPath(card.name))}
      className={`${ROW_GRID} min-h-14 cursor-pointer border-b border-slate-100 py-2 text-xs hover:bg-slate-50`}
    >
      <RankBadge rank={rank} highlight="dark" size="md" />
      <Link
        to={toCardPath(card.name)}
        aria-label={`${card.name} 상세 보기`}
        className="truncate text-sm font-bold text-slate-900 hover:underline"
      >
        {card.name}
      </Link>
      {/* 첫 카테고리만 색 배지로, 나머지는 +N (전체는 툴팁) */}
      <span
        className="flex min-w-0 items-center gap-1"
        title={card.tags.join(', ')}
      >
        {firstTag && <CardTag label={firstTag} />}
        {restTags.length > 0 && (
          <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-slate-200 px-2 text-xs font-bold text-slate-500">
            +{restTags.length}
          </span>
        )}
      </span>
      <span className="leading-snug text-slate-700">
        {card.brands.join(' · ')}
      </span>
      <span className="text-right font-bold text-slate-900">
        {card.members.toLocaleString('ko-KR')}
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
