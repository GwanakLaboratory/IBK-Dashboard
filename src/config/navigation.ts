import {
  BarChart3,
  Megaphone,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export type NavSectionKey = 'status' | 'target' | 'marketing' | 'performance';

export type NavSection = {
  key: NavSectionKey;
  label: string;
  icon: LucideIcon;
  /** 사이드바에서 누르면 이동할 첫 화면 */
  path: string;
  /** 이 경로로 시작하면 사이드바에서 활성으로 표시한다 */
  basePath: string;
  /** 사이드바 안에서 펼쳐 보여줄 하위 메뉴 (섹션이 활성일 때만) */
  children?: { to: string; label: string }[];
};

/** 사이드바 메뉴. 하위 화면은 사이드바 하위 메뉴(children) 또는 페이지 제목 아래 탭(SECTION_TABS)으로 이동한다. */
export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'status',
    label: '대시보드',
    icon: BarChart3,
    path: '/dashboard',
    basePath: '/dashboard',
  },
  {
    key: 'target',
    label: '위험 타겟',
    icon: Target,
    path: '/target/members',
    basePath: '/target',
  },
  {
    key: 'marketing',
    label: '마케팅 대응',
    icon: Megaphone,
    path: '/marketing/send',
    basePath: '/marketing',
    children: [
      { to: '/marketing/send', label: '타겟 발송' },
      { to: '/marketing/history', label: '접촉 이력' },
    ],
  },
  {
    key: 'performance',
    label: '관리 및 성과',
    icon: TrendingUp,
    path: '/performance',
    basePath: '/performance',
  },
];

export type PageHead = {
  eyebrow: string;
  title: string;
  description: string;
};

/** 섹션별 페이지 제목 (PageHeader 기본값) */
export const PAGE_HEADS: Record<NavSectionKey, PageHead> = {
  status: {
    eyebrow: 'RETENTION OVERVIEW',
    title: '고객 이탈 인사이트',
    description: '최근 이용 고객의 이탈 위험 현황',
  },
  target: {
    eyebrow: 'RISK TARGET',
    title: '위험 타겟',
    description:
      '이탈 예측 점수로 위험 회원과 카드 상품을 찾고 우선순위를 정해요',
  },
  marketing: {
    eyebrow: 'MARKETING',
    title: '마케팅 대응',
    description: '이탈 위험 회원에게 맞춤 문구를 보내고 반응을 관리해요',
  },
  performance: {
    eyebrow: 'PERFORMANCE',
    title: '관리 및 성과',
    description: '이탈 방지 활동이 실제로 이탈을 줄였는지 대조군과 비교해요',
  },
};

export type SectionTab = {
  to: string;
  label: string;
};

/** 페이지 제목 아래 밑줄 탭 (하위 화면 이동) */
export const SECTION_TABS: Partial<Record<NavSectionKey, SectionTab[]>> = {
  target: [
    { to: '/target/members', label: '회원' },
    { to: '/target/cards', label: '카드 상품' },
  ],
};

/** 데이터 기준일 (매월 1일 갱신) */
export const DATA_UPDATED_AT = '2026.10.01';
export const DATA_BASE_MONTH_LABEL = '2026년 9월';
