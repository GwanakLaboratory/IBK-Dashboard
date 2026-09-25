import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { findActiveNavItem, NAV_GROUPS } from '@/config/navigation';
import type { NavGroupKey } from '@/types/navigation';

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [manualGroupKey, setManualGroupKey] = useState<NavGroupKey | null>(
    null,
  );

  const activeNavItem = findActiveNavItem(location.pathname);
  const activeGroupKey =
    manualGroupKey ?? activeNavItem?.group.groupKey ?? NAV_GROUPS[0].groupKey;
  const activeGroup =
    NAV_GROUPS.find((group) => group.groupKey === activeGroupKey) ??
    NAV_GROUPS[0];

  useEffect(() => {
    setManualGroupKey(null);
  }, [location.pathname]);

  return (
    <div className="flex h-full shrink-0">
      <aside className="flex h-full w-16 shrink-0 flex-col items-center gap-1.5 border-t border-sidebar-border bg-sidebar py-3">
        <button
          type="button"
          onClick={() =>
            setIsCollapsed((previousCollapsed) => !previousCollapsed)
          }
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-slate-800 hover:text-white"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {NAV_GROUPS.map((group) => {
          const isActiveGroup = group.groupKey === activeGroupKey;
          const GroupIcon = group.icon;

          return (
            <button
              key={group.groupKey}
              type="button"
              onClick={() => setManualGroupKey(group.groupKey)}
              title={group.label}
              className={`flex h-14 w-[52px] flex-col items-center justify-center gap-1 rounded-[10px] text-[11px] font-medium transition-colors ${
                isActiveGroup
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-muted hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <GroupIcon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              {group.label}
            </button>
          );
        })}
      </aside>

      <aside
        className={`h-full shrink-0 overflow-hidden border-r bg-sidebar-panel transition-all duration-300 ease-in-out ${
          isCollapsed
            ? 'w-0 border-transparent opacity-0'
            : 'w-44 border-sidebar-panel-border opacity-100'
        }`}
      >
        <div className="flex h-full w-44 flex-col pb-4 pt-5">
          <div className="flex flex-col gap-1.5 px-4 pb-3">
            <p className="text-[17px] font-bold text-gray-900">
              {activeGroup.label}
            </p>
            <p className="text-xs leading-relaxed text-sidebar-panel-muted">
              {activeGroup.description}
            </p>
          </div>

          <nav className="flex flex-col gap-0.5">
            {activeGroup.items.map((item, itemIndex) => {
              const previousSectionLabel =
                activeGroup.items[itemIndex - 1]?.sectionLabel;
              const showSectionLabel =
                item.sectionLabel !== undefined &&
                item.sectionLabel !== previousSectionLabel;

              const rawDetailSegment =
                item.hasDetailRoute &&
                location.pathname.startsWith(`${item.path}/`)
                  ? location.pathname.slice(item.path.length + 1)
                  : null;
              const detailSegment = rawDetailSegment
                ? decodeURIComponent(rawDetailSegment)
                : null;

              return (
                <div key={item.tabKey} className="flex flex-col">
                  {showSectionLabel && (
                    <p className="mt-3 px-4 pb-1 pt-3 text-[11px] font-bold text-gray-500 first:pt-0">
                      {item.sectionLabel}
                    </p>
                  )}
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `min-h-[40px] border-l-[3px] px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'border-l-primary bg-blue-100 font-semibold text-primary'
                          : 'border-l-transparent font-medium text-gray-700 hover:text-primary'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>

                  {detailSegment && (
                    <div className="flex items-center gap-1.5 py-1.5 pl-7 pr-3 text-xs text-primary">
                      <span className="text-gray-400">└</span>
                      <span className="truncate font-semibold">
                        {detailSegment}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
}
