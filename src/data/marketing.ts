// 타겟 발송 목데이터 (AI 추천 세그먼트 · 조건 · 무작위 추출 · 채널 · 문구). 실제 캠페인/발송 API 연동 전까지 사용한다.
import { CHURN_REASONS, MEMBER_COUNT_BY_LEVEL } from '@/data/target';
import i18n from '@/i18n';
import {
  ageGroupLabel,
  churnReasonLabel,
  genderLabel,
  riskLevelLabel,
} from '@/i18n/domain';
import { formatNumber } from '@/i18n/format';
import type ko from '@/i18n/locales/ko.json';
import type {
  AgeGroup,
  ChurnReason,
  ContactChannel,
  Gender,
  RiskLevel,
} from '@/types/churn';

type KoMarketingSend = (typeof ko)['marketingSend'];

export type SendChannelKey = Exclude<ContactChannel, 'email'>;

export type SendChannel = {
  key: SendChannelKey;
  /* 정식 이름 · 짧은 이름은 channelLabel / channelShortLabel (@/i18n/domain),
     건당 비용은 marketingSend.channel.cost.<key> */
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
    chipClassName: 'bg-orange-100 text-orange-700',
    dotClassName: 'bg-orange-700',
    selectedClassName: 'border-orange-700 bg-orange-100 text-orange-700',
  },
  {
    key: 'kakao',
    chipClassName: 'bg-yellow-100 text-yellow-800',
    dotClassName: 'bg-yellow-800',
    selectedClassName: 'border-yellow-800 bg-yellow-100 text-yellow-800',
  },
  {
    key: 'sms',
    chipClassName: 'bg-sky-100 text-sky-700',
    dotClassName: 'bg-sky-700',
    selectedClassName: 'border-sky-700 bg-sky-100 text-sky-700',
  },
  {
    key: 'push',
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

/** AI 추천 세그먼트 id. 문구는 marketingSend.segment.<id>.* */
export type SendSegmentId = keyof KoMarketingSend['segment'];

export type SendSegment = {
  id: SendSegmentId;
  channel: SendChannelKey;
  count: number;
  averageScore: number;
  /** 예상 반응률 (%) */
  expectedResponse: number;
};

/** 세그먼트 문구 (이름 · 혜택 칩 · 조건 · 설명 · 하나만 골랐을 때 AI 분석 문장 · 추천 요약) */
export type SendSegmentField = keyof KoMarketingSend['segment']['s1'];

export const sendSegmentText = (id: SendSegmentId, field: SendSegmentField) =>
  i18n.t(`marketingSend.segment.${id}.${field}`);

export const sendSegmentName = (id: SendSegmentId) =>
  sendSegmentText(id, 'name');

export const SEND_SEGMENTS: SendSegment[] = [
  {
    id: 's1',
    channel: 'tm',
    count: 11432,
    averageScore: 91,
    expectedResponse: 42.9,
  },
  {
    id: 's2',
    channel: 'kakao',
    count: 9055,
    averageScore: 88,
    expectedResponse: 31.4,
  },
  {
    id: 's3',
    channel: 'kakao',
    count: 10818,
    averageScore: 86,
    expectedResponse: 27.8,
  },
  {
    id: 's4',
    channel: 'sms',
    count: 32020,
    averageScore: 84,
    expectedResponse: 18.6,
  },
];

export type ConditionGroupKey =
  'risk' | 'gender' | 'age' | 'reason' | 'category' | 'spend' | 'idle' | 'fee';

/** 그룹별로 고른 옵션 코드 */
export type ConditionPick = Record<ConditionGroupKey, string[]>;

type KoConditionOption = KoMarketingSend['condition']['option'];
export type AgeOption =
  Exclude<AgeGroup, '60s'> | keyof KoConditionOption['age'];

/** 옵션 값은 코드. 화면 표시는 conditionOptionLabel */
export const CONDITION_GROUPS: {
  key: ConditionGroupKey;
  options: string[];
}[] = [
  { key: 'risk', options: ['high', 'medium', 'low'] satisfies RiskLevel[] },
  { key: 'gender', options: ['female', 'male'] satisfies Gender[] },
  {
    key: 'age',
    options: ['20s', '30s', '40s', '50s', '60plus'] satisfies AgeOption[],
  },
  { key: 'reason', options: CHURN_REASONS },
  {
    key: 'category',
    options: [
      'cafeDining',
      'delivery',
      'shopping',
      'convenienceStore',
      'fuel',
    ] satisfies (keyof KoConditionOption['category'])[],
  },
  {
    key: 'spend',
    options: [
      'over10m',
      'from5mTo10m',
      'under5m',
    ] satisfies (keyof KoConditionOption['spend'])[],
  },
  {
    key: 'idle',
    options: [
      'from30To59',
      'over60',
    ] satisfies (keyof KoConditionOption['idle'])[],
  },
  {
    key: 'fee',
    options: [
      'within30',
      'from31To60',
    ] satisfies (keyof KoConditionOption['fee'])[],
  },
];

/** 조건 그룹 이름 (예: 위험도) */
export const conditionGroupLabel = (key: ConditionGroupKey) =>
  i18n.t(`marketingSend.condition.group.${key}`);

/** 조건 옵션 코드 → 현재 언어 문구 */
export function conditionOptionLabel(
  group: ConditionGroupKey,
  option: string,
): string {
  switch (group) {
    case 'risk':
      return riskLevelLabel(option as RiskLevel);
    case 'gender':
      return genderLabel(option as Gender);
    case 'reason':
      return churnReasonLabel(option as ChurnReason);
    case 'age':
      return option === '60plus'
        ? i18n.t('marketingSend.condition.option.age.60plus')
        : ageGroupLabel(option as AgeGroup);
    case 'category':
      return i18n.t(
        `marketingSend.condition.option.category.${option as keyof KoConditionOption['category']}`,
      );
    case 'spend':
      return i18n.t(
        `marketingSend.condition.option.spend.${option as keyof KoConditionOption['spend']}`,
      );
    case 'idle':
      return i18n.t(
        `marketingSend.condition.option.idle.${option as keyof KoConditionOption['idle']}`,
      );
    case 'fee':
      return i18n.t(
        `marketingSend.condition.option.fee.${option as keyof KoConditionOption['fee']}`,
      );
  }
}

/** 위험도 옵션 → 위험 등급 (칩 색) */
export const RISK_OPTION_LEVEL: Record<string, RiskLevel> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

/** 위험도별 회원 수 (회원 목록과 같은 값). 조건 인원 계산의 시작 모수. */
export const RISK_OPTION_COUNT: Record<string, number> = {
  high: MEMBER_COUNT_BY_LEVEL.high,
  medium: MEMBER_COUNT_BY_LEVEL.medium,
  low: MEMBER_COUNT_BY_LEVEL.low,
};

export const ALL_MEMBER_COUNT = MEMBER_COUNT_BY_LEVEL.all;

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

/** 무작위 추출 모집단. 이름은 marketingSend.random.pool.<key> */
export type RandomPool = {
  key: 'risk' | 'all';
  count: number;
  levels: RiskLevel[];
};

export const RANDOM_POOLS: RandomPool[] = [
  {
    key: 'risk',
    count: MEMBER_COUNT_BY_LEVEL.high,
    levels: ['high'],
  },
  {
    key: 'all',
    count: MEMBER_COUNT_BY_LEVEL.high + MEMBER_COUNT_BY_LEVEL.medium,
    levels: ['high', 'medium'],
  },
];

/** 모집단 이름 (예: 위험 회원 131,186명) */
export const randomPoolLabel = (pool: RandomPool) =>
  i18n.t(`marketingSend.random.pool.${pool.key}`, {
    value: formatNumber(pool.count),
  });

export const RANDOM_SIZES = [500, 1000, 3000, 5000];

/** 문구 템플릿 id. 문구는 marketingSend.template.<id>.* */
export type MessageTemplateId = keyof KoMarketingSend['template'];
type TemplateVariantKey = Exclude<
  keyof KoMarketingSend['template']['s2'],
  'timeLabel'
>;

export type MessageTemplate = {
  id: MessageTemplateId;
  /** AI 추천 발송 시각 (HH:mm) */
  recommendedTime: string;
  /** 문구 순서대로 (첫 문구가 추천) */
  variants: { key: TemplateVariantKey; responseRate: number }[];
};

/** AI 추천 발송 시각 설명 (예: 평일 오전 10시) */
export const templateTimeLabel = (template: MessageTemplate) =>
  i18n.t(`marketingSend.template.${template.id}.timeLabel`);

/**
 * 템플릿 문구. {이름}(영어는 {name})은 받는 분 이름 자리,
 * [ ] 부분은 발송 전에 확인할 값이다.
 */
export const templateVariantText = (
  template: MessageTemplate,
  index: number,
) => {
  const variant = template.variants[index] ?? template.variants[0];
  return i18n.t(`marketingSend.template.${template.id}.${variant.key}`);
};

/** AI 추천 세그먼트별 문구 (텔레마케팅 세그먼트는 문구가 없다) */
export const SEGMENT_MESSAGES: Partial<Record<SendSegmentId, MessageTemplate>> =
  {
    s2: {
      id: 's2',
      recommendedTime: '10:00',
      variants: [
        { key: 'v1', responseRate: 41.2 },
        { key: 'v2', responseRate: 38.5 },
      ],
    },
    s3: {
      id: 's3',
      recommendedTime: '11:30',
      variants: [
        { key: 'v1', responseRate: 40.9 },
        { key: 'v2', responseRate: 40.1 },
      ],
    },
    s4: {
      id: 's4',
      recommendedTime: '19:00',
      variants: [
        { key: 'v1', responseRate: 19.4 },
        { key: 'v2', responseRate: 17.8 },
      ],
    },
  };

/** 조건 · 무작위 추출 대상의 채널별 문구 */
export const CHANNEL_MESSAGES: Partial<
  Record<SendChannelKey, MessageTemplate>
> = {
  kakao: {
    id: 'kakao',
    recommendedTime: '11:30',
    variants: [
      { key: 'v1', responseRate: 36.4 },
      { key: 'v2', responseRate: 34.9 },
    ],
  },
  sms: {
    id: 'sms',
    recommendedTime: '19:00',
    variants: [
      { key: 'v1', responseRate: 18.2 },
      { key: 'v2', responseRate: 16.9 },
    ],
  },
  push: {
    id: 'push',
    recommendedTime: '18:00',
    variants: [
      { key: 'v1', responseRate: 24.1 },
      { key: 'v2', responseRate: 22.6 },
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
