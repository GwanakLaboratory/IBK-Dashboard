import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_GROUPS } from '@/config/navigation';
import type { NavGroupKey } from '@/types/navigation';

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [manualGroupKey, setManualGroupKey] = useState<NavGroupKey | null>(
    null,
  );

  const routeGroup = NAV_GROUPS.find((group) =>
    group.items.some((item) => location.pathname.startsWith(item.path)),
  );
  const activeGroupKey =
    manualGroupKey ?? routeGroup?.groupKey ?? NAV_GROUPS[0].groupKey;
  const activeGroup =
    NAV_GROUPS.find((group) => group.groupKey === activeGroupKey) ??
    NAV_GROUPS[0];

  useEffect(() => {
    setManualGroupKey(null);
  }, [location.pathname]);

  return (
    <div className="flex h-full shrink-0 bg-slate-900">
      <aside className="flex h-full w-16 shrink-0 flex-col items-center py-3">
        <button
          type="button"
          onClick={() =>
            setIsCollapsed((previousCollapsed) => !previousCollapsed)
          }
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className="mb-3 rounded p-1 text-white hover:bg-slate-800"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <nav className="flex w-full flex-col gap-1">
          {NAV_GROUPS.map((group) => {
            const isActiveGroup = group.groupKey === activeGroupKey;
            const GroupIcon = group.icon;

            return (
              <button
                key={group.groupKey}
                type="button"
                onClick={() => setManualGroupKey(group.groupKey)}
                title={group.label}
                className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActiveGroup
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <GroupIcon className="h-5 w-5 shrink-0" />
                {group.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {!isCollapsed && (
        <aside className="flex h-full w-44 shrink-0 flex-col rounded-l-3xl border-r border-slate-100 bg-gray-50 py-2">
          <div className="mx-4 my-2 flex flex-row items-center gap-2 border-b border-slate-800 bg-slate-50 p-2">
            <activeGroup.icon className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-base font-semibold text-primary">
              {activeGroup.label}
            </p>
          </div>

          <nav className="flex flex-col gap-0.5 px-4">
            {activeGroup.items.map((item) => (
              <NavLink
                key={item.tabKey}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-md border-2 p-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-100 text-primary'
                      : 'border-transparent text-slate-600 hover:text-primary'
                  }`
                }
              >
                • {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      )}
    </div>
  );
}
