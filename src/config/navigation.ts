import {
  BarChart3,
  Megaphone,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export type NavSectionKey = 'status' | 'target' | 'marketing' | 'performance';

/** 사이드바 메뉴 이름 키 (layout.sidebar.nav.<키>) */
export type NavLabelKey = NavSectionKey | 'marketingSend' | 'marketingHistory';

export type NavSection = {
  key: NavSectionKey;
  icon: LucideIcon;
  /** 사이드바에서 누르면 이동할 첫 화면 */
  path: string;
  /** 이 경로로 시작하면 사이드바에서 활성으로 표시한다 */
  basePath: string;
  /** 사이드바 안에서 펼쳐 보여줄 하위 메뉴 (섹션이 활성일 때만) */
  children?: { to: string; labelKey: NavLabelKey }[];
};

/** 사이드바 메뉴. 하위 화면은 사이드바 하위 메뉴(children)나 화면 안 버튼으로 이동한다. */
export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'status',
    icon: BarChart3,
    path: '/dashboard',
    basePath: '/dashboard',
  },
  {
    key: 'target',
    icon: Target,
    path: '/target',
    basePath: '/target',
  },
  {
    key: 'marketing',
    icon: Megaphone,
    path: '/marketing/send',
    basePath: '/marketing',
    children: [
      { to: '/marketing/send', labelKey: 'marketingSend' },
      { to: '/marketing/history', labelKey: 'marketingHistory' },
    ],
  },
  {
    key: 'performance',
    icon: TrendingUp,
    path: '/performance',
    basePath: '/performance',
  },
];

// 섹션별 페이지 제목(PageHeader 기본값)은 번역 파일의 layout.pageHead.<섹션> 에 있다

/** 데이터 기준일 (매월 1일 갱신) */
export const DATA_UPDATED_AT = '2026.10.01';
/** 데이터 기준 월 ('YY.MM'). 화면 표시는 formatFullMonth */
export const DATA_BASE_MONTH = '26.09';
