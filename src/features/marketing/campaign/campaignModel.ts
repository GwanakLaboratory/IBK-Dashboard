import {
  EMPTY_CONDITION_PICK,
  ALL_MEMBER_COUNT,
  CHANNEL_MESSAGES,
  CONDITION_GROUPS,
  DEFAULT_SEND_DATE,
  findSendChannel,
  RANDOM_POOLS,
  RISK_OPTION_COUNT,
  RISK_OPTION_LEVEL,
  SEGMENT_MESSAGES,
  SEND_SEGMENTS,
  type ConditionPick,
  type MessageTemplate,
  type RandomPool,
  type SendChannel,
  type SendChannelKey,
  type SendSegment,
} from '@/data/marketing';
import { TARGET_MEMBERS } from '@/data/target';
import { getRiskLevelFromScore } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

export type TargetMode = 'ai' | 'cond' | 'rand';

export type RewriteKey = 'short' | 'friendly' | 'benefit';
/** custom: 직접 입력한 요청으로 다듬기 */
export type AiTask = 'generate' | 'custom' | RewriteKey;

/** 대상 하나의 발송 문구 상태 */
export type MessageDraft = {
  variantIndex: number;
  /** 사용자가 고치거나 AI로 다듬은 문구. null 이면 고른 문구 그대로. */
  text: string | null;
  /** 펼침 여부. 생략하면 첫 문구 카드만 펼친다. */
  open?: boolean;
  date?: string;
  time?: string;
  /** AI 생성 중인 작업. null 이면 대기. */
  aiTask: AiTask | null;
  /** 처음 펼칠 때 AI 생성을 이미 보여줬는지 */
  generated?: boolean;
};

export type SendDraft = {
  mode: TargetMode;
  /** AI 추천 세그먼트 중 고른 것 (복수 선택) */
  segmentIds: string[];
  conditions: ConditionPick;
  /** 조건 · 무작위 추출 대상의 채널 */
  /** 조건·무작위 대상의 발송 채널 (고르기 전엔 null) */
  channel: SendChannelKey | null;
  poolKey: RandomPool['key'] | null;
  size: number | null;
  /** 같은 수만큼 대조군을 함께 뽑을지 */
  control: boolean;
  /** 대상 key → 문구 상태 */
  messages: Record<string, MessageDraft>;
};

export const INITIAL_SEND_DRAFT: SendDraft = {
  mode: 'ai',
  segmentIds: [],
  // 조건 직접 선택·무작위 추출은 아무것도 고르지 않은 상태에서 시작한다
  conditions: EMPTY_CONDITION_PICK,
  channel: null,
  poolKey: null,
  size: null,
  control: false,
  messages: {},
};

export const EMPTY_MESSAGE_DRAFT: MessageDraft = {
  variantIndex: 0,
  text: null,
  aiTask: null,
};

/** AI 문구 생성 대기 연출 시간 (실제 LLM 연동 전 목업). 로딩 단계 표시가 이 시간에 맞춰 넘어간다. */
export const AI_GENERATING_MS = 2400;

export const formatCount = (n: number) => n.toLocaleString('ko-KR');

export function getSegmentLabel(segment: SendSegment) {
  return `${segment.benefit} · ${findSendChannel(segment.channel).shortLabel}`;
}

export function getSelectedSegments(draft: SendDraft) {
  return SEND_SEGMENTS.filter((segment) =>
    draft.segmentIds.includes(segment.id),
  );
}

export function getRandomPool(draft: SendDraft) {
  return RANDOM_POOLS.find((pool) => pool.key === draft.poolKey);
}

/** 위험도로 모수를 정하고, 조건을 고를 때마다 고른 비율만큼 좁힌다 (교집합 보정 1.08) */
export function getConditionCount(pick: ConditionPick) {
  const count = CONDITION_GROUPS.reduce((acc, group) => {
    const picked = pick[group.key];
    if (group.key === 'risk') {
      return picked.length
        ? picked.reduce((sum, option) => sum + RISK_OPTION_COUNT[option], 0)
        : ALL_MEMBER_COUNT;
    }
    return picked.length
      ? acc * (picked.length / group.options.length) * 1.08
      : acc;
  }, 0);
  return Math.round(count);
}

export function getPickedConditionGroups(pick: ConditionPick) {
  return CONDITION_GROUPS.filter((group) => pick[group.key].length);
}

export type SummaryItem = { key: string; value: string };

export type TargetSummary = {
  total: number;
  items: SummaryItem[];
  chip: string;
  empty: boolean;
  note: string;
};

export function buildTargetSummary(draft: SendDraft): TargetSummary {
  const channelLabel = draft.channel
    ? findSendChannel(draft.channel).shortLabel
    : '선택 전';
  let total: number;
  let items: SummaryItem[];
  let chip: string;
  const segments = getSelectedSegments(draft);
  if (draft.mode === 'ai') {
    const raw = segments.reduce((sum, segment) => sum + segment.count, 0);
    // 세그먼트끼리 겹치는 고객은 한 번만 센다
    total = segments.length > 1 ? Math.round(raw * 0.96) : raw;
    items = segments.map((segment) => ({
      key: findSendChannel(segment.channel).shortLabel,
      value: segment.name,
    }));
    chip = `${segments.length}개 세그먼트 선택`;
  } else if (draft.mode === 'cond') {
    const groups = getPickedConditionGroups(draft.conditions);
    total = getConditionCount(draft.conditions);
    items = [
      ...groups.map((group) => ({
        key: group.label,
        value: draft.conditions[group.key].join(' · '),
      })),
      { key: '발송 채널', value: channelLabel },
    ];
    chip = `조건 ${groups.length}개 적용`;
    // 조건과 채널을 모두 골라야 대상이 정해진다
    if (!groups.length || !draft.channel) total = 0;
  } else {
    const pool = getRandomPool(draft);
    const size = draft.size ?? 0;
    // 모집단·인원·채널을 모두 골라야 대상이 정해진다
    total = pool && draft.channel ? size : 0;
    items = [
      { key: '발송 채널', value: channelLabel },
      { key: '모집단', value: pool?.label ?? '선택 전' },
      { key: '추출', value: size ? `${formatCount(size)}명` : '선택 전' },
      {
        key: '대조군',
        value:
          draft.control && size ? `${formatCount(size)}명 (미발송)` : '없음',
      },
    ];
    chip = '무작위 추출';
  }
  const empty = total === 0 || items.length === 0;
  const note = empty
    ? '대상을 고르면 인원이 계산돼요'
    : draft.mode === 'ai' && segments.length > 1
      ? '세그먼트끼리 겹치는 고객은 한 번만 셌어요'
      : '선택한 고객을 대상으로 원하는 기능을 실행하세요';
  return { total, items, chip, empty, note };
}

/** 하나만 고르면 세그먼트 인사이트, 여러 개면 선택 조합 요약 */
export function buildAiInsight(segments: SendSegment[]) {
  if (segments.length < 2) {
    const base = segments[0] ?? SEND_SEGMENTS[0];
    return { text: base.insight, highlight: base.recommendation };
  }
  const best = [...segments].sort(
    (a, b) => b.expectedResponse - a.expectedResponse,
  )[0];
  const totalCount = segments.reduce((sum, segment) => sum + segment.count, 0);
  const average =
    segments.reduce(
      (sum, segment) => sum + segment.expectedResponse * segment.count,
      0,
    ) / totalCount;
  const channelCounts = new Map<string, number>();
  segments.forEach((segment) => {
    const label = findSendChannel(segment.channel).shortLabel;
    channelCounts.set(label, (channelCounts.get(label) ?? 0) + 1);
  });
  const channels = [...channelCounts]
    .map(([label, count]) => `${label} ${count}개`)
    .join(', ');
  return {
    text: `선택한 ${segments.length}개 중 ${best.name}의 예상 반응(${best.expectedResponse}%)이 가장 높아요. 채널별로는 ${channels}예요.`,
    highlight: `전체 예상 반응 ${average.toFixed(1)}% (인원 가중 평균)`,
  };
}

/** 발송 문구 카드 하나 (텔레마케팅이면 template 없음) */
export type MessageTarget = {
  key: string;
  name: string;
  channel: SendChannel;
  template: MessageTemplate | undefined;
  count: number;
};

export function getMessageTargets(draft: SendDraft): MessageTarget[] {
  if (draft.mode === 'ai') {
    return getSelectedSegments(draft).map((segment) => ({
      key: segment.id,
      name: segment.name,
      channel: findSendChannel(segment.channel),
      template: SEGMENT_MESSAGES[segment.id],
      count: segment.count,
    }));
  }
  const summary = buildTargetSummary(draft);
  if (summary.empty || !draft.channel) return [];
  return [
    {
      key: draft.mode,
      name: draft.mode === 'cond' ? '조건 직접 선택 대상' : '무작위 추출 대상',
      channel: findSendChannel(draft.channel),
      template: CHANNEL_MESSAGES[draft.channel],
      count: summary.total,
    },
  ];
}

export type MessageView = {
  open: boolean;
  variantIndex: number;
  text: string;
  date: string;
  time: string;
  aiTask: AiTask | null;
  generated: boolean;
};

export function buildMessageView(
  target: MessageTarget & { template: MessageTemplate },
  draft: MessageDraft | undefined,
  isFirst: boolean,
): MessageView {
  const state = draft ?? EMPTY_MESSAGE_DRAFT;
  const variantIndex = target.template.variants[state.variantIndex]
    ? state.variantIndex
    : 0;
  return {
    open: state.open ?? isFirst,
    variantIndex,
    text: state.text ?? target.template.variants[variantIndex].text,
    date: state.date ?? DEFAULT_SEND_DATE,
    time: state.time ?? target.template.recommendedTime,
    aiTask: state.aiTask,
    generated: state.generated ?? false,
  };
}

export function hasTemplate(
  target: MessageTarget,
): target is MessageTarget & { template: MessageTemplate } {
  return target.template !== undefined;
}

export const REWRITE_OPTIONS: { key: RewriteKey; label: string }[] = [
  { key: 'short', label: '더 짧게' },
  { key: 'friendly', label: '더 친근하게' },
  { key: 'benefit', label: '혜택 강조' },
];

const FRIENDLY_PREFIX = '반가워요! ';
const BENEFIT_PREFIX = '[혜택] ';

/** AI 다듬기 목업. 같은 입력이면 항상 같은 결과를 낸다. */
/** 요청 문장에서 다듬을 방향을 찾는다 (실제 AI 연동 전 키워드 매칭) */
const REWRITE_KEYWORDS: Record<RewriteKey, string[]> = {
  short: ['짧', '간단', '줄여', '요약'],
  friendly: ['친근', '부드럽', '다정', '편하게'],
  benefit: ['혜택', '할인', '적립', '강조'],
};

export function parseRewriteRequest(request: string): RewriteKey[] {
  const keys = (Object.keys(REWRITE_KEYWORDS) as RewriteKey[]).filter((key) =>
    REWRITE_KEYWORDS[key].some((keyword) => request.includes(keyword)),
  );
  // 알아들은 방향이 없으면 말투만 부드럽게 다듬는다
  return keys.length ? keys : ['friendly'];
}

/** 요청대로 다듬은 문구와 로딩에 보여줄 작업 */
export function rewriteByRequest(message: string, request: string) {
  const keys = parseRewriteRequest(request);
  return {
    task: (keys.length === 1 ? keys[0] : 'custom') as AiTask,
    text: keys.reduce((text, key) => rewriteMessage(text, key), message),
  };
}

export function rewriteMessage(message: string, key: RewriteKey) {
  if (key === 'short') {
    const end = message.search(/[.!?]\s/);
    return end > 0 ? message.slice(0, end + 1) : message;
  }
  const prefix = key === 'friendly' ? FRIENDLY_PREFIX : BENEFIT_PREFIX;
  return message.startsWith(prefix.trim()) ? message : prefix + message;
}

/** 'HH:mm' → '오전 10:00' */
export function formatTimeLabel(time: string) {
  const hour = parseInt(time, 10);
  return `${hour < 12 ? '오전' : '오후'} ${((hour + 11) % 12) + 1}:${time.slice(3)}`;
}

/** '2026-10-08' → '10월 8일 (목)' */
export function formatDateLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${'일월화수목금토'[date.getDay()]})`;
}

export function formatSchedule(view: Pick<MessageView, 'date' | 'time'>) {
  return `${formatDateLabel(view.date)} ${formatTimeLabel(view.time)}`;
}

/** 엑셀로 내려받을 회원 (목데이터 회원 중 선택한 위험도에 해당하는 회원) */
export function getExtractMembers(draft: SendDraft) {
  let levels: RiskLevel[] = ['high'];
  if (draft.mode === 'cond' && draft.conditions.risk.length) {
    levels = draft.conditions.risk.map((option) => RISK_OPTION_LEVEL[option]);
  } else if (draft.mode === 'cond') {
    levels = ['high', 'medium', 'low'];
  } else if (draft.mode === 'rand') {
    levels = getRandomPool(draft)?.levels ?? [];
  }
  const members = TARGET_MEMBERS.filter((member) =>
    levels.includes(getRiskLevelFromScore(member.score)),
  );
  return draft.mode === 'rand' ? members.slice(0, draft.size ?? 0) : members;
}
