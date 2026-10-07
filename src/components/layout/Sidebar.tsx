import { Building2 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { NAV_SECTIONS } from '@/config/navigation';

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="메뉴"
      className="flex w-52 shrink-0 flex-col border-t border-sidebar-border bg-sidebar py-5"
    >
      <span className="px-5 pb-2.5 text-2xs font-bold tracking-widest text-slate-500">
        MENU
      </span>
      {NAV_SECTIONS.map(
        ({ key, label, icon: Icon, path, basePath, children }) => {
          const active =
            pathname === basePath || pathname.startsWith(`${basePath}/`);
          return (
            <div key={key} className="flex flex-col">
              <NavLink
                to={path}
                aria-current={active && !children ? 'page' : undefined}
                className={`flex h-12 items-center gap-3 text-sm transition-colors ${
                  active
                    ? 'border-l-4 border-blue-500 bg-sidebar-active pl-4 pr-5 font-bold text-white'
                    : 'px-5 font-medium text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="size-5" strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
              {active && children && (
                <div className="flex flex-col gap-0.5 py-1.5">
                  {children.map((child) => {
                    // 상세 화면(예: /marketing/history/:id)도 부모 메뉴를 활성으로 본다
                    const childActive =
                      pathname === child.to ||
                      pathname.startsWith(`${child.to}/`);
                    return (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        aria-current={childActive ? 'page' : undefined}
                        className={`mx-3 flex h-10 items-center gap-2.5 rounded-lg pl-6 pr-3 text-sm transition-colors ${
                          childActive
                            ? 'bg-blue-500/15 font-bold text-blue-300'
                            : 'font-medium text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${childActive ? 'bg-blue-300' : 'bg-slate-600'}`}
                        />
                        {child.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        },
      )}
      <div className="mt-auto flex items-center gap-2.5 border-t border-sidebar-border px-5 pt-3.5 text-xs text-slate-400">
        <Building2 className="size-5" strokeWidth={1.8} />
        <span>카드사업부</span>
      </div>
    </nav>
  );
}
