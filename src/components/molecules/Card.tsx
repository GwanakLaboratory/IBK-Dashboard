import { ChevronsRight, Square } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link } from 'react-router';

type CardProps = {
  id?: string;
  title: string;
  description?: string;
  seeMoreHref?: string;
  children: ReactNode;
};

export function Card({
  id,
  title,
  description,
  seeMoreHref,
  children,
}: CardProps) {
  return (
    <section id={id} className="flex h-full scroll-mt-6 flex-col">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-base font-semibold text-gray-900">
            <Square className="h-2 w-2 bg-gray-900" />
            {title}
          </h2>
          {description && (
            <p className="mt-1 pl-5 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {seeMoreHref && (
          <Link
            to={seeMoreHref}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            더보기
            <ChevronsRight className="h-4 w-4" />
          </Link>
        )}
      </header>
      <div className="flex-1 rounded-lg border border-border p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}
