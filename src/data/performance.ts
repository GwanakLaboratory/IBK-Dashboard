import { CAMPAIGNS, type Campaign, type CampaignSource } from '@/data/campaign';
import { SEND_CHANNELS, type SendChannelKey } from '@/data/marketing';

// 관리 및 성과 목데이터

// 타겟군(발송) · 대조군(미발송) 월별 이탈률 (%)
const MONTH_LABELS = [
  '10월',
  '11월',
  '12월',
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
];
const TARGET = [2.1, 2.3, 2.6, 2.8, 3.1, 3.4, 3.2, 2.9, 2.6, 2.4, 2.2, 2.1];
const CONTROL = [2.1, 2.3, 2.6, 2.8, 3.1, 3.4, 3.4, 3.3, 3.3, 3.2, 3.2, 3.2];

export const CHURN_COMPARISON = MONTH_LABELS.map((label, index) => ({
  label,
  target: TARGET[index],
  control: CONTROL[index],
}));

export const CAMPAIGN_START_MONTH = '3월';

/** 그래프 월별 마커·툴팁에 쓰는 캠페인 발송 로그 */
export type CampaignLogEntry = {
  source: CampaignSource;
  name: string;
  /** 차트 x 라벨 (예: '3월') */
  month: string;
  channel: SendChannelKey;
  /** 반응률 % */
  responseRate: number;
};

// 3~8월은 예전 성과 리포트의 발송 로그, 9월은 접촉 이력 캠페인
const PAST_CAMPAIGN_LOG: CampaignLogEntry[] = [
  {
    source: 'ai',
    name: '고가치 회원 이용 급감',
    month: '3월',
    channel: 'tm',
    responseRate: 42.0,
  },
  {
    source: 'rand',
    name: '무작위 추출 A · 위험 그룹',
    month: '3월',
    channel: 'kakao',
    responseRate: 18.0,
  },
  {
    source: 'ai',
    name: '연회비 청구 D-30 · 혜택 미사용',
    month: '4월',
    channel: 'kakao',
    responseRate: 38.5,
  },
  {
    source: 'cond',
    name: '위험 · 30대 여성 · 카페/외식',
    month: '4월',
    channel: 'sms',
    responseRate: 27.1,
  },
  {
    source: 'cond',
    name: '중위험 · 50대 · 주유',
    month: '4월',
    channel: 'kakao',
    responseRate: 26.0,
  },
  {
    source: 'rand',
    name: '무작위 추출 B · 위험·중위험',
    month: '4월',
    channel: 'sms',
    responseRate: 15.0,
  },
  {
    source: 'ai',
    name: '타사 카드 전환 추정 · 카페/외식',
    month: '5월',
    channel: 'kakao',
    responseRate: 33.0,
  },
  {
    source: 'cond',
    name: '위험 · 20대 · 배달',
    month: '5월',
    channel: 'kakao',
    responseRate: 23.1,
  },
  {
    source: 'ai',
    name: '휴면 전환 직전',
    month: '6월',
    channel: 'sms',
    responseRate: 24.7,
  },
  {
    source: 'cond',
    name: '위험 · 40대 남성 · 쇼핑',
    month: '6월',
    channel: 'sms',
    responseRate: 22.1,
  },
  {
    source: 'cond',
    name: '연회비 청구 30일 이내 · 60대',
    month: '7월',
    channel: 'tm',
    responseRate: 32.9,
  },
  {
    source: 'ai',
    name: '고가치 회원 이용 급감 (2차)',
    month: '8월',
    channel: 'tm',
    responseRate: 45.0,
  },
];

export const CAMPAIGN_LOG: CampaignLogEntry[] = [
  ...PAST_CAMPAIGN_LOG,
  ...CAMPAIGNS.filter(
    (campaign) =>
      campaign.responseRate != null && campaign.date.startsWith('09.'),
  ).map((campaign) => ({
    source: campaign.source,
    name: campaign.name,
    month: '9월',
    channel: campaign.channel,
    responseRate: campaign.responseRate ?? 0,
  })),
];

/** 월별 캠페인 수 (그래프 마커) */
export const CAMPAIGN_MARKERS = [
  ...new Set(CAMPAIGN_LOG.map((entry) => entry.month)),
].map((month) => ({
  x: month,
  count: CAMPAIGN_LOG.filter((entry) => entry.month === month).length,
}));

const lastTarget = TARGET[TARGET.length - 1];
const lastControl = CONTROL[CONTROL.length - 1];
export const CHURN_GAP = (lastControl - lastTarget).toFixed(1);

/**
 * 기대 효과 계산 가정값. 대시보드 더미 값은 모두 이 공식에 맞춘다.
 * 전체 회원 = 분석 대상 고객, 마케팅 대상 = 이탈 위험 고객 = 9월 캠페인 발송 인원,
 * 유지 고객 = 9월 캠페인 이용 재개 인원 (performance.test.ts에서 확인)
 */
export const EFFECT_ASSUMPTIONS = {
  /** 전체 회원 수 (명) */
  totalMembers: 1_300_000,
  /** 이탈 예정 비율 */
  churnRate: 0.2,
  /** 모델 Recall — 실제 이탈 예정 고객 중 모델이 찾아내는 비율 */
  recall: 0.8,
  /** 모델 Precision — 모델이 고른 고객 중 실제 이탈 예정 고객 비율 */
  precision: 0.7,
  /** 유지 고객 1명의 월 이용액 (원) */
  monthlyUsagePerMember: 800_000,
};

/** 모델이 찾은 이탈 예정 고객 중 마케팅으로 유지하는 비율 n (%) */
export const RETENTION_RATE = 30;

export type ExpectedEffect = {
  /** 이탈 예정 = 전체 회원 × 이탈 비율 */
  churners: number;
  /** 모델 발견 = 이탈 예정 × Recall */
  detected: number;
  /** 마케팅 대상 = 모델 발견 ÷ Precision */
  targets: number;
  /** 유지 고객 = 모델 발견 × n% */
  retained: number;
  /** ① 이용액 효과 (원, 월) = 유지 고객 × 1인 월 이용액 */
  usageEffect: number;
  /** ② 비용 절감 (원) = 유지 고객 × m만 원 */
  costSaving: number;
};

/**
 * @param retentionRate n — 모델이 찾은 이탈 예정 고객 중 마케팅으로 유지하는 비율 (%)
 * @param savingPerMember m — 유지 고객 1명당 비용 절감액 (만 원)
 */
export function calcExpectedEffect(
  retentionRate: number,
  savingPerMember: number,
): ExpectedEffect {
  const { totalMembers, churnRate, recall, precision, monthlyUsagePerMember } =
    EFFECT_ASSUMPTIONS;
  const churners = totalMembers * churnRate;
  const detected = churners * recall;
  const targets = detected / precision;
  const retained = detected * (retentionRate / 100);
  return {
    churners,
    detected,
    targets,
    retained,
    usageEffect: retained * monthlyUsagePerMember,
    costSaving: retained * savingPerMember * 10_000,
  };
}

const EOK = 100_000_000;
/** 방어 이용금액을 셀 기간 (개월) */
const DEFENDED_MONTHS = 12;

/** 방어 이용금액 (억 원) — 이용 재개 고객의 향후 12개월 예상 이용금액 */
function getDefendedAmount(returned: number) {
  return (
    (returned * EFFECT_ASSUMPTIONS.monthlyUsagePerMember * DEFENDED_MONTHS) /
    EOK
  );
}

export type PerformanceCampaign = Campaign & {
  responseRate: number;
  returned: number;
  /** 방어 이용금액 (억 원) */
  amount: number;
};

/** 발송된 캠페인 (이용 재개 많은 순) — 접촉 이력과 같은 캠페인 데이터 */
export const PERFORMANCE_CAMPAIGNS: PerformanceCampaign[] = CAMPAIGNS.filter(
  (
    campaign,
  ): campaign is Campaign & { responseRate: number; returned: number } =>
    campaign.responseRate != null && campaign.returned != null,
)
  .map((campaign) => ({
    ...campaign,
    amount: getDefendedAmount(campaign.returned),
  }))
  .sort((a, b) => b.returned - a.returned);

const totalReturned = PERFORMANCE_CAMPAIGNS.reduce(
  (sum, campaign) => sum + campaign.returned,
  0,
);
const totalAmount = PERFORMANCE_CAMPAIGNS.reduce(
  (sum, campaign) => sum + campaign.amount,
  0,
);
/** 마케팅 대상 1인당 집행 비용 (원) — 혜택·발송 비용 포함 가정 */
const SPEND_PER_TARGET = 50_000;
const sentCount = PERFORMANCE_CAMPAIGNS.reduce(
  (sum, campaign) => sum + campaign.count,
  0,
);
/** 9월 집행 비용 (억 원) */
const SPEND = Math.round(((sentCount * SPEND_PER_TARGET) / EOK) * 10) / 10;

export const PERFORMANCE_KPIS = {
  returned: totalReturned,
  churnGap: Number(CHURN_GAP),
  lastTarget,
  lastControl,
  amount: totalAmount,
  spend: SPEND,
  roi: totalAmount / SPEND,
};

/** 채널별 반응률 (%) — 발송 인원으로 가중한 평균, 높은 순 */
export const CHANNEL_RESPONSE = SEND_CHANNELS.map((channel) => {
  const campaigns = PERFORMANCE_CAMPAIGNS.filter(
    (campaign) => campaign.channel === channel.key,
  );
  const count = campaigns.reduce((sum, campaign) => sum + campaign.count, 0);
  const rate = count
    ? campaigns.reduce(
        (sum, campaign) => sum + campaign.count * campaign.responseRate,
        0,
      ) / count
    : 0;
  return { label: channel.shortLabel, rate };
})
  .filter((item) => item.rate > 0)
  .sort((a, b) => b.rate - a.rate);
