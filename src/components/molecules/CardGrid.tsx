import { type ReactNode } from 'react';

type CardGridColumns = 1 | 2 | 3 | 4 | 5 | 6;
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
  sm: {
    1: '',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
  lg: {
    1: '',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
};

export function CardGrid({
  columns,
  breakpoint = 'sm',
  children,
}: CardGridProps) {
  if (columns === 1) {
    return <div className="mt-14">{children}</div>;
  }

  return (
    <div
      className={`mt-14 grid grid-cols-1 gap-x-10 gap-y-14 ${COLUMNS_CLASS_NAME[breakpoint][columns]}`}
    >
      {children}
    </div>
  );
}
