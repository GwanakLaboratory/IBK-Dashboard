import { useLocation } from 'react-router';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
import { getPageMeta } from '@/config/navigation';

type PageHeadingProps = {
  /** Defaults to the active nav item's label, so it matches the sidebar. */
  title?: string;
  /** Defaults to the active nav item's description. */
  description?: string;
};

export function PageHeading({ title, description }: PageHeadingProps) {
  const location = useLocation();
  const pageMeta = getPageMeta(location.pathname);
  const headingTitle = title ?? pageMeta?.title ?? '';
  const headingDescription = description ?? pageMeta?.description;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{headingTitle}</h1>
        <Breadcrumb />
      </div>
      {headingDescription && (
        <p className="mt-2 text-sm text-gray-500">{headingDescription}</p>
      )}
    </div>
  );
}
