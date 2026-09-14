import { type ReactNode } from 'react';

type CardGridColumns = 1 | 2 | 3 | 4;
type CardGridBreakpoint = 'sm' | 'lg';

type CardGridProps = {
  columns: CardGridColumns;
  breakpoint?: CardGridBreakpoint;
  children: ReactNode;
};

const COLUMNS_CLASS_NAME: Record<
  CardGridBreakpoint,
  Record<CardGridColumns, string>
> = {
  sm: { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' },
  lg: { 1: '', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' },
};

export function CardGrid({
  columns,
  breakpoint = 'sm',
  children,
}: CardGridProps) {
  if (columns === 1) {
    return <div className="mt-10">{children}</div>;
  }

  return (
    <div
      className={`mt-10 grid grid-cols-1 gap-8 ${COLUMNS_CLASS_NAME[breakpoint][columns]}`}
    >
      {children}
    </div>
  );
}
