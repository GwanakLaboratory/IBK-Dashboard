import { useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';
import { NAV_GROUPS } from '@/config/navigation';

export function Breadcrumb() {
  const location = useLocation();

  const activeGroup = NAV_GROUPS.find((group) =>
    group.items.some((item) => location.pathname.startsWith(item.path)),
  );
  const activeItem = activeGroup?.items.find((item) =>
    location.pathname.startsWith(item.path),
  );

  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Home className="h-3.5 w-3.5 text-gray-600" />
      {activeGroup && <ChevronRight className="h-3.5 w-3.5 text-gray-200" />}
      {activeGroup?.label}
      {activeItem && <ChevronRight className="h-3.5 w-3.5 text-gray-200" />}
      {activeItem?.label}
    </span>
  );
}
