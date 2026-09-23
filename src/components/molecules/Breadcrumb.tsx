import { useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { findActiveNavItem } from '@/config/navigation';

export function Breadcrumb() {
  const location = useLocation();
  const active = findActiveNavItem(location.pathname);

  if (!active) {
    return null;
  }

  const rawDetailSegment =
    active.item.hasDetailRoute &&
    location.pathname.startsWith(`${active.item.path}/`)
      ? location.pathname.slice(active.item.path.length + 1)
      : null;
  const detailSegment = rawDetailSegment
    ? decodeURIComponent(rawDetailSegment)
    : null;

  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <span>{active.group.label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
      <span>{active.item.label}</span>
      {detailSegment && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span>{detailSegment}</span>
        </>
      )}
    </span>
  );
}
