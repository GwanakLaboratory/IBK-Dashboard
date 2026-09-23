import {
  BarChart3,
  Megaphone,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardTabKey, NavGroupKey } from '@/types/navigation';

export type DashboardPageTab = {
  key: string;
  label: string;
};

export type DashboardNavItem = {
  tabKey: DashboardTabKey;
  path: string;
  label: string;
  description: string;
  /** Groups consecutive items under a small header inside a nav group (e.g. 회원 / 카드). */
  sectionLabel?: string;
  /** Only match this item's NavLink exactly; needed when its path is a prefix of sibling paths. */
  end?: boolean;
  /** This item's page also has an unlisted dynamic detail route nested under its path. */
  hasDetailRoute?: boolean;
  /** In-page tab bar; all tabs render under this one route. */
  tabs?: DashboardPageTab[];
};

export type NavGroup = {
  groupKey: NavGroupKey;
  label: string;
  description: string;
  icon: LucideIcon;
  items: DashboardNavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'status',
    label: '현황',
    description: '전체 회원의 이탈 위험 현황',
    icon: BarChart3,
    items: [
      {
        tabKey: 'status-overview',
        path: '/dashboard',
        label: '종합 현황',
        description: '핵심 지표와 위험도 분포를 한눈에 확인합니다.',
        sectionLabel: '요약',
        end: true,
        tabs: [
          { key: 'summary', label: '전체 요약' },
          { key: 'half', label: '반기별 비교' },
        ],
      },
      {
        tabKey: 'status-trend',
        path: '/dashboard/trend',
        label: '지표 추이',
        description: '최근 12개월 사용액·회원수·이탈 지표의 흐름을 확인합니다.',
        sectionLabel: '분석',
        tabs: [
          { key: 'usage', label: '사용액' },
          { key: 'members', label: '회원수' },
          { key: 'churn', label: '이탈' },
        ],
      },
      {
        tabKey: 'status-cause',
        path: '/dashboard/cause',
        label: '이탈 원인',
        description: '이탈에 영향을 준 이유와 예측점수 분포를 확인합니다.',
      },
    ],
  },
  {
    groupKey: 'risk-target',
    label: '위험 타겟',
    description: '이탈 위험 회원·상품 식별',
    icon: Target,
    items: [
      {
        tabKey: 'target-members',
        path: '/customer-detail',
        label: '회원 목록',
        description: '이탈 가능성이 높은 회원을 찾고 우선순위를 정합니다.',
        sectionLabel: '회원',
        hasDetailRoute: true,
        tabs: [
          { key: 'all', label: '전체 회원' },
          { key: 'priority', label: '위험군 우선순위' },
        ],
      },
      {
        tabKey: 'target-member-analysis',
        path: '/customer-analysis',
        label: '회원 분석',
        description:
          '신규·기존 회원 세그먼트의 이탈 스코어와 사용액을 비교합니다.',
      },
      {
        tabKey: 'target-cards',
        path: '/card-list',
        label: '카드 목록',
        description: '카드 상품별 보유 회원과 이탈률을 확인합니다.',
        sectionLabel: '카드',
        hasDetailRoute: true,
      },
      {
        tabKey: 'target-card-category',
        path: '/card-analysis',
        label: '카테고리 분석',
        description: '혜택 카테고리별 이탈률과 이탈 사유를 확인합니다.',
      },
    ],
  },
  {
    groupKey: 'marketing',
    label: '마케팅',
    description: '대상 추출·발송·접촉 관리',
    icon: Megaphone,
    items: [
      {
        tabKey: 'marketing-extraction',
        path: '/marketing/extraction',
        label: '고위험 회원 추출',
        description:
          '그룹과 인원수 조건으로 대상을 무작위 추출해 CSV로 받습니다.',
      },
      {
        tabKey: 'marketing-campaign',
        path: '/marketing/campaign',
        label: '캠페인 발송',
        description:
          '위험 세그먼트에 맞춰 메시지를 발송하고 반응을 추적합니다.',
        tabs: [
          { key: 'send', label: '타겟 발송' },
          { key: 'history', label: '접촉 이력' },
        ],
      },
    ],
  },
  {
    groupKey: 'performance',
    label: '성과',
    description: '마케팅 전후 성과 측정',
    icon: TrendingUp,
    items: [
      {
        tabKey: 'performance-report',
        path: '/performance',
        label: '성과 리포트',
        description: '이탈 방지 활동의 전환율과 경제적 효과를 확인합니다.',
        tabs: [
          { key: 'conversion', label: '전환율' },
          { key: 'economic', label: '경제적 효과' },
        ],
      },
    ],
  },
];

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = NAV_GROUPS.flatMap(
  (group) => group.items,
);

/**
 * Finds the most specific nav item whose path matches the given pathname
 * (exact match, or pathname nested under it). Picks the longest matching
 * path so a parent route (e.g. /dashboard) never shadows a sibling's own
 * sub-path (e.g. /dashboard/trend).
 */
export function findActiveNavItem(
  pathname: string,
): { group: NavGroup; item: DashboardNavItem } | null {
  let best: { group: NavGroup; item: DashboardNavItem } | null = null;

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const matches =
        pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (matches && (!best || item.path.length > best.item.path.length)) {
        best = { group, item };
      }
    }
  }

  return best;
}
