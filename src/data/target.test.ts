import { describe, expect, it } from 'vitest';
import { REASON_RISK_CHANGES, RISK_COUNTS } from '@/data/overview';
import { CHURN_REASONS, TARGET_MEMBERS } from '@/data/target';

describe('회원별 이탈 사유', () => {
  it('CHURN_REASONS 순서대로 회원이 많다', () => {
    const counts = CHURN_REASONS.map(
      (reason) =>
        TARGET_MEMBERS.filter((member) => member.reason === reason).length,
    );
    counts.slice(1).forEach((count, index) => {
      expect(count).toBeLessThan(counts[index]);
    });
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(
      TARGET_MEMBERS.length,
    );
  });
});

describe('대시보드 이탈 사유별 위험 고객', () => {
  it('사유별 합계가 8월 · 9월 이탈 위험 고객 수와 같다', () => {
    const sum = (index: 1 | 2) =>
      REASON_RISK_CHANGES.reduce((acc, row) => acc + row[index], 0);
    expect(sum(1)).toBe(RISK_COUNTS[RISK_COUNTS.length - 2]);
    expect(sum(2)).toBe(RISK_COUNTS[RISK_COUNTS.length - 1]);
  });

  it('CHURN_REASONS 순서대로 고객 수와 증가 폭이 크다', () => {
    expect(REASON_RISK_CHANGES.map(([name]) => name)).toEqual(CHURN_REASONS);
    REASON_RISK_CHANGES.slice(1).forEach(([, prev, cur], index) => {
      const [, abovePrev, aboveCur] = REASON_RISK_CHANGES[index];
      expect(cur).toBeLessThan(aboveCur);
      expect(cur - prev).toBeLessThan(aboveCur - abovePrev);
    });
  });
});
