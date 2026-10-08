import { describe, expect, it } from 'vitest';
import { getRiskLevelFromScore, interleaveByRiskLevel } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

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
