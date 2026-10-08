import { describe, expect, it } from 'vitest';
import {
  ALL_MEMBER_COUNT,
  EMPTY_CONDITION_PICK,
  RANDOM_POOLS,
  RISK_OPTION_COUNT,
  SEND_SEGMENTS,
} from '@/data/marketing';
import {
  buildAiInsight,
  buildMessageView,
  buildTargetSummary,
  formatDateLabel,
  formatTimeLabel,
  getConditionCount,
  getExtractMembers,
  getMessageTargets,
  hasTemplate,
  INITIAL_SEND_DRAFT,
  rewriteMessage,
  type SendDraft,
  parseRewriteRequest,
  rewriteByRequest,
} from '@/features/marketing/campaign/campaignModel';
import { getRiskLevelFromScore } from '@/utils/risk';

// 위험 회원 모집단
const RANDOM_POOL_KEY = RANDOM_POOLS[0].key;

const draftOf = (patch: Partial<SendDraft>): SendDraft => ({
  ...INITIAL_SEND_DRAFT,
  ...patch,
});

describe('getConditionCount', () => {
  it('uses the whole member base when nothing is picked', () => {
    expect(getConditionCount(EMPTY_CONDITION_PICK)).toBe(ALL_MEMBER_COUNT);
  });

  it('starts from risk counts and narrows by each picked group', () => {
    expect(
      getConditionCount({ ...EMPTY_CONDITION_PICK, risk: ['위험', '중위험'] }),
    ).toBe(RISK_OPTION_COUNT['위험'] + RISK_OPTION_COUNT['중위험']);
    // 위험 회원 × (1/4 × 1.08) × (1/3 × 1.08)
    expect(
      getConditionCount({
        ...EMPTY_CONDITION_PICK,
        risk: ['위험'],
        reason: ['이용금액 급감'],
        spend: ['1천만 원 이상'],
      }),
    ).toBe(
      Math.round(RISK_OPTION_COUNT['위험'] * 0.25 * 1.08 * (1 / 3) * 1.08),
    );
  });
});

describe('buildTargetSummary', () => {
  it('sums one AI segment as is', () => {
    const summary = buildTargetSummary(draftOf({ segmentIds: ['s1'] }));
    expect(summary.total).toBe(SEND_SEGMENTS[0].count);
    expect(summary.chip).toBe('1개 세그먼트 선택');
    expect(summary.items).toEqual([
      { key: '텔레마케팅', value: SEND_SEGMENTS[0].name },
    ]);
  });

  it('removes overlap when several segments are picked', () => {
    const summary = buildTargetSummary(draftOf({ segmentIds: ['s1', 's2'] }));
    expect(summary.total).toBe(
      Math.round((SEND_SEGMENTS[0].count + SEND_SEGMENTS[1].count) * 0.96),
    );
    expect(summary.note).toBe('세그먼트끼리 겹치는 고객은 한 번만 셌어요');
  });

  it('is empty when no segment is picked', () => {
    const summary = buildTargetSummary(draftOf({ segmentIds: [] }));
    expect(summary.empty).toBe(true);
    expect(summary.total).toBe(0);
  });

  it('starts empty in direct modes until targets and channel are picked', () => {
    expect(buildTargetSummary(draftOf({ mode: 'cond' })).empty).toBe(true);
    expect(buildTargetSummary(draftOf({ mode: 'rand' })).empty).toBe(true);
    expect(getMessageTargets(draftOf({ mode: 'rand' }))).toEqual([]);
  });

  it('lists picked conditions plus the channel', () => {
    const summary = buildTargetSummary(
      draftOf({
        mode: 'cond',
        channel: 'kakao',
        conditions: {
          ...EMPTY_CONDITION_PICK,
          risk: ['위험'],
          reason: ['이용금액 급감'],
          spend: ['1천만 원 이상'],
        },
      }),
    );
    expect(summary.chip).toBe('조건 3개 적용');
    expect(summary.items.at(-1)).toEqual({ key: '발송 채널', value: '카카오' });
  });

  it('describes a random draw with its control group', () => {
    const summary = buildTargetSummary(
      draftOf({
        mode: 'rand',
        channel: 'kakao',
        poolKey: RANDOM_POOL_KEY,
        size: 3000,
        control: true,
      }),
    );
    expect(summary.total).toBe(3000);
    expect(summary.items.map((item) => item.value)).toEqual([
      '카카오',
      RANDOM_POOLS[0].label,
      '3,000명',
      '3,000명 (미발송)',
    ]);
  });
});

describe('buildAiInsight', () => {
  it('shows the segment insight for a single pick', () => {
    expect(buildAiInsight([SEND_SEGMENTS[1]]).highlight).toBe(
      SEND_SEGMENTS[1].recommendation,
    );
  });

  it('summarises the best segment and a weighted response for several picks', () => {
    const [s1, s2] = SEND_SEGMENTS;
    const insight = buildAiInsight([s1, s2]);
    expect(insight.text).toContain(`${s1.name}의 예상 반응(42.9%)`);
    expect(insight.text).toContain('텔레마케팅 1개, 카카오 1개');
    const average = (42.9 * s1.count + 31.4 * s2.count) / (s1.count + s2.count);
    expect(insight.highlight).toBe(
      `전체 예상 반응 ${average.toFixed(1)}% (인원 가중 평균)`,
    );
  });
});

describe('getMessageTargets', () => {
  it('has no template for telemarketing segments', () => {
    const targets = getMessageTargets(draftOf({ segmentIds: ['s1', 's3'] }));
    expect(targets.map(hasTemplate)).toEqual([false, true]);
  });

  it('uses one target with channel messages for direct modes', () => {
    const targets = getMessageTargets(
      draftOf({
        mode: 'rand',
        channel: 'sms',
        poolKey: RANDOM_POOL_KEY,
        size: 1000,
      }),
    );
    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({ key: 'rand', count: 1000 });
    expect(targets[0].template?.recommendedTime).toBe('19:00');
  });
});

describe('buildMessageView', () => {
  const target = getMessageTargets(draftOf({ segmentIds: ['s2'] }))[0];

  it('defaults to the recommended variant, time and first-card open', () => {
    if (!hasTemplate(target)) throw new Error('template expected');
    const view = buildMessageView(target, undefined, true);
    expect(view).toMatchObject({
      open: true,
      variantIndex: 0,
      time: '10:00',
      date: '2026-10-08',
      text: target.template.variants[0].text,
    });
  });

  it('prefers edited text over the picked variant', () => {
    if (!hasTemplate(target)) throw new Error('template expected');
    const view = buildMessageView(
      target,
      { variantIndex: 1, text: '직접 고침', aiTask: null },
      false,
    );
    expect(view.text).toBe('직접 고침');
    expect(view.open).toBe(false);
  });
});

describe('rewriteMessage', () => {
  it('keeps only the first sentence when shortening', () => {
    expect(rewriteMessage('첫 문장이에요. 둘째 문장이에요.', 'short')).toBe(
      '첫 문장이에요.',
    );
  });

  it('adds a prefix once', () => {
    const friendly = rewriteMessage('안내해요.', 'friendly');
    expect(friendly).toBe('반가워요! 안내해요.');
    expect(rewriteMessage(friendly, 'friendly')).toBe(friendly);
    expect(rewriteMessage('안내해요.', 'benefit')).toBe('[혜택] 안내해요.');
  });
});

describe('formatting', () => {
  it('formats times and dates', () => {
    expect(formatTimeLabel('11:30')).toBe('오전 11:30');
    expect(formatTimeLabel('19:00')).toBe('오후 7:00');
    expect(formatDateLabel('2026-10-08')).toBe('10월 8일 (목)');
  });
});

describe('getExtractMembers', () => {
  it('exports high-risk members for AI segments', () => {
    const members = getExtractMembers(INITIAL_SEND_DRAFT);
    expect(members.length).toBeGreaterThan(0);
    expect(
      members.every((member) => getRiskLevelFromScore(member.score) === 'high'),
    ).toBe(true);
  });
});

describe('rewriteByRequest', () => {
  it('finds rewrite directions from the request keywords', () => {
    expect(parseRewriteRequest('더 짧고 친근하게')).toEqual([
      'short',
      'friendly',
    ]);
    expect(parseRewriteRequest('혜택 강조해줘')).toEqual(['benefit']);
    // 알아들은 방향이 없으면 말투만 다듬는다
    expect(parseRewriteRequest('좋게 바꿔줘')).toEqual(['friendly']);
  });

  it('applies every direction and reports a custom task for several', () => {
    const message = '첫 문장입니다. 둘째 문장입니다.';
    expect(rewriteByRequest(message, '짧게')).toEqual({
      task: 'short',
      text: '첫 문장입니다.',
    });
    expect(rewriteByRequest(message, '짧고 친근하게')).toEqual({
      task: 'custom',
      text: '반가워요! 첫 문장입니다.',
    });
  });
});
