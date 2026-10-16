import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { SearchInput } from '@/components/atoms/SearchInput';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { ScoreBar } from '@/components/domain/ScoreBar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Card } from '@/components/molecules/Card';
import { Pagination } from '@/components/molecules/Pagination';
import { Tabs } from '@/components/molecules/Tabs';
import {
  downloadTargetCsv,
  memberCsvRow,
} from '@/features/marketing/campaign/targetCsv';
import { ALL_FILTER } from '@/data/cards';
import {
  CARD_PRODUCTS,
  MEMBER_COUNT_BY_LEVEL,
  TARGET_MEMBERS,
  getMemberPhone,
  type TargetMember,
} from '@/data/target';
import {
  cardName,
  churnReasonLabel,
  memberNameLabel,
  riskLevelLabel,
} from '@/i18n/domain';
import { formatNumber } from '@/i18n/format';
import type { CardId, RiskLevel } from '@/types/churn';
import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';

type LevelFilter = 'all' | RiskLevel;
type QueryMode = 'name' | 'phone' | 'id';
type SortKey = 'id' | 'score' | 'idle';

/** 카드상품 필터: 'all' 또는 카드 상품 id */
type ProductFilter = typeof ALL_FILTER | CardId;

const PAGE_SIZE = 10;
// 열 너비는 내용 폭에 맞춰 두고(카드상품·주요 이유는 최대 너비까지만 늘어남),
// 화면이 넓을 때 남는 폭은 justify-between 으로 열 사이 간격에 고르게 나눈다.
const GRID_COLUMNS =
  'grid-cols-[84px_60px_112px_minmax(120px,200px)_112px_96px_minmax(120px,170px)_56px] justify-between';

// 문구는 화면에서 members.summary.<key> 로 바꾼다
const LEVEL_CARDS: LevelFilter[] = ['all', 'high', 'medium', 'low'];

const QUERY_MODES: QueryMode[] = ['name', 'phone', 'id'];

const RISK_LEVELS: RiskLevel[] = ['high', 'medium', 'low'];

const SORT_KEYS: SortKey[] = ['id', 'score', 'idle'];

const DEFAULT_SORT: SortKey = 'id';

/** 'C-001024' → 1024 (회원번호 순 정렬용) */
const memberNumber = (member: TargetMember) =>
  Number(member.id.replace(/\D/g, ''));

// 값이 같으면 회원번호 순으로 이어서 정렬해 순서가 늘 같게 한다
const SORT_COMPARE: Record<
  SortKey,
  (a: TargetMember, b: TargetMember) => number
> = {
  id: (a, b) => memberNumber(a) - memberNumber(b),
  score: (a, b) => b.score - a.score || memberNumber(a) - memberNumber(b),
  idle: (a, b) =>
    b.idleDays - a.idleDays ||
    b.score - a.score ||
    memberNumber(a) - memberNumber(b),
};

const isCardId = (value: string | null): value is CardId =>
  CARD_PRODUCTS.some((card) => card.id === value);

/** 이름 비교용: 마스킹(*)과 공백을 빼고 소문자로 */
const normalizeName = (value: string) =>
  value.replace(/[*\s]/g, '').toLowerCase();

function matchQuery(member: TargetMember, mode: QueryMode, query: string) {
  if (!query) return true;
  if (mode === 'phone') {
    const digits = query.replace(/\D/g, '');
    return (
      !!digits &&
      getMemberPhone(member).replace(/\D/g, '').slice(-digits.length) ===
        digits.slice(-4)
    );
  }
  if (mode === 'id')
    return member.id.toUpperCase().includes(query.toUpperCase());
  // 화면에 보이는 (현재 언어) 이름으로 찾고, 회원번호로도 찾을 수 있게 한다
  const name = memberNameLabel(member.name);
  return (
    normalizeName(name).includes(normalizeName(query)) ||
    name.includes(query) ||
    member.id.toUpperCase().includes(query.toUpperCase())
  );
}

export function MembersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get('product');

  const [level, setLevel] = useState<LevelFilter>('all');
  const [product, setProduct] = useState<ProductFilter>(
    isCardId(initialProduct) ? initialProduct : ALL_FILTER,
  );
  const [queryMode, setQueryMode] = useState<QueryMode>('name');
  const [draft, setDraft] = useState('');
  const [applied, setApplied] = useState<{ mode: QueryMode; query: string }>({
    mode: 'name',
    query: '',
  });
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  // 이름 검색은 현재 언어 이름으로 하므로 언어가 바뀌어도 맞도록 렌더마다 거른다 (회원 수가 적어 가볍다)
  const filtered = TARGET_MEMBERS.filter(
    (member) =>
      (level === 'all' || getRiskLevelFromScore(member.score) === level) &&
      (product === ALL_FILTER || member.productId === product) &&
      matchQuery(member, applied.mode, applied.query),
  ).sort(SORT_COMPARE[sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const currentModeLabel = t(`members.search.mode.${queryMode}.label`);
  const appliedModeLabel = t(`members.search.mode.${applied.mode}.label`);

  // 필터가 바뀌면 첫 페이지로
  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  // 입력한 검색어가 아직 반영되지 않았을 때만 조회 버튼을 켠다.
  // 검색어가 비어 있으면 검색 기준(이름/번호)만 바꿔도 결과가 같다.
  const pendingQuery = draft.trim();
  const isQueryChanged =
    pendingQuery !== applied.query ||
    (pendingQuery !== '' && queryMode !== applied.mode);
  // 모든 조건이 처음 상태면 초기화할 게 없다
  const isDefaultFilter =
    level === 'all' &&
    product === ALL_FILTER &&
    queryMode === 'name' &&
    draft === '' &&
    applied.query === '' &&
    sort === DEFAULT_SORT;

  const applyQuery = () => {
    setApplied({ mode: queryMode, query: draft.trim() });
    setPage(1);
  };

  const resetFilter = () => {
    setLevel('all');
    setProduct(ALL_FILTER);
    setQueryMode('name');
    setDraft('');
    setApplied({ mode: 'name', query: '' });
    setSort(DEFAULT_SORT);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        section="target"
        eyebrow={t('members.header.eyebrow')}
        titleSize="lg"
        title={t('members.header.title')}
        description={t('members.header.description')}
        back={{ label: t('members.header.back'), to: '/target' }}
        // 데이터 기준일·기준 월 표시는 이 화면에서 쓰지 않는다
        actions={false}
      />

      <div className="grid grid-cols-4 gap-4">
        {LEVEL_CARDS.map((card) => {
          // 카드상품으로 걸러 보고 있으면 '분석 대상 전체'가 아니므로 전체 카드는 선택 표시를 하지 않는다
          const selected =
            card === level && !(card === 'all' && product !== ALL_FILTER);
          const count = MEMBER_COUNT_BY_LEVEL[card];
          const meta = card === 'all' ? null : RISK_LEVEL_META[card];
          return (
            <button
              key={card}
              type="button"
              aria-pressed={selected}
              onClick={() => withFirstPage(setLevel)(card)}
              className={`flex flex-col items-start gap-2.5 rounded-2xl border bg-white px-6 py-[18px] text-left ${
                selected
                  ? 'border-blue-700 ring-1 ring-inset ring-blue-700'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-lg font-bold ${meta ? meta.textClassName : 'text-blue-700'}`}
                >
                  {meta && (
                    <span
                      className={`size-2 rounded-full ${meta.dotColorClassName}`}
                    />
                  )}
                  {card === 'all'
                    ? t('members.summary.all.label')
                    : riskLevelLabel(card)}
                </span>
                <span className="inline-flex h-[26px] items-center rounded-full bg-slate-100 px-2.5 text-xs font-bold text-slate-600">
                  {meta
                    ? `${((count / MEMBER_COUNT_BY_LEVEL.all) * 100).toFixed(1)}%`
                    : '100%'}
                </span>
              </span>
              <span className="flex items-baseline gap-1">
                <span
                  className={`text-5xl font-bold leading-none tracking-tight ${meta ? meta.textClassName : 'text-slate-900'}`}
                >
                  {formatNumber(count)}
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {t('members.summary.unit')}
                </span>
              </span>
              <span className="text-xs text-gray-600">
                {t(`members.summary.${card}.sub`)}
              </span>
            </button>
          );
        })}
      </div>

      <Card flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-[18px]">
          <div className="flex items-center gap-2.5">
            <div
              role="tablist"
              aria-label={t('members.search.modeLabel')}
              className="flex shrink-0 rounded-lg bg-slate-100 p-0.5"
            >
              {QUERY_MODES.map((mode) => {
                const selected = mode === queryMode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setQueryMode(mode)}
                    className={`h-9 whitespace-nowrap rounded-md px-4 text-sm ${
                      selected
                        ? 'bg-white font-bold text-blue-700'
                        : 'font-medium text-gray-600'
                    }`}
                  >
                    {t(`members.search.mode.${mode}.label`)}
                  </button>
                );
              })}
            </div>
            <SearchInput
              aria-label={t('members.search.inputLabel', {
                mode: currentModeLabel,
              })}
              placeholder={t(`members.search.mode.${queryMode}.placeholder`)}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isQueryChanged) applyQuery();
              }}
            />
            <Button
              className="px-6"
              disabled={!isQueryChanged}
              onClick={applyQuery}
            >
              {t('members.search.submit')}
            </Button>
            <Button
              variant="outline"
              disabled={isDefaultFilter}
              onClick={resetFilter}
            >
              {t('members.search.reset')}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Dropdown
                label={t('members.filter.level.label')}
                className="min-w-36"
                value={level}
                onChange={(value) =>
                  withFirstPage(setLevel)(value as LevelFilter)
                }
                options={[
                  { value: 'all', label: t('members.filter.level.all') },
                  ...RISK_LEVELS.map((value) => ({
                    value,
                    label: riskLevelLabel(value),
                  })),
                ]}
              />
              <Dropdown
                label={t('members.filter.product.label')}
                className="min-w-56 max-w-72"
                value={product}
                onChange={(value) =>
                  withFirstPage(setProduct)(value as ProductFilter)
                }
                options={[
                  { value: ALL_FILTER, label: t('members.filter.product.all') },
                  ...CARD_PRODUCTS.map((card) => ({
                    value: card.id,
                    label: cardName(card.id),
                  })),
                ]}
              />
              {applied.query && (
                <span className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-50 pl-3 pr-1.5 text-xs font-semibold text-blue-700">
                  {t('members.search.applied', {
                    mode: appliedModeLabel,
                    query: applied.query,
                  })}
                  <button
                    type="button"
                    aria-label={t('members.search.clear')}
                    onClick={() => {
                      setApplied((prev) => ({ ...prev, query: '' }));
                      setDraft('');
                      setPage(1);
                    }}
                    className="inline-flex size-5 items-center justify-center rounded-full"
                  >
                    <X className="size-3" strokeWidth={2.6} />
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                label={t('members.sort.label')}
                tabs={SORT_KEYS.map((key) => ({
                  key,
                  label: t(`members.sort.${key}`),
                }))}
                value={sort}
                onChange={withFirstPage(setSort)}
              />
              <Button
                variant="outline"
                onClick={() =>
                  downloadTargetCsv(
                    filtered.map(memberCsvRow),
                    t('members.download.fileName'),
                  )
                }
              >
                <Download className="size-4" strokeWidth={2} />
                {t('members.download.button')}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={`grid h-10 items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold text-slate-500 ${GRID_COLUMNS}`}
        >
          <span>{t('members.table.column.id')}</span>
          <span>{t('members.table.column.name')}</span>
          <span>{t('members.table.column.phone')}</span>
          <span>{t('members.table.column.product')}</span>
          <span>{t('members.table.column.score')}</span>
          <span>{t('members.table.column.riskLevel')}</span>
          <span>{t('members.table.column.reason')}</span>
          <span className="text-right">
            {t('members.table.column.idleDays')}
          </span>
        </div>
        {rows.map((member) => {
          const detailPath = `/target/members/${member.id}`;
          const product = cardName(member.productId);
          const reason = churnReasonLabel(member.reason);
          return (
            <div
              key={member.id}
              onClick={() => navigate(detailPath)}
              className={`grid h-14 cursor-pointer items-center gap-3 border-b border-slate-100 bg-white px-6 text-xs hover:bg-slate-50 ${GRID_COLUMNS}`}
            >
              <span className="truncate text-slate-500">{member.id}</span>
              <Link
                to={detailPath}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full justify-self-start truncate text-sm font-bold text-slate-900 hover:text-blue-700"
              >
                {memberNameLabel(member.name)}
              </Link>
              <span className="truncate text-slate-600">
                {getMemberPhone(member)}
              </span>
              <span className="truncate text-slate-700" title={product}>
                {product}
              </span>
              <ScoreBar score={member.score} />
              <span>
                <RiskBadge riskLevel={getRiskLevelFromScore(member.score)} />
              </span>
              <span className="truncate text-slate-700" title={reason}>
                {reason}
              </span>
              <span className="whitespace-nowrap text-right font-semibold text-slate-900">
                {t('members.table.idleDays', { count: member.idleDays })}
              </span>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            {t('members.table.empty')}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <span className="text-xs text-slate-500">
            {t('members.footer.summary', {
              total: formatNumber(MEMBER_COUNT_BY_LEVEL[level]),
              shown: formatNumber(filtered.length),
              sort: t(`members.sort.${sort}`),
            })}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
