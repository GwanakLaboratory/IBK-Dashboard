import { describe, expect, it } from 'vitest';
import {
  getReasonShortLabel,
  getRiskLevelFromScore,
  getRiskLevelRank,
  interleaveByRiskLevel,
} from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

describe('getReasonShortLabel', () => {
  it('returns the mapped short label for a known reason', () => {
    expect(getReasonShortLabel('최근 3개월 이용금액 급감')).toBe(
      '이용금액 급감',
    );
  });

  it('returns the original label when there is no mapping', () => {
    expect(getReasonShortLabel('알 수 없는 사유')).toBe('알 수 없는 사유');
  });
});

describe('getRiskLevelRank', () => {
  it('ranks low below medium below high', () => {
    expect(getRiskLevelRank('low')).toBeLessThan(getRiskLevelRank('medium'));
    expect(getRiskLevelRank('medium')).toBeLessThan(getRiskLevelRank('high'));
  });
});

describe('getRiskLevelFromScore', () => {
  it('classifies scores below 40 as low', () => {
    expect(getRiskLevelFromScore(0)).toBe('low');
    expect(getRiskLevelFromScore(39)).toBe('low');
  });

  it('classifies 40-69 as medium', () => {
    expect(getRiskLevelFromScore(40)).toBe('medium');
    expect(getRiskLevelFromScore(69)).toBe('medium');
  });

  it('classifies 70 and above as high', () => {
    expect(getRiskLevelFromScore(70)).toBe('high');
    expect(getRiskLevelFromScore(100)).toBe('high');
  });
});

describe('interleaveByRiskLevel', () => {
  it('round-robins high, medium, low while preserving each group order', () => {
    const items = [
      { id: 'h1', riskLevel: 'high' as RiskLevel },
      { id: 'h2', riskLevel: 'high' as RiskLevel },
      { id: 'm1', riskLevel: 'medium' as RiskLevel },
      { id: 'l1', riskLevel: 'low' as RiskLevel },
    ];
    const result = interleaveByRiskLevel(items).map((item) => item.id);
    // Round 1: high(h1), medium(m1), low(l1) -- round 2: high(h2)
    expect(result).toEqual(['h1', 'm1', 'l1', 'h2']);
  });

  it('keeps all items and drops none', () => {
    const items = Array.from({ length: 7 }, (_, index) => ({
      id: `item-${index}`,
      riskLevel: (['high', 'medium', 'low'] as const)[index % 3],
    }));
    expect(interleaveByRiskLevel(items)).toHaveLength(items.length);
  });
});
