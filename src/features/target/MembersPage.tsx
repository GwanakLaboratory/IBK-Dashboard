import { Download, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import {
  CARD_PRODUCTS,
  MEMBER_COUNT_BY_LEVEL,
  TARGET_MEMBERS,
  getMemberPhone,
  type TargetMember,
} from '@/data/target';
import type { RiskLevel } from '@/types/churn';
import {
  RISK_LEVEL_META,
  getRiskLevelFromScore,
  interleaveByRiskLevel,
} from '@/utils/risk';

type LevelFilter = 'all' | RiskLevel;
type QueryMode = 'name' | 'phone' | 'id';
type SortKey = 'score' | 'idle';

const ALL_PRODUCTS = '전체 카드상품';
const PAGE_SIZE = 10;
// 가로 스크롤 없이 콘텐츠 폭에 맞추는 유동 열
const GRID_COLUMNS =
  'grid-cols-[76px_56px_96px_minmax(0,1fr)_96px_88px_minmax(0,1.3fr)_44px]';

const LEVEL_CARDS: { key: LevelFilter; label: string; sub: string }[] = [
  { key: 'all', label: '분석 대상 전체', sub: '최근 2개월 신용카드 이용 고객' },
  { key: 'high', label: '위험', sub: '이탈 예측 70점 이상 · 우선 대응' },
  { key: 'medium', label: '중위험', sub: '40 – 69점 · 이용 독려 대상' },
  { key: 'low', label: '저위험', sub: '40점 미만 · 모니터링' },
];

const QUERY_MODES: { key: QueryMode; label: string; placeholder: string }[] = [
  { key: 'name', label: '이름', placeholder: '회원 이름을 입력하세요' },
  {
    key: 'phone',
    label: '전화번호',
    placeholder: '전화번호 뒤 4자리를 입력하세요',
  },
  {
    key: 'id',
    label: '회원번호',
    placeholder: '회원번호를 입력하세요 (예: C-204817)',
  },
];

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: '전체 위험도' },
  { value: 'high', label: '위험' },
  { value: 'medium', label: '중위험' },
  { value: 'low', label: '저위험' },
];

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'score', label: '이탈 예측 점수 높은 순' },
  { key: 'idle', label: '미이용 기간 긴 순' },
];

const PRODUCT_OPTIONS = [ALL_PRODUCTS, ...CARD_PRODUCTS.map((c) => c.name)];

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
  return (
    member.name.replace('*', '').includes(query.replace('*', '')) ||
    member.name.includes(query)
  );
}

export function MembersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get('product');

  const [level, setLevel] = useState<LevelFilter>('all');
  const [product, setProduct] = useState(
    initialProduct && PRODUCT_OPTIONS.includes(initialProduct)
      ? initialProduct
      : ALL_PRODUCTS,
  );
  const [queryMode, setQueryMode] = useState<QueryMode>('name');
  const [draft, setDraft] = useState('');
  const [applied, setApplied] = useState<{ mode: QueryMode; query: string }>({
    mode: 'name',
    query: '',
  });
  const [sort, setSort] = useState<SortKey>('score');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      TARGET_MEMBERS.filter(
        (member) =>
          (level === 'all' || getRiskLevelFromScore(member.score) === level) &&
          (product === ALL_PRODUCTS || member.product === product) &&
          matchQuery(member, applied.mode, applied.query),
      ).sort((a, b) =>
        sort === 'idle'
          ? b.idleDays - a.idleDays || b.score - a.score
          : b.score - a.score,
      ),
    [level, product, applied, sort],
  );
  // 전체 위험도 + 점수 순일 때는 위험 → 중위험 → 저위험을 번갈아 보여준다 (등급 안에서는 점수 순)
  const rowsInOrder = useMemo(
    () =>
      level === 'all' && sort === 'score'
        ? interleaveByRiskLevel(
            filtered.map((member) => ({
              member,
              riskLevel: getRiskLevelFromScore(member.score),
            })),
          ).map((item) => item.member)
        : filtered,
    [filtered, level, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = rowsInOrder.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const currentMode = QUERY_MODES.find((m) => m.key === queryMode)!;
  const appliedModeLabel = QUERY_MODES.find(
    (m) => m.key === applied.mode,
  )!.label;

  // 필터가 바뀌면 첫 페이지로
  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const applyQuery = () => {
    setApplied({ mode: queryMode, query: draft.trim() });
    setPage(1);
  };

  const resetFilter = () => {
    setLevel('all');
    setProduct(ALL_PRODUCTS);
    setQueryMode('name');
    setDraft('');
    setApplied({ mode: 'name', query: '' });
    setSort('score');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        section="target"
        eyebrow="RISK TARGET · 회원"
        titleSize="lg"
        title="회원 목록"
        description="이탈 예측 점수 높은 순 · 회원을 눌러 상세 이력을 확인할 수 있어요"
        back={{ label: '고객 분석', to: '/target' }}
        // 데이터 기준일·기준 월 표시는 이 화면에서 쓰지 않는다
        actions={false}
      />

      <div className="grid grid-cols-4 gap-4">
        {LEVEL_CARDS.map((card) => {
          const selected = card.key === level;
          const count = MEMBER_COUNT_BY_LEVEL[card.key];
          const meta = card.key === 'all' ? null : RISK_LEVEL_META[card.key];
          return (
            <button
              key={card.key}
              type="button"
              aria-pressed={selected}
              onClick={() => withFirstPage(setLevel)(card.key)}
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
                  {card.label}
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
                  {count.toLocaleString('ko-KR')}
                </span>
                <span className="text-xl font-bold text-slate-900">명</span>
              </span>
              <span className="text-xs text-gray-600">{card.sub}</span>
            </button>
          );
        })}
      </div>

      <Card flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-[18px]">
          <div className="flex items-center gap-2.5">
            <div
              role="tablist"
              aria-label="검색 기준"
              className="flex shrink-0 rounded-lg bg-slate-100 p-0.5"
            >
              {QUERY_MODES.map((mode) => {
                const selected = mode.key === queryMode;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setQueryMode(mode.key)}
                    className={`h-9 whitespace-nowrap rounded-md px-4 text-sm ${
                      selected
                        ? 'bg-white font-bold text-blue-700'
                        : 'font-medium text-gray-600'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
            <SearchInput
              aria-label={`${currentMode.label}(으)로 회원 검색`}
              placeholder={currentMode.placeholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyQuery();
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
            <div className="flex flex-wrap items-center gap-2.5">
              <Dropdown
                label="위험도"
                className="min-w-36"
                value={level}
                onChange={(value) =>
                  withFirstPage(setLevel)(value as LevelFilter)
                }
                options={LEVEL_OPTIONS}
              />
              <Dropdown
                label="카드상품"
                className="min-w-56 max-w-72"
                value={product}
                onChange={(value) => withFirstPage(setProduct)(value)}
                options={PRODUCT_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
              {applied.query && (
                <span className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-50 pl-3 pr-1.5 text-xs font-semibold text-blue-700">
                  {appliedModeLabel} · {applied.query}
                  <button
                    type="button"
                    aria-label="검색어 지우기"
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
                label="정렬"
                tabs={SORT_TABS}
                value={sort}
                onChange={withFirstPage(setSort)}
              />
              <Button
                variant="outline"
                onClick={() =>
                  downloadTargetCsv(rowsInOrder.map(memberCsvRow), '회원목록')
                }
              >
                <Download className="size-4" strokeWidth={2} />
                엑셀 받기
              </Button>
            </div>
          </div>
        </div>

        <div
          className={`grid h-10 items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold text-slate-500 ${GRID_COLUMNS}`}
        >
          <span>회원번호</span>
          <span>이름</span>
          <span>전화번호</span>
          <span>카드상품</span>
          <span>이탈 예측 점수</span>
          <span>위험도</span>
          <span>주요 이유</span>
          <span className="text-right">미이용</span>
        </div>
        {rows.map((member) => {
          const detailPath = `/target/members/${member.id}`;
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
                {member.name}
              </Link>
              <span className="truncate text-slate-600">
                {getMemberPhone(member)}
              </span>
              <span className="truncate text-slate-700" title={member.product}>
                {member.product}
              </span>
              <ScoreBar score={member.score} barClassName="w-12" />
              <span>
                <RiskBadge
                  riskLevel={getRiskLevelFromScore(member.score)}
                  size="lg"
                />
              </span>
              <span className="truncate text-slate-700" title={member.reason}>
                {member.reason}
              </span>
              <span className="text-right font-semibold text-slate-900">
                {member.idleDays}일
              </span>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            조건에 맞는 회원이 없어요. 필터를 바꿔 보세요.
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <span className="text-xs text-slate-500">
            {MEMBER_COUNT_BY_LEVEL[level].toLocaleString('ko-KR')}명 중{' '}
            {filtered.length}명 표시 ·{' '}
            {SORT_TABS.find((tab) => tab.key === sort)!.label}
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
