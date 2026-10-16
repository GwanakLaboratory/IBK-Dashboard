import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Handshake,
  Info,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Dropdown } from '@/components/molecules/Dropdown';
import { MonthSelect } from '@/components/molecules/MonthSelect';
import { Tabs } from '@/components/molecules/Tabs';
import {
  ANALYSIS_MONTHS,
  AVERAGE_RISK_RATIO,
  CHANNEL_RISK_INCREASE,
  DEFAULT_ANALYSIS_FILTER,
  ISSUE_CHANNELS,
  RISK_RATIO_SCALE,
  STATIC_DIMENSIONS,
  adjustRatio,
  getFilterOffset,
  getProductRisks,
  type AnalysisFilter,
  type DimensionKey,
  type MarkTone,
} from '@/data/customerAnalysis';
import { ALL_FILTER } from '@/data/cards';
import { CARD_PRODUCTS } from '@/data/target';
import { cardName } from '@/i18n/domain';
import { formatFullMonth, formatNumber } from '@/i18n/format';

type Unit = 'ratio' | 'count';

const TONE_CLASS_NAME: Record<
  MarkTone,
  {
    bar: string;
    text: string;
    tint: string;
    border: string;
    row: string;
    focus: string;
  }
> = {
  red: {
    bar: 'bg-red-500',
    text: 'text-red-700',
    tint: 'bg-red-100',
    border: 'border-red-500',
    row: 'border-red-500 bg-red-50',
    focus: 'border-red-500 ring-4 ring-red-50',
  },
  blue: {
    bar: 'bg-blue-700',
    text: 'text-blue-700',
    tint: 'bg-blue-50',
    border: 'border-blue-700',
    row: 'border-blue-700 bg-blue-50/60',
    focus: 'border-blue-700 ring-4 ring-blue-50',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-700',
    tint: 'bg-amber-100',
    border: 'border-amber-500',
    row: 'border-amber-500 bg-amber-50',
    focus: 'border-amber-500 ring-4 ring-amber-50',
  },
};

type DimensionRow = {
  /** 구간 코드 또는 카드 상품 id */
  id: string;
  label: string;
  ratio: number;
  count: number;
  /** 누르면 이동할 경로 (상품만) */
  to?: string;
};

type DimensionView = {
  key: DimensionKey;
  title: string;
  rows: DimensionRow[];
  /** 강조할 행 id 와 색 */
  mark?: { id: string; tone: MarkTone };
  hasMore?: boolean;
};

function isSameFilter(a: AnalysisFilter, b: AnalysisFilter) {
  return (
    a.month === b.month && a.product === b.product && a.channel === b.channel
  );
}

export function CustomerAnalysisPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<AnalysisFilter>(DEFAULT_ANALYSIS_FILTER);
  const [applied, setApplied] = useState<AnalysisFilter>(
    DEFAULT_ANALYSIS_FILTER,
  );
  const [unit, setUnit] = useState<Unit>('ratio');
  const [openTip, setOpenTip] = useState<DimensionKey | null>(null);
  const [focused, setFocused] = useState<DimensionKey | null>(null);
  const focusTimerRef = useRef<number | undefined>(undefined);
  const cardRefs = useRef<Partial<Record<DimensionKey, HTMLElement | null>>>(
    {},
  );

  useEffect(() => () => window.clearTimeout(focusTimerRef.current), []);

  const offset = getFilterOffset(applied);
  // 바꾼 조건이 아직 반영되지 않았을 때만 조회 버튼을 켠다
  const isFilterChanged = !isSameFilter(draft, applied);
  // 고른 조건과 반영된 조건이 모두 기본값이면 초기화할 게 없다
  const isDefaultFilter =
    isSameFilter(draft, DEFAULT_ANALYSIS_FILTER) &&
    isSameFilter(applied, DEFAULT_ANALYSIS_FILTER);
  const products = getProductRisks(offset);
  const rankedProducts = products
    .filter((product) => !product.small)
    .sort((a, b) => b.ratio - a.ratio);
  const topProducts = rankedProducts.slice(0, 5);
  const topProduct = topProducts[0];

  const dimensions: DimensionView[] = [
    {
      key: 'product',
      title: t('customerAnalysis.dimension.title.product'),
      rows: topProducts.map((product) => ({
        id: product.id,
        label: cardName(product.id),
        ratio: product.ratio,
        count: Math.round((product.total * product.ratio) / 100),
        to: `/target/cards/${product.id}`,
      })),
      mark: { id: topProduct.id, tone: 'blue' },
      hasMore: true,
    },
    ...STATIC_DIMENSIONS.map((dimension) => ({
      key: dimension.key,
      title: t(`customerAnalysis.dimension.title.${dimension.key}`),
      mark: dimension.mark && {
        id: dimension.mark.segment,
        tone: dimension.mark.tone,
      },
      rows: dimension.rows.map(([segment, baseRatio, total]) => {
        const ratio = adjustRatio(baseRatio, offset);
        return {
          id: segment,
          label: t(`customerAnalysis.segment.${segment}`),
          ratio,
          count: Math.round((total * ratio) / 100),
        };
      }),
    })),
  ];

  // 그래프로 스크롤하고 잠깐 테두리로 강조한다
  const focusDimension = (key: DimensionKey) => {
    cardRefs.current[key]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    setFocused(key);
    window.clearTimeout(focusTimerRef.current);
    focusTimerRef.current = window.setTimeout(() => setFocused(null), 1800);
  };

  const tenureRatio = adjustRatio(27.2, offset);
  const channelRatio = adjustRatio(25.5, offset);
  const picks: {
    kind: string;
    subject: string;
    value: string;
    unit: string;
    badge: string;
    tone: MarkTone;
    Icon: LucideIcon;
    KindIcon: LucideIcon;
    dimension: DimensionKey;
  }[] = [
    {
      kind: t('customerAnalysis.picks.highestRatio.kind'),
      subject: t('customerAnalysis.picks.highestRatio.subject'),
      value: tenureRatio.toFixed(1),
      unit: '%',
      badge: t('customerAnalysis.picks.highestRatio.badge', {
        diff: (tenureRatio - AVERAGE_RISK_RATIO).toFixed(1),
      }),
      tone: 'red',
      Icon: Users,
      KindIcon: AlertTriangle,
      dimension: 'tenure',
    },
    {
      kind: t('customerAnalysis.picks.mostCustomers.kind'),
      subject: t('customerAnalysis.picks.mostCustomers.subject', {
        product: cardName(topProduct.id),
      }),
      value: formatNumber(
        Math.round((topProduct.total * topProduct.ratio) / 100),
      ),
      unit: t('customerAnalysis.picks.mostCustomers.unit'),
      badge: t('customerAnalysis.picks.mostCustomers.badge', {
        ratio: topProduct.ratio.toFixed(1),
      }),
      tone: 'blue',
      Icon: CreditCard,
      KindIcon: User,
      dimension: 'product',
    },
    {
      kind: t('customerAnalysis.picks.largestIncrease.kind'),
      subject: t('customerAnalysis.picks.largestIncrease.subject'),
      value: `+${CHANNEL_RISK_INCREASE.toFixed(1)}`,
      unit: '%p',
      badge: t('customerAnalysis.picks.largestIncrease.badge', {
        ratio: channelRatio.toFixed(1),
      }),
      tone: 'amber',
      Icon: Handshake,
      KindIcon: BarChart3,
      dimension: 'channel',
    },
  ];

  return (
    <>
      <PageHeader
        section="target"
        titleSize="lg"
        actions={
          <Link
            to="/target/members"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white pl-4 pr-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <Users className="size-4 text-slate-500" strokeWidth={2} />
            {t('customerAnalysis.membersLink')}
            <ChevronRight
              className="size-3.5 text-slate-400"
              strokeWidth={2.4}
            />
          </Link>
        }
      />

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-6 py-3.5">
        <FilterField label={t('customerAnalysis.filter.month')}>
          <MonthSelect
            align="left"
            value={draft.month}
            onChange={(month) => setDraft({ ...draft, month })}
            options={ANALYSIS_MONTHS.map((month) => ({
              value: month,
              label: formatFullMonth(month),
            }))}
          />
        </FilterField>
        <FilterDivider />
        <FilterField label={t('customerAnalysis.filter.product')}>
          <Dropdown
            label={t('customerAnalysis.filter.product')}
            size="md"
            // 고른 상품 이름 길이에 따라 필터 줄이 밀리지 않도록 너비를 고정한다 (긴 이름은 말줄임)
            className="w-60"
            value={draft.product}
            onChange={(value) =>
              setDraft({
                ...draft,
                product: value as AnalysisFilter['product'],
              })
            }
            options={[
              { value: ALL_FILTER, label: t('common.all') },
              ...CARD_PRODUCTS.map((card) => ({
                value: card.id,
                label: cardName(card.id),
              })),
            ]}
          />
        </FilterField>
        <FilterDivider />
        <FilterField label={t('customerAnalysis.filter.channel')}>
          <Dropdown
            label={t('customerAnalysis.filter.channel')}
            size="md"
            className="min-w-40"
            value={draft.channel}
            onChange={(value) =>
              setDraft({
                ...draft,
                channel: value as AnalysisFilter['channel'],
              })
            }
            options={ISSUE_CHANNELS.map((channel) => ({
              value: channel,
              label:
                channel === ALL_FILTER
                  ? t('common.all')
                  : t(`customerAnalysis.segment.${channel}`),
            }))}
          />
        </FilterField>
        <Button
          className="px-6"
          disabled={!isFilterChanged}
          onClick={() => setApplied(draft)}
        >
          {t('customerAnalysis.filter.search')}
        </Button>
        <Button
          variant="outline"
          disabled={isDefaultFilter}
          onClick={() => {
            setDraft(DEFAULT_ANALYSIS_FILTER);
            setApplied(DEFAULT_ANALYSIS_FILTER);
          }}
        >
          {t('customerAnalysis.filter.reset')}
        </Button>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className="size-1.5 rounded-full bg-green-500" />
          {t('customerAnalysis.filter.basis')}
        </span>
      </div>

      {/* 우선 관리 고객군 */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold">
            {t('customerAnalysis.picks.title')}
          </h2>
          <Note>{t('customerAnalysis.picks.note')}</Note>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {picks.map((pick) => {
            const tone = TONE_CLASS_NAME[pick.tone];
            const valueClassName =
              pick.tone === 'blue' ? 'text-slate-900' : tone.text;
            return (
              <button
                key={pick.kind}
                type="button"
                aria-label={t('customerAnalysis.picks.goToChart', {
                  kind: pick.kind,
                  subject: pick.subject,
                })}
                onClick={() => focusDimension(pick.dimension)}
                className="flex flex-col justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50/60"
              >
                <span className="flex min-w-0 items-center justify-center gap-6">
                  <span
                    className={`inline-flex size-[72px] shrink-0 items-center justify-center rounded-full ${tone.tint} ${tone.text}`}
                  >
                    <pick.Icon className="size-8" strokeWidth={1.8} />
                  </span>
                  <span className="flex min-w-0 flex-col items-start gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-lg font-bold ${tone.text}`}
                    >
                      <pick.KindIcon className="size-4" strokeWidth={2.2} />
                      {pick.kind}
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span
                        className={`text-5xl font-bold leading-none tracking-tight ${valueClassName}`}
                      >
                        {pick.value}
                      </span>
                      <span className={`text-xl font-bold ${valueClassName}`}>
                        {pick.unit}
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-sm font-bold text-gray-800">
                      {pick.subject}
                    </span>
                  </span>
                </span>
                {/* 기준 대비 수치는 카드 아래 가운데 테두리 배지로 */}
                <span
                  className={`inline-flex h-8 max-w-full items-center justify-center self-center truncate whitespace-nowrap rounded-full border bg-white px-4 text-sm font-bold ${tone.border} ${tone.text}`}
                >
                  {pick.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 특성별 이탈 위험 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">
            {t('customerAnalysis.dimensions.title')}
          </h2>
          <Tabs
            label={t('customerAnalysis.dimensions.unitTabs.label')}
            tabs={[
              {
                key: 'ratio',
                label: t('customerAnalysis.dimensions.unitTabs.ratio'),
              },
              {
                key: 'count',
                label: t('customerAnalysis.dimensions.unitTabs.count'),
              },
            ]}
            value={unit}
            onChange={setUnit}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {dimensions.map((dimension) => (
            <DimensionCard
              key={dimension.key}
              dimension={dimension}
              unit={unit}
              tipOpen={openTip === dimension.key}
              onToggleTip={() =>
                setOpenTip(openTip === dimension.key ? null : dimension.key)
              }
              focused={focused === dimension.key}
              onMore={() => navigate('/target/cards')}
              cardRef={(element) => {
                cardRefs.current[dimension.key] = element;
              }}
            />
          ))}
        </div>
        <Note>{t('customerAnalysis.dimensions.note')}</Note>
      </section>
    </>
  );
}

function DimensionCard({
  dimension,
  unit,
  tipOpen,
  onToggleTip,
  focused,
  onMore,
  cardRef,
}: {
  dimension: DimensionView;
  unit: Unit;
  tipOpen: boolean;
  onToggleTip: () => void;
  focused: boolean;
  onMore: () => void;
  cardRef: (element: HTMLElement | null) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const valueOf = (row: DimensionRow) =>
    unit === 'ratio' ? row.ratio : row.count;
  const maxValue = Math.max(...dimension.rows.map(valueOf));
  // 고객 수는 4,000명 단위로 올린 값을 막대 최대치로 쓴다
  const scale =
    unit === 'ratio' ? RISK_RATIO_SCALE : Math.ceil(maxValue / 4000) * 4000;
  const topRow = dimension.rows.reduce((best, row) =>
    valueOf(row) > valueOf(best) ? row : best,
  );
  const insight =
    unit === 'ratio'
      ? t('customerAnalysis.dimension.insight.ratio', {
          label: topRow.label,
          diff: (topRow.ratio - AVERAGE_RISK_RATIO).toFixed(1),
        })
      : t('customerAnalysis.dimension.insight.count', {
          label: topRow.label,
          value: formatNumber(topRow.count),
        });
  const focusTone = TONE_CLASS_NAME[dimension.mark?.tone ?? 'blue'];

  return (
    <section
      ref={cardRef}
      className={`flex min-w-0 scroll-m-6 flex-col gap-3 rounded-2xl border bg-white px-6 py-5 transition-all duration-300 ${
        focused ? focusTone.focus : 'border-slate-200 ring-4 ring-transparent'
      }`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="relative flex min-w-0 items-center gap-1">
          <h3 className="whitespace-nowrap text-lg font-bold">
            {dimension.title}
          </h3>
          <button
            type="button"
            aria-expanded={tipOpen}
            aria-label={t('customerAnalysis.dimension.showInsight', {
              title: dimension.title,
            })}
            onClick={onToggleTip}
            className={`inline-flex size-6 items-center justify-center rounded-full ${
              tipOpen ? 'bg-blue-50 text-blue-700' : 'text-slate-400'
            }`}
          >
            <CircleHelp className="size-4" strokeWidth={2} />
          </button>
          {tipOpen && (
            <span
              role="tooltip"
              className="absolute left-0 top-8 z-10 w-max max-w-xs rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium leading-normal text-white"
            >
              {insight}
            </span>
          )}
        </div>
        {dimension.hasMore && (
          <button
            type="button"
            aria-label={t('customerAnalysis.dimension.viewAllCards')}
            onClick={onMore}
            className="inline-flex h-7 shrink-0 items-center rounded-md pl-2 pr-1 text-xs font-bold text-blue-700 hover:bg-blue-50"
          >
            {t('customerAnalysis.dimension.viewAll')}
            <ChevronRight className="size-3.5" strokeWidth={2.4} />
          </button>
        )}
      </header>
      <div className="flex flex-col gap-1">
        {dimension.rows.map((row) => {
          const tone =
            dimension.mark?.id === row.id
              ? TONE_CLASS_NAME[dimension.mark.tone]
              : null;
          const isTop = row === topRow;
          const width = Math.min(100, (valueOf(row) / scale) * 100);
          const display =
            unit === 'ratio'
              ? `${Math.round(row.ratio)}%`
              : t('customerAnalysis.dimension.countValue', {
                  value: formatNumber(row.count),
                });
          const to = row.to;
          return (
            <button
              key={row.id}
              type="button"
              disabled={!to}
              aria-label={
                to
                  ? t('customerAnalysis.dimension.viewCardDetail', {
                      label: row.label,
                    })
                  : t('customerAnalysis.dimension.rowValue', {
                      label: row.label,
                      value: display,
                    })
              }
              onClick={to ? () => navigate(to) : undefined}
              className={`grid h-9 w-full grid-cols-[96px_minmax(0,1fr)_76px] items-center gap-3 rounded-lg border px-2.5 text-left disabled:cursor-default ${
                tone ? tone.row : 'border-transparent'
              } ${to ? 'hover:bg-slate-50' : ''}`}
            >
              <span
                className={`truncate text-xs ${tone ? `font-bold ${tone.text}` : 'font-medium text-slate-700'}`}
              >
                {row.label}
              </span>
              <span className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    tone ? tone.bar : isTop ? 'bg-blue-700' : 'bg-blue-100'
                  }`}
                  style={{ width: `${width.toFixed(1)}%` }}
                />
              </span>
              <span
                className={`whitespace-nowrap text-right text-sm font-bold ${
                  tone ? tone.text : isTop ? 'text-blue-700' : 'text-slate-600'
                }`}
              >
                {display}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <span className="whitespace-nowrap text-xs font-semibold text-slate-600">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterDivider() {
  return <span aria-hidden="true" className="h-5 w-px shrink-0 bg-slate-200" />;
}

function Note({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <Info className="size-4 shrink-0" strokeWidth={2} />
      {children}
    </span>
  );
}
