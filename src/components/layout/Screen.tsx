import type { ReactNode } from 'react';

type ScreenProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Standard page-level layout wrapper. Every route renders its content inside
 * this instead of a bare `<div>`, so inter-section spacing lives in one
 * place (this gap) rather than as ad-hoc margins on PageHeading/CardGrid.
 */
export function Screen({ children, className = '' }: ScreenProps) {
  return <div className={`flex flex-col gap-10 ${className}`}>{children}</div>;
}
