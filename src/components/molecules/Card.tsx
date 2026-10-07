import { type ReactNode } from 'react';

type CardProps = {
  id?: string;
  /** 생략하면 제목 없는 흰 박스(표·필터 패널 등)로 쓴다 */
  title?: string;
  description?: ReactNode;
  /** 제목 줄 오른쪽 (범례, 탭, 버튼 등) */
  actions?: ReactNode;
  /** 제목 바로 옆에 붙는 요소 (탭, 배지 등) */
  titleAddon?: ReactNode;
  /** 표처럼 테두리까지 꽉 채울 때: 안쪽 여백·간격 없음 */
  flush?: boolean;
  /** 제목과 내용 사이 간격 (기본 gap-3) */
  gapClassName?: string;
  /** 제목 크기 (대시보드처럼 강조할 때 lg) */
  titleSize?: 'md' | 'lg';
  /** 여백·간격 외 추가 클래스 (예: 'pb-3', 'grow') */
  className?: string;
  children: ReactNode;
};

/** 흰 카드. 제목·설명·액션은 카드 안쪽 위에 놓인다. */
export function Card({
  id,
  title,
  description,
  actions,
  titleAddon,
  flush = false,
  gapClassName = 'gap-3',
  titleSize = 'md',
  className = '',
  children,
}: CardProps) {
  // 기본 여백·간격은 className 으로 덮으면 CSS 순서 때문에 안 먹을 수 있어 prop 으로 분리한다
  const spacingClassName = flush ? '' : `px-6 py-5 ${gapClassName}`;

  return (
    <section
      id={id}
      className={`flex min-w-0 scroll-mt-6 flex-col rounded-2xl border border-slate-200 bg-white ${spacingClassName} ${className}`}
    >
      {title && (
        <header
          className={`flex justify-between gap-3 ${description ? 'items-start' : 'items-center'}`}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-3.5">
              <h2
                className={`font-bold text-slate-900 ${titleSize === 'lg' ? 'text-lg' : 'text-sm'}`}
              >
                {title}
              </h2>
              {titleAddon}
            </div>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
