/* 접촉 이력 목데이터 (디자인 시안 값 기준). 목록과 상세 모달이 같은 캠페인을 쓴다. */
import type { SendChannelKey } from '@/data/marketing';

export type CampaignStatus = 'run' | 'done' | 'plan';

/** 대상을 고른 방식 */
export type CampaignSource = 'ai' | 'cond' | 'rand';

export type Campaign = {
  id: string;
  name: string;
  /** 발송 문구 ({이름}은 회원별로 바뀜) */
  message: string;
  source: CampaignSource;
  segment: string;
  channel: SendChannelKey;
  /** 발송일 (MM.DD) */
  date: string;
  count: number;
  /** 반응률 % (발송 전이면 null) */
  responseRate: number | null;
  /** 이용 재개 인원 (발송 전이면 null) */
  returned: number | null;
  status: CampaignStatus;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'cp-0924',
    name: '9월 카페·배달 10% 청구할인 안내',
    message:
      '{이름}님, 자주 가시는 카페·배달 결제 시 10% 청구할인을 드려요. 9월 30일까지 최대 1만 원!',
    source: 'ai',
    segment: '이용금액 급감 · 카페/배달 주 이용',
    channel: 'push',
    date: '09.24',
    count: 8412,
    responseRate: 24.1,
    returned: 1218,
    status: 'run',
  },
  {
    id: 'cp-0917',
    name: '신규 발급 무실적 첫 결제 혜택',
    message:
      '{이름}님, IBK카드 첫 결제하고 5천 원 캐시백 받아 가세요. 9월 30일까지 1회 이상 결제하면 자동 적립돼요.',
    source: 'cond',
    segment: '신규 발급 후 3개월 무실적',
    channel: 'kakao',
    date: '09.17',
    count: 9102,
    responseRate: 19.6,
    returned: 1046,
    status: 'done',
  },
  {
    id: 'cp-0910',
    name: '연회비 청구 전 혜택 리마인드',
    message:
      '연회비 청구 전 꼭 챙기세요! {이름}님이 아직 안 쓰신 주유·마트 혜택으로 이번 달 최대 3만 원을 돌려받을 수 있어요.',
    source: 'ai',
    segment: '연회비 청구 임박 · 혜택 미사용',
    channel: 'kakao',
    date: '09.10',
    count: 5437,
    responseRate: 17.2,
    returned: 612,
    status: 'done',
  },
  {
    id: 'cp-0905',
    name: '주유 혜택 다시 안내',
    message:
      '[IBK카드] {이름}님, 이번 달 주유 리터당 100원 할인 혜택이 다시 열렸어요. 9월 30일까지 이용해 보세요.',
    source: 'cond',
    segment: '주유 업종 이용 감소',
    channel: 'sms',
    date: '09.05',
    count: 6210,
    responseRate: 11.8,
    returned: 402,
    status: 'done',
  },
  {
    id: 'cp-0920',
    name: '고가치 회원 이용 급감 상담',
    message:
      '안녕하세요, IBK카드입니다. 최근 카드 이용이 줄어 혹시 불편하신 점이 있으셨는지 여쭤보려고 연락드렸어요. 회원님께 맞는 혜택을 안내해 드려도 될까요?',
    source: 'ai',
    segment: '연 이용 1천만 원↑ · 이용금액 급감',
    channel: 'tm',
    date: '09.20',
    count: 1342,
    responseRate: 42.9,
    returned: 386,
    status: 'run',
  },
  {
    id: 'cp-0902',
    name: '해외 이용 재개 캐시백',
    message:
      '{이름}님, 해외 결제 3% 캐시백이 돌아왔어요. 10월 31일까지 해외 가맹점에서 결제해 보세요.',
    source: 'rand',
    segment: '해외 이용 중단',
    channel: 'push',
    date: '09.02',
    count: 4380,
    responseRate: 6.9,
    returned: 188,
    status: 'done',
  },
  {
    id: 'cp-1002',
    name: '10월 리볼빙 해지 고객 케어',
    message:
      '{이름}님, 이번 달 IBK카드로 30만 원 이상 쓰시면 1만 원을 돌려드려요. 지금 확인해 보세요.',
    source: 'cond',
    segment: '리볼빙 해지 후 이용 감소',
    channel: 'push',
    date: '10.02',
    count: 3120,
    responseRate: null,
    returned: null,
    status: 'plan',
  },
];

export const CAMPAIGN_STATUS_META: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  run: { label: '진행 중', className: 'bg-blue-50 text-blue-700' },
  done: { label: '완료', className: 'bg-slate-100 text-slate-600' },
  plan: { label: '예약', className: 'bg-amber-100 text-amber-700' },
};

export const CAMPAIGN_SOURCE_META: Record<
  CampaignSource,
  { label: string; filterLabel: string; className: string }
> = {
  ai: {
    label: 'AI 추천',
    filterLabel: 'AI 추천 세그먼트',
    className: 'bg-violet-50 text-violet-700',
  },
  cond: {
    label: '조건 선택',
    filterLabel: '조건 직접 선택',
    className: 'bg-blue-50 text-blue-700',
  },
  rand: {
    label: '무작위',
    filterLabel: '무작위 추출',
    className: 'bg-teal-50 text-teal-700',
  },
};

/** 상세 모달의 "보낸 문구" 발신 표시 */
export const CAMPAIGN_SENDER: Record<
  SendChannelKey,
  { label: string; className: string }
> = {
  kakao: { label: 'IBK카드 알림톡', className: 'text-yellow-800' },
  sms: { label: '문자 · 1588-2588', className: 'text-sky-700' },
  push: { label: 'i-ONE 앱 푸시', className: 'text-blue-700' },
  tm: { label: '상담원 안내 멘트', className: 'text-orange-700' },
};

/** 캠페인 집계 기간 */
export const CAMPAIGN_PERIOD_LABEL = '9월 1일 ~ 10월 2일';

export const RESPONSE_RATE_TIP =
  '메시지를 받은 고객 중 7일 안에 카드를 쓴 고객의 비율이에요.';
export const RETURNED_TIP =
  '발송 후 30일 안에 카드를 2번 이상 다시 쓴 고객 수예요.';
