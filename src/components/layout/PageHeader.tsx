import { CalendarDays, ChevronLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link } from 'react-router';
import { useDemoNotice } from '@/components/molecules/DemoNotice';
import {
  DATA_BASE_MONTH_LABEL,
  DATA_UPDATED_AT,
  PAGE_HEADS,
  type NavSectionKey,
} from '@/config/navigation';

type PageHeaderProps = {
  /** 섹션 기본 제목(PAGE_HEADS)을 가져올 섹션 */
  section: NavSectionKey;
  eyebrow?: string;
  title?: string;
  /** 제목 바로 옆에 붙는 요소 (예: 위험도 배지) */
  titleAddon?: ReactNode;
  description?: ReactNode;
  /** 상세 화면의 "← 목록" 링크 */
  back?: { label: string; to: string };
  /** 제목 오른쪽 영역. 생략하면 데이터 기준일 + 기준 월을 보여준다. */
  actions?: ReactNode;
  /** 제목 크기 (대시보드처럼 강조할 때 lg) */
  titleSize?: 'md' | 'lg';
};

/** 모든 페이지 맨 위 제목 영역: 영문 소제목 + 제목·설명 + 오른쪽 액션 */
export function PageHeader({
  section,
  eyebrow,
  title,
  titleAddon,
  description,
  back,
  actions,
  titleSize = 'md',
}: PageHeaderProps) {
  const head = PAGE_HEADS[section];

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
            {titleAddon}
            <span className="text-sm text-slate-500">
              {description ?? head.description}
            </span>
          </div>
        </div>
        {actions ?? <DataBaseInfo />}
      </div>
    </div>
  );
}

/** 데이터 갱신일 + 기준 월 (목록 화면 기본 오른쪽 영역) */
export function DataBaseInfo({ monthControl }: { monthControl?: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <UpdatedAtLabel />
      {monthControl ?? <BaseMonthButton />}
    </div>
  );
}

/** 기준 월 표시. 데모 버전은 9월 데이터만 있어 누르면 안내 문구를 띄운다 */
function BaseMonthButton() {
  const { show, notice } = useDemoNotice();
  return (
    <>
      <button
        type="button"
        onClick={() => show('데모 버전에서는 기준 월 변경을 지원하지 않아요')}
        className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold hover:bg-slate-50"
      >
        <CalendarDays className="size-4 text-slate-500" />
        {DATA_BASE_MONTH_LABEL}
      </button>
      {notice}
    </>
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
