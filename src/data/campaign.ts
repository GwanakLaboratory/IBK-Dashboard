/* 접촉 이력 목데이터 (디자인 시안 값 기준). 목록과 상세 모달이 같은 캠페인을 쓴다. */
import type { SendChannelKey } from '@/data/marketing';
import i18n from '@/i18n';
import type ko from '@/i18n/locales/ko.json';

export type CampaignStatus = 'run' | 'done' | 'plan';

/** 대상을 고른 방식 */
export type CampaignSource = 'ai' | 'cond' | 'rand';

/** 캠페인 id. 이름 · 발송 문구 · 세그먼트는 marketingHistory.campaigns.<id>.* */
export type CampaignId = keyof (typeof ko)['marketingHistory']['campaigns'];

export type Campaign = {
  id: CampaignId;
  source: CampaignSource;
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
    source: 'ai',
    channel: 'push',
    date: '09.24',
    count: 71656,
    responseRate: 24.1,
    returned: 19731,
    status: 'run',
  },
  {
    id: 'cp-0917',
    source: 'cond',
    channel: 'kakao',
    date: '09.17',
    count: 77533,
    responseRate: 19.6,
    returned: 16945,
    status: 'done',
  },
  {
    id: 'cp-0910',
    source: 'ai',
    channel: 'kakao',
    date: '09.10',
    count: 46314,
    responseRate: 17.2,
    returned: 9914,
    status: 'done',
  },
  {
    id: 'cp-0905',
    source: 'cond',
    channel: 'sms',
    date: '09.05',
    count: 52898,
    responseRate: 11.8,
    returned: 6512,
    status: 'done',
  },
  {
    id: 'cp-0920',
    source: 'ai',
    channel: 'tm',
    date: '09.20',
    count: 11432,
    responseRate: 42.9,
    returned: 6253,
    status: 'run',
  },
  {
    id: 'cp-0902',
    source: 'rand',
    channel: 'push',
    date: '09.02',
    count: 37310,
    responseRate: 6.9,
    returned: 3045,
    status: 'done',
  },
  {
    id: 'cp-1002',
    source: 'cond',
    channel: 'push',
    date: '10.02',
    count: 26577,
    responseRate: null,
    returned: null,
    status: 'plan',
  },
];

/** 캠페인 이름 (현재 언어) */
export const campaignName = (id: CampaignId) =>
  i18n.t(`marketingHistory.campaigns.${id}.name`);

/** 보낸 문구 (현재 언어). {이름}(영어는 {name})은 회원별로 바뀐다 */
export const campaignMessage = (id: CampaignId) =>
  i18n.t(`marketingHistory.campaigns.${id}.message`);

/** 대상 세그먼트 설명 (현재 언어) */
export const campaignSegment = (id: CampaignId) =>
  i18n.t(`marketingHistory.campaigns.${id}.segment`);

/** 상태 칩 색. 이름은 marketingHistory.status.<status> */
export const CAMPAIGN_STATUS_META: Record<
  CampaignStatus,
  { className: string }
> = {
  run: { className: 'bg-blue-50 text-blue-700' },
  done: { className: 'bg-slate-100 text-slate-600' },
  plan: { className: 'bg-amber-100 text-amber-700' },
};

/** 선택 방식 칩 색. 이름은 marketingHistory.source.<source>.label / filter */
export const CAMPAIGN_SOURCE_META: Record<
  CampaignSource,
  { className: string }
> = {
  ai: { className: 'bg-violet-50 text-violet-700' },
  cond: { className: 'bg-blue-50 text-blue-700' },
  rand: { className: 'bg-teal-50 text-teal-700' },
};

/** 상세 모달의 "보낸 문구" 발신 표시 색. 문구는 marketingHistory.detail.sender.<channel> */
export const CAMPAIGN_SENDER_CLASS_NAME: Record<SendChannelKey, string> = {
  kakao: 'text-yellow-800',
  sms: 'text-sky-700',
  push: 'text-blue-700',
  tm: 'text-orange-700',
};
