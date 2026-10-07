import { CalendarDays, ChevronLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import {
  DATA_BASE_MONTH_LABEL,
  DATA_UPDATED_AT,
  PAGE_HEADS,
  SECTION_TABS,
  type NavSectionKey,
} from '@/config/navigation';

type PageHeaderProps = {
  /** 섹션 기본 제목(PAGE_HEADS)과 하위 탭(SECTION_TABS)을 가져올 섹션 */
  section: NavSectionKey;
  eyebrow?: string;
  title?: string;
  description?: ReactNode;
  /** 상세 화면의 "← 목록" 링크 */
  back?: { label: string; to: string };
  /** 제목 오른쪽 영역. 생략하면 데이터 기준일 + 기준 월을 보여준다. */
  actions?: ReactNode;
  /** 탭 옆에 붙일 숫자 (탭 경로 → 숫자) */
  tabCounts?: Record<string, string>;
  /** 상세 화면처럼 섹션 탭을 숨길 때 */
  hideTabs?: boolean;
  /** 제목 크기 (대시보드처럼 강조할 때 lg) */
  titleSize?: 'md' | 'lg';
};

/** 모든 페이지 맨 위 제목 영역: 영문 소제목 + 제목·설명 + 오른쪽 액션 + 하위 탭 */
export function PageHeader({
  section,
  eyebrow,
  title,
  description,
  back,
  actions,
  tabCounts,
  hideTabs = false,
  titleSize = 'md',
}: PageHeaderProps) {
  const head = PAGE_HEADS[section];
  const tabs = hideTabs ? undefined : SECTION_TABS[section];

  return (
    <div className="flex flex-col gap-2.5">
      {back && (
        <Link
          to={back.to}
          className="inline-flex h-7 items-center gap-0.5 self-start rounded-lg pl-1 pr-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-2xs font-bold tracking-widest text-blue-700">
            {eyebrow ?? head.eyebrow}
          </span>
          <div className="flex flex-wrap items-baseline gap-3.5">
            <h1
              className={`whitespace-nowrap font-bold tracking-tight ${titleSize === 'lg' ? 'text-3xl' : 'text-2xl'}`}
            >
              {title ?? head.title}
            </h1>
            <span className="text-sm text-slate-500">
              {description ?? head.description}
            </span>
          </div>
        </div>
        {actions ?? <DataBaseInfo />}
      </div>
      {tabs && (
        <div
          role="tablist"
          aria-label="하위 화면"
          className="flex border-b border-slate-200"
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              role="tab"
              className={({ isActive }) =>
                `-mb-px mr-6 inline-flex h-11 items-center gap-2 border-b-2 px-0.5 text-sm ${
                  isActive
                    ? 'border-blue-700 font-bold text-slate-900'
                    : 'border-transparent font-medium text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {tab.label}
                  {tabCounts?.[tab.to] && (
                    <span
                      className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-bold ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tabCounts[tab.to]}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/** 데이터 갱신일 + 기준 월 (목록 화면 기본 오른쪽 영역) */
export function DataBaseInfo({ monthControl }: { monthControl?: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <UpdatedAtLabel />
      {monthControl ?? (
        <span className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold">
          <CalendarDays className="size-4 text-slate-500" />
          {DATA_BASE_MONTH_LABEL}
        </span>
      )}
    </div>
  );
}

export function UpdatedAtLabel({ date = DATA_UPDATED_AT }: { date?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className="size-1.5 rounded-full bg-green-500" />
      {date} 기준 · 매월 1일 갱신
    </span>
  );
}
