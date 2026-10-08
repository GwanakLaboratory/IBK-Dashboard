import { describe, expect, it } from 'vitest';
import { CAMPAIGNS } from '@/data/campaign';
import { STATIC_DIMENSIONS } from '@/data/customerAnalysis';
import { ALL_MEMBER_COUNT } from '@/data/marketing';
import { MONTHS, RISK_COUNTS, RISK_RATIOS } from '@/data/overview';
import {
  calcExpectedEffect,
  EFFECT_ASSUMPTIONS,
  PERFORMANCE_KPIS,
  RETENTION_RATE,
} from '@/data/performance';
import { MEMBER_COUNT_BY_LEVEL } from '@/data/target';

describe('calcExpectedEffect', () => {
  it('공식대로 단계별 인원과 효과를 계산한다', () => {
    const effect = calcExpectedEffect(30, 10);

    expect(effect.churners).toBe(260_000);
    expect(effect.detected).toBe(208_000);
    expect(Math.round(effect.targets)).toBe(297_143);
    expect(effect.retained).toBe(62_400);
    expect(effect.usageEffect).toBe(62_400 * 800_000);
    expect(effect.costSaving).toBe(62_400 * 100_000);
  });

  it('유지율이 0이면 효과도 0이다', () => {
    const effect = calcExpectedEffect(0, 10);

    expect(effect.retained).toBe(0);
    expect(effect.usageEffect).toBe(0);
    expect(effect.costSaving).toBe(0);
  });
});

// 대시보드 더미 값이 기대 효과 공식과 어긋나지 않는지 확인한다
describe('기대 효과 공식과 대시보드 더미 값', () => {
  const effect = calcExpectedEffect(RETENTION_RATE, 10);
  const targets = Math.round(effect.targets);
  const latest = MONTHS.length - 1;

  it('전체 회원은 분석 대상 고객 수와 같다', () => {
    const total = (RISK_COUNTS[latest] / RISK_RATIOS[latest]) * 100;
    expect(Math.round(total)).toBe(EFFECT_ASSUMPTIONS.totalMembers);
    expect(MEMBER_COUNT_BY_LEVEL.all).toBe(EFFECT_ASSUMPTIONS.totalMembers);
    expect(ALL_MEMBER_COUNT).toBe(EFFECT_ASSUMPTIONS.totalMembers);
    STATIC_DIMENSIONS.forEach((dimension) => {
      const sum = dimension.rows.reduce((acc, [, , count]) => acc + count, 0);
      expect(sum).toBe(EFFECT_ASSUMPTIONS.totalMembers);
    });
  });

  it('이탈 위험 고객은 마케팅 대상(모델 발견 ÷ Precision)과 같다', () => {
    expect(RISK_COUNTS[latest]).toBe(targets);
    expect(MEMBER_COUNT_BY_LEVEL.high + MEMBER_COUNT_BY_LEVEL.medium).toBe(
      targets,
    );
    expect(
      MEMBER_COUNT_BY_LEVEL.high +
        MEMBER_COUNT_BY_LEVEL.medium +
        MEMBER_COUNT_BY_LEVEL.low,
    ).toBe(MEMBER_COUNT_BY_LEVEL.all);
  });

  it('9월 캠페인 발송은 마케팅 대상, 이용 재개는 유지 고객과 같다', () => {
    const sent = CAMPAIGNS.filter((campaign) => campaign.status !== 'plan');
    expect(sent.reduce((acc, campaign) => acc + campaign.count, 0)).toBe(
      targets,
    );
    expect(PERFORMANCE_KPIS.returned).toBe(effect.retained);
  });

  it('방어 이용금액은 월 이용액 효과의 12개월치다', () => {
    expect(PERFORMANCE_KPIS.amount).toBeCloseTo(
      (effect.usageEffect * 12) / 100_000_000,
    );
  });
});
