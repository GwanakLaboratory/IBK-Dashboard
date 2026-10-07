// 타겟 발송 목데이터 (AI 추천 세그먼트 · 조건 · 무작위 추출 · 채널 · 문구). 실제 캠페인/발송 API 연동 전까지 사용한다.
import type { RiskLevel } from '@/types/churn';

export type SendChannelKey = 'tm' | 'kakao' | 'sms' | 'push';

export type SendChannel = {
  key: SendChannelKey;
  /** 정식 이름 (접촉 이력 · CMO 전달 안내) */
  label: string;
  /** 칩에 쓰는 짧은 이름 */
  shortLabel: string;
  /** 건당 비용 · 발송 조건 */
  cost: string;
  /** 채널 칩 배경 · 글자 */
  chipClassName: string;
  /** 채널 점 · 선택 칩 테두리 */
  dotClassName: string;
  selectedClassName: string;
};

/** 타겟 발송 화면의 채널 순서 그대로 */
export const SEND_CHANNELS: SendChannel[] = [
  {
    key: 'tm',
    label: '텔레마케팅',
    shortLabel: '텔레마케팅',
    cost: '건당 1,200원',
    chipClassName: 'bg-orange-100 text-orange-700',
    dotClassName: 'bg-orange-700',
    selectedClassName: 'border-orange-700 bg-orange-100 text-orange-700',
  },
  {
    key: 'kakao',
    label: '카카오 알림톡',
    shortLabel: '카카오',
    cost: '건당 8원',
    chipClassName: 'bg-yellow-100 text-yellow-800',
    dotClassName: 'bg-yellow-800',
    selectedClassName: 'border-yellow-800 bg-yellow-100 text-yellow-800',
  },
  {
    key: 'sms',
    label: '문자',
    shortLabel: '문자',
    cost: '건당 27원',
    chipClassName: 'bg-sky-100 text-sky-700',
    dotClassName: 'bg-sky-700',
    selectedClassName: 'border-sky-700 bg-sky-100 text-sky-700',
  },
  {
    key: 'push',
    label: '앱 푸시',
    shortLabel: '앱 푸시',
    cost: '무료 · 앱 알림 동의 고객만',
    chipClassName: 'bg-blue-50 text-blue-700',
    dotClassName: 'bg-blue-700',
    selectedClassName: 'border-blue-700 bg-blue-50 text-blue-700',
  },
];

export function findSendChannel(key: SendChannelKey) {
  return (
    SEND_CHANNELS.find((channel) => channel.key === key) ?? SEND_CHANNELS[0]
  );
}

/** 조건 · 무작위 추출 대상의 기본 채널 */
export type SendSegment = {
  id: string;
  name: string;
  /** 추천 혜택 (칩 앞부분) */
  benefit: string;
  channel: SendChannelKey;
  condition: string;
  description: string;
  count: number;
  averageScore: number;
  /** 하나만 골랐을 때 AI 분석 문장 */
  insight: string;
  recommendation: string;
  /** 예상 반응률 (%) */
  expectedResponse: number;
};

export const SEND_SEGMENTS: SendSegment[] = [
  {
    id: 's1',
    name: '고가치 회원 이용 급감',
    benefit: '혜택',
    channel: 'tm',
    condition: '연 이용 1천만 원↑ · 이용금액 급감',
    description:
      '연 이용 상위 12% 중 이용금액이 급감한 회원의 이탈률이 3.2배 높아요.',
    count: 1342,
    averageScore: 91,
    insight:
      '고가치 회원 이용 급감 세그먼트는 이용금액 급감 비중이 가장 높아요.',
    recommendation: '추천 혜택 × 텔레마케팅 · 예상 반응 42.9%',
    expectedResponse: 42.9,
  },
  {
    id: 's2',
    name: '연회비 청구 D-30 · 혜택 미사용',
    benefit: '연회비',
    channel: 'kakao',
    condition: '연회비 청구 30일 이내 · 혜택 이용 저하',
    description:
      '청구 직전에 혜택을 안 쓴 회원의 해지 신청이 청구 월에 몰려요.',
    count: 1063,
    averageScore: 88,
    insight: '연회비 청구 전 혜택 미사용 회원은 청구 직후 해지 비중이 높아요.',
    recommendation: '추천 연회비 혜택 안내 × 카카오 · 예상 반응 31.4%',
    expectedResponse: 31.4,
  },
  {
    id: 's3',
    name: '타사 카드 전환 추정 · 카페/외식',
    benefit: '업종 캐시백',
    channel: 'kakao',
    condition: '타사 카드 전환 · 주 이용 업종 카페/외식',
    description: '카페/외식 결제가 타사 카드로 옮겨간 비중이 가장 커요.',
    count: 1270,
    averageScore: 86,
    insight:
      '카페/외식 결제가 줄어든 시점과 타사 카드 신규 발급 시점이 겹쳐요.',
    recommendation: '추천 업종 캐시백 × 카카오 · 예상 반응 27.8%',
    expectedResponse: 27.8,
  },
  {
    id: 's4',
    name: '휴면 전환 직전',
    benefit: '혜택',
    channel: 'sms',
    condition: '60일 이상 미이용 · 휴면 전환 30일 전',
    description:
      '휴면 전환 후 복귀율은 4%대라 전환 전 접촉이 가장 효과적이에요.',
    count: 3759,
    averageScore: 84,
    insight: '휴면 전환 30일 전 회원은 첫 결제 혜택에 가장 크게 반응해요.',
    recommendation: '추천 첫 결제 혜택 × 문자 · 예상 반응 18.6%',
    expectedResponse: 18.6,
  },
];

export type ConditionGroupKey =
  'risk' | 'gender' | 'age' | 'reason' | 'category' | 'spend' | 'idle' | 'fee';

export type ConditionPick = Record<ConditionGroupKey, string[]>;

export const CONDITION_GROUPS: {
  key: ConditionGroupKey;
  label: string;
  options: string[];
}[] = [
  { key: 'risk', label: '위험도', options: ['위험', '중위험', '저위험'] },
  { key: 'gender', label: '성별', options: ['여성', '남성'] },
  {
    key: 'age',
    label: '연령대',
    options: ['20대', '30대', '40대', '50대', '60대 이상'],
  },
  {
    key: 'reason',
    label: '주요 이탈 사유',
    options: [
      '이용금액 급감',
      '혜택 이용 저하',
      '연회비 청구 임박',
      '타사 카드 전환',
    ],
  },
  {
    key: 'category',
    label: '주 이용 업종',
    options: ['카페/외식', '배달', '쇼핑', '편의점', '주유'],
  },
  {
    key: 'spend',
    label: '연간 이용금액',
    options: ['1천만 원 이상', '500만~1천만 원', '500만 원 미만'],
  },
  {
    key: 'idle',
    label: '미이용 기간',
    options: ['30~59일', '60일 이상 (휴면 직전)'],
  },
  { key: 'fee', label: '연회비 청구', options: ['30일 이내', '31~60일'] },
];

/** 위험도 옵션 → 위험 등급 (칩 색) */
export const RISK_OPTION_LEVEL: Record<string, RiskLevel> = {
  위험: 'high',
  중위험: 'medium',
  저위험: 'low',
};

/** 위험도별 회원 수. 조건 인원 계산의 시작 모수. */
export const RISK_OPTION_COUNT: Record<string, number> = {
  위험: 18950,
  중위험: 18452,
  저위험: 145238,
};

export const ALL_MEMBER_COUNT = 182640;

export const EMPTY_CONDITION_PICK: ConditionPick = {
  risk: [],
  gender: [],
  age: [],
  reason: [],
  category: [],
  spend: [],
  idle: [],
  fee: [],
};

export type RandomPool = {
  key: 'risk' | 'all';
  label: string;
  count: number;
  levels: RiskLevel[];
};

export const RANDOM_POOLS: RandomPool[] = [
  { key: 'risk', label: '위험 회원 18,950명', count: 18950, levels: ['high'] },
  {
    key: 'all',
    label: '위험 + 중위험 37,402명',
    count: 37402,
    levels: ['high', 'medium'],
  },
];

export const RANDOM_SIZES = [500, 1000, 3000, 5000];

export type MessageTemplate = {
  /** AI 추천 발송 시각 (HH:mm) */
  recommendedTime: string;
  recommendedTimeLabel: string;
  variants: { text: string; responseRate: number }[];
};

/** AI 추천 세그먼트별 문구 (텔레마케팅 세그먼트는 문구가 없다) */
export const SEGMENT_MESSAGES: Record<string, MessageTemplate> = {
  s2: {
    recommendedTime: '10:00',
    recommendedTimeLabel: '평일 오전 10시',
    variants: [
      {
        text: '연회비 청구 전 꼭 챙기세요! {이름}님이 안 쓰신 [주유·마트] 혜택으로 이번 달 [최대 3만 원]을 돌려받을 수 있어요.',
        responseRate: 41.2,
      },
      {
        text: '{이름}님, 아직 안 쓰신 혜택이 [3가지] 남아 있어요. [10월 31일]까지 쓰시면 연회비 [50%]를 돌려드려요.',
        responseRate: 38.5,
      },
    ],
  },
  s3: {
    recommendedTime: '11:30',
    recommendedTimeLabel: '평일 점심 11시 30분',
    variants: [
      {
        text: '{이름}님, 자주 가시는 [카페/외식] 결제 시 [10%] 캐시백을 드려요. 이번 달 [최대 1만 원]까지 적립됩니다.',
        responseRate: 40.9,
      },
      {
        text: '{이름}님만을 위한 [카페/외식] 캐시백! [10월 31일]까지 3회 이상 결제하면 [5천 원]을 돌려드려요.',
        responseRate: 40.1,
      },
    ],
  },
  s4: {
    recommendedTime: '19:00',
    recommendedTimeLabel: '평일 저녁 7시',
    variants: [
      {
        text: '[IBK카드] {이름}님, 오랜만이에요! [10월 31일]까지 첫 결제 시 [5천 원] 캐시백을 드려요.',
        responseRate: 19.4,
      },
      {
        text: '[IBK카드] {이름}님의 카드가 곧 휴면으로 바뀌어요. 지금 결제하면 [1만 원] 혜택을 드려요.',
        responseRate: 17.8,
      },
    ],
  },
};

/** 조건 · 무작위 추출 대상의 채널별 문구 */
export const CHANNEL_MESSAGES: Partial<
  Record<SendChannelKey, MessageTemplate>
> = {
  kakao: {
    recommendedTime: '11:30',
    recommendedTimeLabel: '평일 점심 11시 30분',
    variants: [
      {
        text: '{이름}님, 이번 달 [IBK카드]로 결제하면 [최대 2만 원]을 돌려드려요. 지금 혜택을 확인해 보세요.',
        responseRate: 36.4,
      },
      {
        text: '{이름}님만을 위한 [10%] 청구할인! [10월 31일]까지 자주 쓰는 업종에서 결제해 보세요.',
        responseRate: 34.9,
      },
    ],
  },
  sms: {
    recommendedTime: '19:00',
    recommendedTimeLabel: '평일 저녁 7시',
    variants: [
      {
        text: '[IBK카드] {이름}님, [10월 31일]까지 결제 시 [5천 원] 캐시백을 드려요.',
        responseRate: 18.2,
      },
      {
        text: '[IBK카드] {이름}님께 드리는 혜택! 이번 달 [3회] 이상 결제하면 [1만 원]을 돌려드려요.',
        responseRate: 16.9,
      },
    ],
  },
  push: {
    recommendedTime: '18:00',
    recommendedTimeLabel: '평일 오후 6시',
    variants: [
      {
        text: '{이름}님 맞춤 혜택이 도착했어요. 자주 쓰는 업종 [10%] 할인을 지금 확인해 보세요.',
        responseRate: 24.1,
      },
      {
        text: '{이름}님, 이번 달 [IBK카드]로 결제하면 [최대 2만 원]을 돌려드려요.',
        responseRate: 22.6,
      },
    ],
  },
};

export const SEND_TIME_OPTIONS = [
  '09:00',
  '10:00',
  '11:30',
  '14:00',
  '18:00',
  '19:00',
];

/** 예약 발송 기본 날짜 · 고를 수 있는 가장 이른 날짜 (데모 기준일) */
export const DEFAULT_SEND_DATE = '2026-10-08';
export const MIN_SEND_DATE = '2026-10-07';
