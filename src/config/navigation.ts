import { CreditCard, FileSearch, Users, type LucideIcon } from 'lucide-react';
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
        label: '목록',
        pageTitle: '회원 목록',
      },
      {
        tabKey: 'customer-analysis',
        path: '/customer-analysis',
        label: '분석',
        pageTitle: '회원 이탈 스코어 분석',
      },
    ],
  },
  {
    groupKey: 'card',
    label: '카드',
    icon: CreditCard,
    items: [
      {
        tabKey: 'card-list',
        path: '/card-list',
        label: '목록',
        pageTitle: '카드 상품 목록',
      },
      {
        tabKey: 'card-analysis',
        path: '/card-analysis',
        label: '카테고리 분석',
        pageTitle: '카드 카테고리 분석',
      },
    ],
  },
];

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = NAV_GROUPS.flatMap(
  (group) => group.items,
);
