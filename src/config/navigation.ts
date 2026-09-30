import { BarChart3, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import { MegaphoneIcon } from '@/components/atoms/MegaphoneIcon';
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
  detail?: { label: string; description: string };
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
    description: '이탈 지표와 추이 확인',
    icon: BarChart3,
    items: [
      {
        tabKey: 'status-overview',
        path: '/dashboard',
        label: '전체 현황',
        description:
          '전체 회원의 카드 사용과 이탈 위험 현황을 한눈에 확인합니다.',
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
        description: '사용액과 회원수가 언제, 왜 변했는지 흐름을 확인합니다.',
        sectionLabel: '분석',
        tabs: [
          { key: 'usage', label: '사용액' },
          { key: 'members', label: '회원수' },
        ],
      },
      {
        tabKey: 'status-churn',
        path: '/dashboard/churn',
        label: '이탈 분석',
        description:
          '이탈이 어떻게 변해왔고, 무엇이 이탈을 만들었는지 함께 확인합니다.',
        tabs: [
          { key: 'trend', label: '이탈 추이' },
          { key: 'cause', label: '이탈 원인' },
        ],
      },
    ],
  },
  {
    groupKey: 'risk-target',
    label: '위험 타겟',
    description: '이탈 위험 회원·카드 상품 식별',
    icon: Target,
    items: [
      {
        tabKey: 'target-members',
        path: '/customer-detail',
        label: '회원 목록',
        description: '이탈 가능성이 높은 회원을 찾고 우선순위를 정합니다.',
        sectionLabel: '회원',
        detail: {
          label: '회원 상세',
          description:
            '개별 회원의 이탈 예측 점수와 이용 추이, 이탈 이유를 확인합니다.',
        },
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
        detail: {
          label: '카드 상세',
          description:
            '카드 상품의 발급·이용·해지 현황과 보유 회원 이탈 사유를 확인합니다.',
        },
      },
      {
        tabKey: 'target-card-category',
        path: '/card-analysis',
        label: '카테고리 분석',
        description:
          '혜택 카테고리별 이탈률을 랭킹으로 찾고, 눌러서 이탈 사유까지 확인합니다.',
      },
    ],
  },
  {
    groupKey: 'marketing',
    label: '마케팅',
    description: '세그먼트 타겟 발송·접촉 관리',
    icon: MegaphoneIcon,
    items: [
      {
        tabKey: 'marketing-campaign',
        path: '/marketing/campaign',
        label: '타겟 발송',
        description:
          '발송 대상을 선택하고, AI로 맞춤 문구를 만들어 캠페인을 발송해 보세요.',
      },
      {
        tabKey: 'marketing-history',
        path: '/marketing/history',
        label: '접촉 이력',
        description: '회원별 마케팅 접촉 내역과 반응 여부를 확인합니다.',
        detail: {
          label: '캠페인 상세',
          description:
            '캠페인 대상 세그먼트와 발송 문구, 회원별 반응 결과를 확인합니다.',
        },
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
        tabKey: 'performance-conversion',
        path: '/performance/conversion',
        label: '전환율',
        description:
          '마케팅 전후 이탈률 추이와 세그먼트별 반응률·위험도 분포를 확인합니다.',
      },
      {
        tabKey: 'performance-economic',
        path: '/performance/economic',
        label: '경제적 효과',
        description: '마케팅 전후 이용대금 변화와 손실 방지 효과를 확인합니다.',
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

/**
 * Page heading text for the given pathname, taken from the same nav item the
 * sidebar renders so the two never drift apart. A path nested under an item
 * with a `detail` route resolves to that detail page's text instead.
 */
export function getPageMeta(
  pathname: string,
): { title: string; description: string; detailSegment: string | null } | null {
  const active = findActiveNavItem(pathname);
  if (!active) {
    return null;
  }

  const { item } = active;
  if (item.detail && pathname.startsWith(`${item.path}/`)) {
    return {
      title: item.detail.label,
      description: item.detail.description,
      detailSegment: decodeURIComponent(pathname.slice(item.path.length + 1)),
    };
  }

  return {
    title: item.label,
    description: item.description,
    detailSegment: null,
  };
}
