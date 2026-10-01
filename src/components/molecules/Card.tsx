import { ChevronsRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link } from 'react-router';
import { SectionTitle } from '@/components/molecules/SectionTitle';

type CardProps = {
  id?: string;
  title: string;
  description?: string;
  seeMoreHref?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Card({
  id,
  title,
  description,
  seeMoreHref,
  actions,
  children,
}: CardProps) {
  return (
    <section id={id} className="flex h-full scroll-mt-6 flex-col">
      <SectionTitle
        className="mb-4"
        title={title}
        description={description}
        actions={
          (actions || seeMoreHref) && (
            <>
              {actions}
              {seeMoreHref && (
                <Link
                  to={seeMoreHref}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  더보기
                  <ChevronsRight className="h-4 w-4" />
                </Link>
              )}
            </>
          )
        }
      />
      <div className="flex flex-1 flex-col justify-center rounded-lg border border-border bg-white p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}
