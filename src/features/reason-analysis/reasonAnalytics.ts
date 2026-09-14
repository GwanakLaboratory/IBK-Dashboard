import type { Customer } from '@/types/churn';

export type ReasonImpact = {
  label: string;
  averageScore: number;
};

export function getAverageReasonImpact(customers: Customer[]): ReasonImpact[] {
  const totalsByLabel = new Map<string, { sum: number; count: number }>();

  for (const customer of customers) {
    for (const reason of customer.churnReasons) {
      const totals = totalsByLabel.get(reason.label) ?? { sum: 0, count: 0 };
      totals.sum += reason.score;
      totals.count += 1;
      totalsByLabel.set(reason.label, totals);
    }
  }

  return [...totalsByLabel.entries()]
    .map(([label, totals]) => ({
      label,
      averageScore: Math.round((totals.sum / totals.count) * 10) / 10,
    }))
    .sort((reasonA, reasonB) => reasonB.averageScore - reasonA.averageScore);
}

export type ScoreHistogramBucket = {
  rangeLabel: string;
  low: number;
  medium: number;
  high: number;
};

const BUCKET_SIZE = 10;
const BUCKET_COUNT = 10;

export function getPredictionScoreHistogram(
  customers: Customer[],
): ScoreHistogramBucket[] {
  const buckets: ScoreHistogramBucket[] = Array.from(
    { length: BUCKET_COUNT },
    (_, index) => ({
      rangeLabel: `${index * BUCKET_SIZE}-${index * BUCKET_SIZE + BUCKET_SIZE}`,
      low: 0,
      medium: 0,
      high: 0,
    }),
  );

  for (const customer of customers) {
    const bucketIndex = Math.min(
      BUCKET_COUNT - 1,
      Math.floor(customer.predictionScore / BUCKET_SIZE),
    );
    buckets[bucketIndex][customer.riskLevel] += 1;
  }

  return buckets;
}
