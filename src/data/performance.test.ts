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

  it('대시보드 이용 고객은 전체 회원 이상 언저리, 위험 비중은 이탈 비율 언저리다', () => {
    const total = (RISK_COUNTS[latest] / RISK_RATIOS[latest]) * 100;
    // 전체 회원 130만 이상 ~ +1% 안, 이탈 비율 20%의 ±0.5%p 안
    expect(total).toBeGreaterThanOrEqual(EFFECT_ASSUMPTIONS.totalMembers);
    expect(total / EFFECT_ASSUMPTIONS.totalMembers).toBeLessThan(1.01);
    expect(
      Math.abs(RISK_RATIOS[latest] - EFFECT_ASSUMPTIONS.churnRate * 100),
    ).toBeLessThan(0.5);
  });

  it('회원 목록 · 마케팅 · 고객 분석의 분석 대상은 대시보드 이용 고객과 같다', () => {
    const total = Math.round((RISK_COUNTS[latest] / RISK_RATIOS[latest]) * 100);
    expect(MEMBER_COUNT_BY_LEVEL.all).toBe(total);
    expect(ALL_MEMBER_COUNT).toBe(total);
    STATIC_DIMENSIONS.forEach((dimension) => {
      const sum = dimension.rows.reduce((acc, [, , count]) => acc + count, 0);
      expect(sum).toBe(total);
    });
  });

  it('회원 목록 위험 + 중위험은 대시보드 이탈 위험 고객과 같다', () => {
    expect(MEMBER_COUNT_BY_LEVEL.high + MEMBER_COUNT_BY_LEVEL.medium).toBe(
      RISK_COUNTS[latest],
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
