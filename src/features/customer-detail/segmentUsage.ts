import type { MonthlyMemberActivityPoint, MonthlyPoint } from '@/types/churn';

// 신규 회원은 온보딩 초기 단계라 기존 회원 대비 평균 카드 사용액이 낮다고 가정.
const NEW_MEMBER_USAGE_RATIO = 0.65;

export type MonthlySegmentUsagePoint = {
  month: string;
  existingMemberCount: number;
  newMemberCount: number;
  existingMemberTotalUsage: number; // 원
  newMemberTotalUsage: number; // 원
  existingMemberAvgUsage: number; // 원
  newMemberAvgUsage: number; // 원
};

export function buildMonthlySegmentUsage(
  monthlyTotalUsage: MonthlyPoint[],
  monthlyMemberActivity: MonthlyMemberActivityPoint[],
): MonthlySegmentUsagePoint[] {
  const activityByMonth = new Map(
    monthlyMemberActivity.map((point) => [point.month, point]),
  );

  return monthlyTotalUsage.map((point) => {
    const activity = activityByMonth.get(point.month);
    const totalMembers = activity?.activeMembers ?? 0;
    const newMemberCount = activity?.newSignups ?? 0;
    const existingMemberCount = Math.max(0, totalMembers - newMemberCount);
    const totalUsageWon = point.usage * 10000;

    const weightedMemberCount =
      existingMemberCount + newMemberCount * NEW_MEMBER_USAGE_RATIO;
    const existingMemberAvgUsage =
      weightedMemberCount === 0 ? 0 : totalUsageWon / weightedMemberCount;
    const newMemberAvgUsage = existingMemberAvgUsage * NEW_MEMBER_USAGE_RATIO;

    return {
      month: point.month,
      existingMemberCount,
      newMemberCount,
      existingMemberTotalUsage: Math.round(
        existingMemberAvgUsage * existingMemberCount,
      ),
      newMemberTotalUsage: Math.round(newMemberAvgUsage * newMemberCount),
      existingMemberAvgUsage: Math.round(existingMemberAvgUsage),
      newMemberAvgUsage: Math.round(newMemberAvgUsage),
    };
  });
}
