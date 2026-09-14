import { FileSearch, Users, type LucideIcon } from 'lucide-react';
import type { DashboardTabKey, NavGroupKey } from '@/types/navigation';

export type DashboardNavItem = {
  tabKey: DashboardTabKey;
  path: string;
  label: string;
  pageTitle: string;
};

export type NavGroup = {
  groupKey: NavGroupKey;
  label: string;
  icon: LucideIcon;
  items: DashboardNavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'inquiry',
    label: '조회',
    icon: FileSearch,
    items: [
      {
        tabKey: 'dashboard',
        path: '/dashboard',
        label: '대시보드',
        pageTitle: '대시보드',
      },
      {
        tabKey: 'risk-summary',
        path: '/risk-summary',
        label: '위험도 현황',
        pageTitle: '위험도 현황',
      },
      {
        tabKey: 'reason-analysis',
        path: '/reason-analysis',
        label: '이탈 이유 분석',
        pageTitle: '이탈 이유 분석',
      },
    ],
  },
  {
    groupKey: 'member',
    label: '회원',
    icon: Users,
    items: [
      {
        tabKey: 'customer-list',
        path: '/customer-detail',
        label: '전체 목록',
        pageTitle: '회원별 상세',
      },
    ],
  },
];

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = NAV_GROUPS.flatMap(
  (group) => group.items,
);
