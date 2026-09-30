import {
  monthlyMemberActivity,
  monthlyRiskDistribution,
} from '@/data/customers';
import {
  AI_SEGMENT_PRESETS,
  buildMessageThemes,
  RISK_SEGMENT_VALUE,
  SEGMENT_GROUPS_WITHOUT_RISK,
  SEND_CHANNELS,
  type AiSegmentPreset,
  type MessageTheme,
  type MessageThemeKey,
  type SegmentGroup,
  type SegmentPick,
  type SendChannel,
  type SendChannelKey,
} from '@/data/marketing';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

export type CampaignStep = 0 | 1 | 2 | 3 | 4;
export type TargetMode = 'filter' | 'random';
export type SendTiming = 'now' | 'schedule';

export type LinkedTarget = {
  customerIds: string[];
  label: string;
  /** 넘겨준 화면에서 정한 캠페인 업종 (업종 캐시백 문구에 쓴다) */
  category?: string;
};

export type CampaignDraft = {
  step: CampaignStep;
  targetMode: TargetMode;
  segmentPick: SegmentPick;
  /** 무작위 추출 대상 그룹 */
  extractRiskLevels: RiskLevel[];
  extractSize: number;
  /** 무작위 추출을 적용한 인원. null 이면 조건 세그먼트 인원을 쓴다. */
  extractedCount: number | null;
  /** 다른 화면(회원 상세·위험군 우선순위)에서 넘겨받은 대상. 있으면 세그먼트 대신 쓴다. */
  linkedTarget: LinkedTarget | null;
  theme: MessageThemeKey | null;
  variantIndex: number;
  /** 사용자가 직접 고친 문구. null 이면 선택한 변형 문구 그대로. */
  editedMessage: string | null;
  channel: SendChannelKey | null;
  timing: SendTiming;
  isAiLoading: boolean;
  isSent: boolean;
};

export const PREVIEW_NAME = '김*현';

/** AI 문구 생성 대기 연출 시간 (실제 LLM 연동 전 목업). 로딩 단계 표시가 이 시간에 맞춰 넘어간다. */
export const AI_GENERATING_MS = 2400;

const latestActivity = monthlyMemberActivity[monthlyMemberActivity.length - 1];
const latestRiskDistribution =
  monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
const RISK_SHARE: Record<RiskLevel, number> = {
  high: latestRiskDistribution.high / 100,
  medium: latestRiskDistribution.mid / 100,
  low: latestRiskDistribution.low / 100,
};

export const TOTAL_MEMBER_COUNT = latestActivity.activeMembers;

export const RISK_MEMBER_COUNTS: Record<RiskLevel, number> = {
  high: Math.round(TOTAL_MEMBER_COUNT * RISK_SHARE.high),
  medium: Math.round(TOTAL_MEMBER_COUNT * RISK_SHARE.medium),
  low: Math.round(TOTAL_MEMBER_COUNT * RISK_SHARE.low),
};

export const SEGMENT_GROUPS: SegmentGroup[] = [
  {
    key: 'risk',
    label: '위험도',
    options: RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => ({
      value: RISK_SEGMENT_VALUE[riskLevel],
      label: RISK_LEVEL_META[riskLevel].label,
      share: RISK_SHARE[riskLevel],
    })),
  },
  ...SEGMENT_GROUPS_WITHOUT_RISK,
];

const segmentGroupByKey = Object.fromEntries(
  SEGMENT_GROUPS.map((group) => [group.key, group]),
) as Record<SegmentGroup['key'], SegmentGroup>;

export function getPickedOptions(pick: SegmentPick, group: SegmentGroup) {
  const values = pick[group.key] ?? [];
  return group.options.filter((option) => values.includes(option.value));
}

export type FunnelRow = {
  label: string;
  count: number;
  /** 이전 단계 대비 비율 (0~1). 첫 행은 1. */
  ratio: number;
};

/** 조건 그룹을 순서대로 적용하며 모수를 좁힌다. 선택이 없는 그룹은 건너뛴다. */
export function buildFunnel(pick: SegmentPick): FunnelRow[] {
  const rows: FunnelRow[] = [
    { label: '전체 개인 회원', count: TOTAL_MEMBER_COUNT, ratio: 1 },
  ];
  let running = TOTAL_MEMBER_COUNT;

  SEGMENT_GROUPS.forEach((group) => {
    const picked = getPickedOptions(pick, group);
    if (!picked.length) {
      return;
    }
    const share = picked.reduce((sum, option) => sum + option.share, 0);
    const previous = running;
    running = Math.round(running * share);
    rows.push({
      label: `${group.label} · ${picked.map((option) => option.label).join(', ')}`,
      count: running,
      ratio: previous ? running / previous : 0,
    });
  });

  return rows;
}

export function getSegmentCount(pick: SegmentPick) {
  const funnel = buildFunnel(pick);
  return funnel[funnel.length - 1].count;
}

export function getPersonaLabel(pick: SegmentPick) {
  const ageLabels = getPickedOptions(pick, segmentGroupByKey.age).map(
    (option) => option.label,
  );
  const genderLabels = getPickedOptions(pick, segmentGroupByKey.gender).map(
    (option) => option.label,
  );
  const genderLabel = genderLabels.length === 1 ? genderLabels[0] : '';
  return `${ageLabels.join('·')} ${genderLabel}`.trim() || '전체';
}

function getRecommendedTheme(pick: SegmentPick): MessageThemeKey {
  const reasons = pick.reason ?? [];
  const ages = pick.age ?? [];
  if ((pick.category ?? []).length) return 'cashback';
  if (reasons.includes('fee') || (pick.feeDue ?? []).length) return 'fee';
  if ((pick.idle ?? []).length) return 'benefit';
  if (ages.length && (reasons.includes('drop') || reasons.includes('benefit')))
    return 'persona';
  if (reasons.length) return 'benefit';
  if (ages.length) return 'persona';
  return 'thanks';
}

function getRecommendedChannel(
  pick: SegmentPick,
  segmentCount: number,
): SendChannelKey {
  const ages = pick.age ?? [];
  const prefersCall = ages.includes('50') || ages.includes('60');
  const isHighValue = (pick.value ?? []).includes('high');
  // 상담원 연결은 소규모 대상에서만 현실적이라 2만 명 이하일 때만 추천한다.
  if ((prefersCall || isHighValue) && segmentCount <= 20000) return 'tm';
  if ((pick.idle ?? []).length) return 'sms';
  return 'kakao';
}

export function isSamePick(pickA: SegmentPick, pickB: SegmentPick) {
  return SEGMENT_GROUPS.every((group) => {
    const valuesA = [...(pickA[group.key] ?? [])].sort().join();
    const valuesB = [...(pickB[group.key] ?? [])].sort().join();
    return valuesA === valuesB;
  });
}

export type CampaignView = {
  funnel: FunnelRow[];
  segmentCount: number;
  targetCount: number;
  segmentLabel: string;
  personaLabel: string;
  topReasonLabel: string;
  pickedCategoryLabel: string | undefined;
  /** 현재 조건이 AI 추천 세그먼트와 같으면 그 세그먼트 */
  matchedPreset: AiSegmentPreset | undefined;
  themes: MessageTheme[];
  theme: MessageTheme;
  recommendedTheme: MessageTheme;
  variantIndex: number;
  message: string;
  channel: SendChannel;
  recommendedChannel: SendChannel;
  /** 선택한 채널 × 문구의 예상 반응률 (%) */
  responseRate: number;
  responders: number;
  /** 추천 테마 × 추천 채널 조합 반응률 (%) */
  recommendedRate: number;
};

export function buildCampaignView(draft: CampaignDraft): CampaignView {
  const pick = draft.segmentPick;
  const funnel = buildFunnel(pick);
  const segmentCount = funnel[funnel.length - 1].count;
  const personaLabel = getPersonaLabel(pick);
  const categoryLabels = getPickedOptions(pick, segmentGroupByKey.category).map(
    (option) => option.label,
  );
  const themes = buildMessageThemes(
    draft.linkedTarget?.category ?? (categoryLabels.join('·') || '카페/외식'),
    personaLabel,
  );
  const recommendedTheme =
    themes.find((theme) => theme.key === getRecommendedTheme(pick)) ??
    themes[0];
  const theme =
    themes.find((item) => item.key === draft.theme) ?? recommendedTheme;
  const variantIndex = theme.variants[draft.variantIndex]
    ? draft.variantIndex
    : 0;
  const variant = theme.variants[variantIndex];

  const recommendedChannelKey = getRecommendedChannel(pick, segmentCount);
  const recommendedChannel =
    SEND_CHANNELS.find((channel) => channel.key === recommendedChannelKey) ??
    SEND_CHANNELS[1];
  const channel =
    SEND_CHANNELS.find((item) => item.key === draft.channel) ??
    recommendedChannel;

  const isRandom = draft.targetMode === 'random';
  const targetCount = draft.linkedTarget
    ? draft.linkedTarget.customerIds.length
    : isRandom && draft.extractedCount !== null
      ? draft.extractedCount
      : segmentCount;
  const extractLabel = RISK_LEVEL_DISPLAY_ORDER.filter((riskLevel) =>
    draft.extractRiskLevels.includes(riskLevel),
  )
    .map((riskLevel) => RISK_LEVEL_META[riskLevel].label)
    .join('·');
  const segmentLabel = draft.linkedTarget
    ? draft.linkedTarget.label
    : isRandom
      ? `무작위 추출 · ${extractLabel || '그룹 미선택'}`
      : funnel
          .slice(1)
          .map((row) => row.label.split(' · ')[1])
          .join(' / ') || '전체 개인 회원';

  const responseRate = channel.baseRate + variant.rateDelta;

  return {
    funnel,
    segmentCount,
    targetCount,
    segmentLabel,
    personaLabel,
    topReasonLabel:
      getPickedOptions(pick, segmentGroupByKey.reason)[0]?.label ??
      '이용금액 급감',
    matchedPreset: draft.linkedTarget
      ? undefined
      : AI_SEGMENT_PRESETS.find((preset) => isSamePick(preset.pick, pick)),
    pickedCategoryLabel: draft.linkedTarget?.category ?? categoryLabels[0],
    themes,
    theme,
    recommendedTheme,
    variantIndex,
    message: draft.editedMessage ?? variant.text,
    channel,
    recommendedChannel,
    responseRate,
    responders: Math.round((targetCount * responseRate) / 100),
    recommendedRate:
      recommendedChannel.baseRate + recommendedTheme.variants[0].rateDelta,
  };
}

export function fillPreviewName(message: string) {
  return message.split('{이름}').join(PREVIEW_NAME);
}

export function getExtractPool(riskLevels: RiskLevel[]) {
  return riskLevels.reduce(
    (sum, riskLevel) => sum + RISK_MEMBER_COUNTS[riskLevel],
    0,
  );
}
