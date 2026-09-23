import type { ChurnRateBreakdown, UsageChurnHistogramBin } from '@/types/churn';

function sumHistogramRange(
  histogram: UsageChurnHistogramBin[],
  lowerBound: number,
  upperBound: number,
) {
  let issuedCount = 0;
  let canceledCount = 0;
  let previousBoundary = 0;

  for (const bin of histogram) {
    const binLower = previousBoundary;
    const binUpper = bin.upperBound;
    previousBoundary = binUpper;

    const overlapLower = Math.max(binLower, lowerBound);
    const overlapUpper = Math.min(binUpper, upperBound);
    if (overlapUpper <= overlapLower) {
      continue;
    }

    const overlapFraction =
      (overlapUpper - overlapLower) / (binUpper - binLower);
    issuedCount += bin.issuedCount * overlapFraction;
    canceledCount += bin.canceledCount * overlapFraction;
  }

  return { issuedCount, canceledCount };
}

function formatManwon(amountWon: number): string {
  return `${Math.round(amountWon / 10000).toLocaleString('ko-KR')}만원`;
}

/**
 * 사용자가 입력한 두 경계값(원)으로 히스토그램을 소액/중간/고액 3구간으로
 * 다시 잘라 합산한다. 경계가 히스토그램 구간 중간을 지날 때는 해당 구간 내
 * 사용액이 균등 분포한다고 가정해 비례 배분한다.
 */
export function buildUsageSegmentChurnStats(
  histogram: UsageChurnHistogramBin[],
  threshold1: number,
  threshold2: number,
): ChurnRateBreakdown[] {
  const maxBound = histogram[histogram.length - 1]?.upperBound ?? 0;
  const segments: [string, number, number][] = [
    [`소액 이용자 (~${formatManwon(threshold1)})`, 0, threshold1],
    [
      `중간 이용자 (${formatManwon(threshold1)}~${formatManwon(threshold2)})`,
      threshold1,
      threshold2,
    ],
    [`고액 이용자 (${formatManwon(threshold2)}~)`, threshold2, maxBound],
  ];

  return segments.map(([label, lower, upper]) => {
    const clampedLower = Math.min(Math.max(lower, 0), maxBound);
    const clampedUpper = Math.min(Math.max(upper, clampedLower), maxBound);
    const { issuedCount, canceledCount } = sumHistogramRange(
      histogram,
      clampedLower,
      clampedUpper,
    );
    const roundedIssued = Math.round(issuedCount);
    const roundedCanceled = Math.round(canceledCount);
    const churnRate =
      roundedIssued === 0
        ? 0
        : Math.round((roundedCanceled / roundedIssued) * 1000) / 10;

    return {
      label,
      issuedCount: roundedIssued,
      canceledCount: roundedCanceled,
      churnRate,
    };
  });
}
