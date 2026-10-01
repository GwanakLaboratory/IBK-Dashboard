// 마케팅 대응 · 성과 리포트 화면 목데이터. 실제 캠페인/발송 API 연동 전까지 사용한다.
import { customers } from '@/data/customers';
import type { RiskLevel } from '@/types/churn';

export type SegmentGroupKey =
  | 'risk'
  | 'gender'
  | 'age'
  | 'reason'
  | 'category'
  | 'value'
  | 'idle'
  | 'feeDue';

export type SegmentPick = Partial<Record<SegmentGroupKey, string[]>>;

export type SegmentOption = {
  value: string;
  label: string;
  /** 이전 단계 모수 중 이 조건에 해당하는 비율 (0~1). 위험도는 실제 분포로 채운다. */
  share: number;
};

export type SegmentGroup = {
  key: SegmentGroupKey;
  label: string;
  options: SegmentOption[];
};

/** 위험도 옵션을 제외한 조건 그룹. 위험도는 대시보드 위험도 분포에서 만든다. */
export const SEGMENT_GROUPS_WITHOUT_RISK: SegmentGroup[] = [
  {
    key: 'gender',
    label: '성별',
    options: [
      { value: 'F', label: '여성', share: 0.48 },
      { value: 'M', label: '남성', share: 0.52 },
    ],
  },
  {
    key: 'age',
    label: '연령대',
    options: [
      { value: '20', label: '20대', share: 0.16 },
      { value: '30', label: '30대', share: 0.24 },
      { value: '40', label: '40대', share: 0.26 },
      { value: '50', label: '50대', share: 0.2 },
      { value: '60', label: '60대 이상', share: 0.14 },
    ],
  },
  {
    key: 'reason',
    label: '주요 이탈 사유',
    options: [
      { value: 'drop', label: '이용금액 급감', share: 0.31 },
      { value: 'benefit', label: '혜택 이용 저하', share: 0.22 },
      { value: 'fee', label: '연회비 청구 임박', share: 0.18 },
      { value: 'switch', label: '타사 카드 전환', share: 0.16 },
    ],
  },
  {
    key: 'category',
    label: '주 이용 업종',
    options: [
      { value: 'cafe', label: '카페/외식', share: 0.22 },
      { value: 'delivery', label: '배달', share: 0.18 },
      { value: 'shop', label: '쇼핑', share: 0.2 },
      { value: 'store', label: '편의점', share: 0.14 },
      { value: 'fuel', label: '주유', share: 0.12 },
    ],
  },
  {
    key: 'value',
    label: '연간 이용금액',
    options: [
      { value: 'high', label: '1천만 원 이상', share: 0.12 },
      { value: 'mid', label: '500만~1천만 원', share: 0.21 },
      { value: 'low', label: '500만 원 미만', share: 0.67 },
    ],
  },
  {
    key: 'idle',
    label: '미이용 기간',
    options: [
      { value: '30', label: '30~59일', share: 0.11 },
      { value: '60', label: '60일 이상 (휴면 직전)', share: 0.07 },
    ],
  },
  {
    key: 'feeDue',
    label: '연회비 청구',
    options: [
      { value: 'd30', label: '30일 이내', share: 0.09 },
      { value: 'd60', label: '31~60일', share: 0.08 },
    ],
  },
];

export const RISK_SEGMENT_VALUE: Record<RiskLevel, string> = {
  high: '2',
  medium: '1',
  low: '0',
};

export type AiSegmentPreset = {
  label: string;
  /** 카드에 보여줄 조건 요약 */
  condition: string;
  /** 이 세그먼트를 추천한 근거 */
  basis: string;
  averageChurnScore: number;
  /** 추천 테마 · 채널 표시 문구 */
  recommendation: string;
  pick: SegmentPick;
  theme: MessageThemeKey;
  channel: SendChannelKey;
};

export const AI_SEGMENT_PRESETS: AiSegmentPreset[] = [
  {
    label: '고가치 회원 이용 급감',
    condition: '연 이용 1천만 원↑ · 이용금액 급감',
    basis: '연 이용 상위 12% 중 이용금액 급감 회원의 이탈률이 3.2배 높아요',
    averageChurnScore: 91,
    recommendation: '혜택 · 텔레마케팅',
    pick: { risk: ['2'], reason: ['drop'], value: ['high'] },
    theme: 'benefit',
    channel: 'tm',
  },
  {
    label: '연회비 청구 D-30 · 혜택 미사용',
    condition: '연회비 청구 30일 이내 · 혜택 이용 저하',
    basis: '청구 직전에 혜택을 안 쓴 회원의 해지 신청이 청구 월에 몰려요',
    averageChurnScore: 88,
    recommendation: '연회비 · 카카오',
    pick: { risk: ['2', '1'], reason: ['benefit'], feeDue: ['d30'] },
    theme: 'fee',
    channel: 'kakao',
  },
  {
    label: '타사 카드 전환 추정 · 카페/외식',
    condition: '타사 카드 전환 · 주 이용 업종 카페/외식',
    basis: '카페/외식 결제가 타사 카드로 옮겨간 비중이 가장 커요',
    averageChurnScore: 86,
    recommendation: '업종 캐시백 · 카카오',
    pick: { risk: ['2'], reason: ['switch'], category: ['cafe'] },
    theme: 'cashback',
    channel: 'kakao',
  },
  {
    label: '휴면 전환 직전',
    condition: '60일 이상 미이용 · 휴면 전환 30일 전',
    basis: '휴면 전환 후 복귀율은 4%대라 전환 전 접촉이 가장 효과적이에요',
    averageChurnScore: 84,
    recommendation: '혜택 · 문자',
    pick: { risk: ['2', '1'], idle: ['60'] },
    theme: 'benefit',
    channel: 'sms',
  },
];

export const DEFAULT_SEGMENT_PICK: SegmentPick = AI_SEGMENT_PRESETS[0].pick;

export type MessageThemeKey =
  'benefit' | 'fee' | 'thanks' | 'season' | 'cashback' | 'persona';

export type MessageVariant = {
  text: string;
  /** 채널 기본 반응률에 더해지는 예상 반응률 가산치 (%p) */
  rateDelta: number;
};

export type MessageTheme = {
  key: MessageThemeKey;
  label: string;
  variants: MessageVariant[];
};

/** 업종·페르소나 문구는 선택한 조건에 따라 문장이 바뀌어 함수로 만든다. */
export function buildMessageThemes(
  cashbackCategory: string,
  personaLabel: string,
): MessageTheme[] {
  return [
    {
      key: 'benefit',
      label: '혜택',
      variants: [
        {
          text: '{이름}님, 이번 달 IBK카드로 [카페·배달] 결제 시 최대 [10%] 할인을 드려요. 지금 앱에서 확인해 보세요.',
          rateDelta: 1.2,
        },
        {
          text: '{이름}님만을 위한 [주유·교통] 캐시백이 준비됐어요. [9월 30일]까지 쓰시면 자동으로 적립됩니다.',
          rateDelta: 0.4,
        },
      ],
    },
    {
      key: 'fee',
      label: '연회비',
      variants: [
        {
          text: '{이름}님, 다음 달까지 [30만 원] 이상 이용하시면 올해 연회비를 면제해 드려요.',
          rateDelta: 2.1,
        },
        {
          text: '연회비 청구 전에 알려드려요. {이름}님은 [조건] 충족 시 연회비 [50%] 감면 대상입니다.',
          rateDelta: 0.9,
        },
      ],
    },
    {
      key: 'thanks',
      label: '이용 감사',
      variants: [
        {
          text: '{이름}님, IBK카드와 함께해 주셔서 감사합니다. 고마운 마음을 담아 [쿠폰 내용]을 보내드려요.',
          rateDelta: 0.6,
        },
        {
          text: '{이름}님과 함께한 [5년], 감사의 마음으로 [특별 포인트]를 적립해 드렸어요.',
          rateDelta: 1.0,
        },
      ],
    },
    {
      key: 'season',
      label: '날씨·계절',
      variants: [
        {
          text: '선선한 가을, {이름}님의 나들이를 응원해요. [여행·레저] 결제 시 [5%] 청구할인을 드려요.',
          rateDelta: 0.8,
        },
        {
          text: '환절기 건강 챙기세요, {이름}님. [약국·병원] 결제 시 포인트를 [2배] 적립해 드려요.',
          rateDelta: 0.3,
        },
      ],
    },
    {
      key: 'cashback',
      label: '업종 캐시백',
      variants: [
        {
          text: `{이름}님, 자주 가시는 [${cashbackCategory}] 결제 시 [10%] 캐시백을 드려요. 이번 달 [최대 1만 원]까지 적립됩니다.`,
          rateDelta: 2.4,
        },
        {
          text: `{이름}님만을 위한 [${cashbackCategory}] 캐시백! [9월 30일]까지 3회 이상 결제하면 [5천 원]을 돌려드려요.`,
          rateDelta: 1.6,
        },
      ],
    },
    {
      key: 'persona',
      label: '성별·연령대 맞춤',
      variants: [
        {
          text: `{이름}님, ${personaLabel} 고객님이 가장 많이 쓰는 [온라인쇼핑] 혜택을 모았어요. 이번 달 [3만 원] 이상 결제 시 [5천 포인트]를 드려요.`,
          rateDelta: 1.8,
        },
        {
          text: `요즘 ${personaLabel} 고객님들은 [구독·OTT] 결제에 IBK카드를 많이 써요. {이름}님도 [첫 결제 할인]을 받아보세요.`,
          rateDelta: 1.1,
        },
      ],
    },
  ];
}

export type SendChannelKey = 'sms' | 'kakao' | 'tm';

export type SendChannel = {
  key: SendChannelKey;
  label: string;
  shortLabel: string;
  description: string;
  /** 채널 기본 예상 반응률 (%) */
  baseRate: number;
};

export const SEND_CHANNELS: SendChannel[] = [
  {
    key: 'sms',
    label: '문자 (LMS)',
    shortLabel: '문자',
    description: '장문 문자 · 링크 포함 가능',
    baseRate: 29.1,
  },
  {
    key: 'kakao',
    label: '카카오 알림톡',
    shortLabel: '카카오',
    description: '카카오톡 채널 · 버튼 첨부 가능',
    baseRate: 38.5,
  },
  {
    key: 'tm',
    label: '텔레마케팅',
    shortLabel: '텔레마케팅',
    description: '상담원 아웃바운드 · 소규모 대상에 적합',
    baseRate: 41.7,
  },
];

export const SCHEDULED_SEND_LABEL = '2026.10.01 (목) 10:00';

// ---------- 접촉 이력 ----------

export type ContactChannel = '문자' | '텔레마케팅' | '카카오';
export type ContactResponse = '반응' | '무반응' | '대기';

export const CONTACT_HISTORY_SUMMARY = {
  total: 36200,
  responded: 12380,
  noResponse: 21640,
  pending: 2180,
};

export type CampaignHistoryMember = {
  /** 실제 회원 상세로 이동할 수 있도록 @/data/customers 의 진짜 회원번호를 쓴다 */
  customerId: string;
  response: ContactResponse;
  channel: ContactChannel;
  respondedAt: string | null;
};

export type CampaignHistoryEntry = {
  id: string;
  date: string;
  segmentLabel: string;
  sourceLabel: string;
  channel: ContactChannel;
  message: string;
  targetCount: number;
  respondedCount: number;
  members: CampaignHistoryMember[];
};

/** CAMPAIGN_HISTORY 생성은 MONTHLY_CAMPAIGN_LOG 정의 이후, 파일 맨 아래에 있다. */

// ---------- 성과 리포트 ----------

export const CONVERSION_TARGET_COUNT = 36200;
export const CONVERSION_BEFORE_PERIOD = '2025.09–2026.02';
export const CONVERSION_AFTER_PERIOD = '2026.03–2026.08';

/** 마케팅 대상 회원의 전후 위험도 구성비 (%) */
export const CONVERSION_RISK_SHARE: Record<
  RiskLevel,
  { before: number; after: number }
> = {
  high: { before: 48, after: 26 },
  medium: { before: 34, after: 33 },
  low: { before: 18, after: 41 },
};

export const CHANNEL_RESPONSE_RATES: {
  channel: ContactChannel;
  rate: number;
}[] = [
  { channel: '텔레마케팅', rate: 41.7 },
  { channel: '카카오', rate: 38.5 },
  { channel: '문자', rate: 29.1 },
];

export const ECONOMIC_IMPACT = {
  spendDeltaEok: 11.6,
  spendDeltaPercent: 6.5,
  retainedMembers: 12480,
  /** 1인당 연간 수익 기여 (만 원, 가정치) */
  annualContributionPerMemberManwon: 55,
};

/** 마케팅 대상 월별 이용대금 (억 원). 앞 6개월 = 마케팅 전, 뒤 6개월 = 마케팅 후 */
export const MONTHLY_TARGET_SPEND: {
  month: string;
  amount: number;
  isAfter: boolean;
}[] = [
  { month: '25.09', amount: 31.2, isAfter: false },
  { month: '25.10', amount: 30.8, isAfter: false },
  { month: '25.11', amount: 30.1, isAfter: false },
  { month: '25.12', amount: 29.6, isAfter: false },
  { month: '26.01', amount: 29.0, isAfter: false },
  { month: '26.02', amount: 28.7, isAfter: false },
  { month: '26.03', amount: 29.4, isAfter: true },
  { month: '26.04', amount: 30.6, isAfter: true },
  { month: '26.05', amount: 31.8, isAfter: true },
  { month: '26.06', amount: 32.5, isAfter: true },
  { month: '26.07', amount: 33.1, isAfter: true },
  { month: '26.08', amount: 33.6, isAfter: true },
];

/** 마케팅 대상 월별 이탈률 (%). 앞 6개월 = 마케팅 전, 뒤 6개월 = 마케팅 후 */
export const MONTHLY_TARGET_CHURN_RATE: { month: string; rate: number }[] = [
  { month: '25.09', rate: 2.1 },
  { month: '25.10', rate: 2.3 },
  { month: '25.11', rate: 2.6 },
  { month: '25.12', rate: 2.8 },
  { month: '26.01', rate: 3.1 },
  { month: '26.02', rate: 3.4 },
  { month: '26.03', rate: 3.2 },
  { month: '26.04', rate: 2.9 },
  { month: '26.05', rate: 2.6 },
  { month: '26.06', rate: 2.4 },
  { month: '26.07', rate: 2.2 },
  { month: '26.08', rate: 2.1 },
];

/**
 * 마케팅을 보내지 않은 대조군의 월별 이탈률. MONTHLY_TARGET_CHURN_RATE와
 * 같은 시점(월)에 나란히 그려 캠페인의 순증 효과를 비교한다.
 */
export const MONTHLY_CONTROL_CHURN_RATE: { month: string; rate: number }[] = [
  { month: '25.09', rate: 2.1 },
  { month: '25.10', rate: 2.3 },
  { month: '25.11', rate: 2.6 },
  { month: '25.12', rate: 2.8 },
  { month: '26.01', rate: 3.1 },
  { month: '26.02', rate: 3.4 },
  { month: '26.03', rate: 3.4 },
  { month: '26.04', rate: 3.3 },
  { month: '26.05', rate: 3.3 },
  { month: '26.06', rate: 3.2 },
  { month: '26.07', rate: 3.2 },
  { month: '26.08', rate: 3.2 },
];

export type CampaignLogType = 'ai' | 'random' | 'manual';

export const CAMPAIGN_TYPE_LABEL: Record<CampaignLogType, string> = {
  ai: 'AI 추천',
  random: '무작위',
  manual: '직접 설정',
};

export type CampaignLogEntry = {
  type: CampaignLogType;
  name: string;
  /** 발송 월 — 이탈률 추이 차트에서 이 달의 마커에 묶인다 */
  month: string;
  channel: SendChannelKey;
  targetCount: number;
  respondedCount: number;
};

/** 이탈률 추이 차트의 월별 마커·툴팁에 쓰는 전체 캠페인 발송 로그. */
export const MONTHLY_CAMPAIGN_LOG: CampaignLogEntry[] = [
  {
    type: 'ai',
    name: '고가치 회원 이용 급감',
    month: '26.03',
    channel: 'tm',
    targetCount: 8400,
    respondedCount: 3530,
  },
  {
    type: 'random',
    name: '무작위 추출 A · 위험 그룹',
    month: '26.03',
    channel: 'kakao',
    targetCount: 3000,
    respondedCount: 540,
  },
  {
    type: 'ai',
    name: '연회비 청구 D-30 · 혜택 미사용',
    month: '26.04',
    channel: 'kakao',
    targetCount: 9800,
    respondedCount: 3770,
  },
  {
    type: 'manual',
    name: '위험 · 30대 여성 · 카페/외식',
    month: '26.04',
    channel: 'sms',
    targetCount: 5200,
    respondedCount: 1410,
  },
  {
    type: 'manual',
    name: '중위험 · 50대 · 주유',
    month: '26.04',
    channel: 'kakao',
    targetCount: 4300,
    respondedCount: 1120,
  },
  {
    type: 'random',
    name: '무작위 추출 B · 위험·중위험',
    month: '26.04',
    channel: 'sms',
    targetCount: 3000,
    respondedCount: 450,
  },
  {
    type: 'ai',
    name: '타사 카드 전환 추정 · 카페/외식',
    month: '26.05',
    channel: 'kakao',
    targetCount: 7600,
    respondedCount: 2510,
  },
  {
    type: 'manual',
    name: '위험 · 20대 · 배달',
    month: '26.05',
    channel: 'kakao',
    targetCount: 3900,
    respondedCount: 900,
  },
  {
    type: 'ai',
    name: '휴면 전환 직전',
    month: '26.06',
    channel: 'sms',
    targetCount: 10400,
    respondedCount: 2570,
  },
  {
    type: 'manual',
    name: '위험 · 40대 남성 · 쇼핑',
    month: '26.06',
    channel: 'sms',
    targetCount: 4800,
    respondedCount: 1060,
  },
  {
    type: 'manual',
    name: '연회비 청구 30일 이내 · 60대',
    month: '26.07',
    channel: 'tm',
    targetCount: 2100,
    respondedCount: 690,
  },
  {
    type: 'ai',
    name: '고가치 회원 이용 급감 (2차)',
    month: '26.08',
    channel: 'tm',
    targetCount: 6200,
    respondedCount: 2790,
  },
];

// ---------- 접촉 이력 · 캠페인별 대상 회원 목록 ----------
// MONTHLY_CAMPAIGN_LOG(전체 캠페인 발송 로그)를 그대로 재사용해, 캠페인마다
// 실제 회원(@/data/customers) 중 일부를 뽑아 대상 회원 표를 채운다. 회원
// 상세로 이동 가능해야 하므로 실존하지 않는 가짜 ID는 쓰지 않는다.

const CAMPAIGN_MEMBER_SAMPLE_SIZE = 24;

const CAMPAIGN_MESSAGE_OVERRIDE: Partial<Record<string, string>> = {
  '고가치 회원 이용 급감':
    '{이름}님, 최근 카드 이용이 크게 줄어든 것으로 확인되어 안부차 연락드렸습니다. 이용 중 불편하신 점을 여쭙고, 연회비 면제 조건과 맞춤 혜택을 함께 안내해 드리겠습니다.',
  '무작위 추출 A · 위험 그룹':
    '{이름}님, 고객님만을 위한 혜택을 준비했어요! 이번 달 IBK카드로 [3만 원] 이상 이용하시면 [5천 포인트]를 적립해 드려요.',
  '연회비 청구 D-30 · 혜택 미사용':
    '{이름}님, 연회비 청구까지 [30일] 남았어요. 다음 달까지 [30만 원] 이상 이용하시면 올해 연회비를 전액 면제해 드려요.',
  '위험 · 30대 여성 · 카페/외식':
    '{이름}님, 자주 가시는 [카페·외식] 결제 시 IBK카드로 최대 [10%] 청구할인을 받아보세요. 이번 달 [최대 1만 원]까지 적립됩니다.',
  '중위험 · 50대 · 주유':
    '{이름}님만을 위한 [주유] 캐시백이 준비됐어요! 이번 달 주유소 결제 시 [7%] 캐시백을 받아보세요.',
  '무작위 추출 B · 위험·중위험':
    '{이름}님, IBK카드 이용 중 불편하신 점은 없으셨나요? 지금 앱에서 고객님을 위한 맞춤 혜택을 확인해 보세요.',
  '타사 카드 전환 추정 · 카페/외식':
    '{이름}님, 요즘 자주 가시는 [카페·외식] 결제가 뜸해지셨어요. IBK카드로 결제하시면 [10%] 캐시백을 더 드려요.',
  '위험 · 20대 · 배달':
    '{이름}님, [배달 앱] 결제 시 IBK카드로 [8%] 캐시백 받아가세요! 이번 달 [2만 원] 한도로 적립됩니다.',
  '휴면 전환 직전':
    '{이름}님, 오랜만이에요! 환절기 건강 챙기시라고 [약국·병원] 결제 시 포인트 [2배] 적립 혜택을 드려요.',
  '위험 · 40대 남성 · 쇼핑':
    '{이름}님, [온라인쇼핑] 결제 시 IBK카드로 최대 [5%] 할인받아 보세요. 이번 달 한정 혜택이에요.',
  '연회비 청구 30일 이내 · 60대':
    '{이름}님, 연회비 청구를 앞두고 안내 전화 드립니다. 최근 이용 현황을 확인해 드리고, 조건 충족 시 연회비 감면 혜택을 안내해 드리겠습니다.',
  '고가치 회원 이용 급감 (2차)':
    '{이름}님, 지난 상담 이후 이용 현황을 다시 확인해 드리고자 연락드렸습니다. 연회비 면제 조건과 추가 혜택을 재안내해 드리겠습니다.',
};

const GENERIC_MESSAGE_BY_CHANNEL: Record<ContactChannel, string> = {
  텔레마케팅: '이탈 방지 상담 · 맞춤 혜택 안내',
  카카오: '고객님만을 위한 혜택을 카카오톡으로 보내드렸어요.',
  문자: '고객님, 이번 달 IBK카드 맞춤 혜택을 문자로 안내드렸어요.',
};

function sendChannelKeyToContactChannel(key: SendChannelKey): ContactChannel {
  const channel = SEND_CHANNELS.find((item) => item.key === key);
  return (channel?.shortLabel ?? '문자') as ContactChannel;
}

function buildCampaignDate(month: string, campaignIndex: number): string {
  const [, monthPart] = month.split('.');
  const day = 6 + ((campaignIndex * 5) % 22);
  return `2026.${monthPart}.${String(day).padStart(2, '0')}`;
}

function buildCampaignMembers(
  campaignIndex: number,
  channel: ContactChannel,
  responseRatio: number,
  date: string,
): CampaignHistoryMember[] {
  const sampleSize = Math.min(CAMPAIGN_MEMBER_SAMPLE_SIZE, customers.length);
  const respondedCount = Math.min(
    sampleSize,
    Math.max(1, Math.round(sampleSize * responseRatio)),
  );
  const pendingCount = Math.min(3, sampleSize - respondedCount);
  const startIndex = (campaignIndex * 7) % customers.length;

  return Array.from({ length: sampleSize }, (_, memberIndex) => {
    const customer = customers[(startIndex + memberIndex) % customers.length];
    const response: ContactResponse =
      memberIndex < respondedCount
        ? '반응'
        : memberIndex < respondedCount + pendingCount
          ? '대기'
          : '무반응';
    const respondedAt =
      response === '반응'
        ? `${date} ${String(9 + (memberIndex % 10)).padStart(2, '0')}:${String(
            (memberIndex * 13) % 60,
          ).padStart(2, '0')}`
        : null;

    return { customerId: customer.id, response, channel, respondedAt };
  });
}

export const CAMPAIGN_HISTORY: CampaignHistoryEntry[] = [
  ...MONTHLY_CAMPAIGN_LOG,
]
  .reverse()
  .map((entry, index) => {
    const channel = sendChannelKeyToContactChannel(entry.channel);
    const date = buildCampaignDate(entry.month, index);
    const responseRatio =
      entry.targetCount === 0 ? 0 : entry.respondedCount / entry.targetCount;

    return {
      id: `${entry.month}-${index}`,
      date,
      segmentLabel: entry.name,
      sourceLabel: CAMPAIGN_TYPE_LABEL[entry.type],
      channel,
      message:
        CAMPAIGN_MESSAGE_OVERRIDE[entry.name] ??
        GENERIC_MESSAGE_BY_CHANNEL[channel],
      targetCount: entry.targetCount,
      respondedCount: entry.respondedCount,
      members: buildCampaignMembers(index, channel, responseRatio, date),
    };
  });
