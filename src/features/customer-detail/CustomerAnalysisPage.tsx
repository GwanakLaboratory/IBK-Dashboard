import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ChurnScoreHistogramChart } from '@/features/customer-detail/ChurnScoreHistogramChart';
import { MemberSegmentAvgUsageChart } from '@/features/customer-detail/MemberSegmentAvgUsageChart';
import { MemberSegmentUsageTrendChart } from '@/features/customer-detail/MemberSegmentUsageTrendChart';
import { monthlyMemberActivity, monthlyTotalUsage } from '@/data/customers';

const HIGH_RISK_SHARE = 0.05;
const MID_RISK_SHARE = 0.15;

export function CustomerAnalysisPage() {
  const churnScoreHistogramData = useMemo(
    () =>
      monthlyMemberActivity.map((point) => {
        const high = Math.round(point.activeMembers * HIGH_RISK_SHARE);
        const mid = Math.round(point.activeMembers * MID_RISK_SHARE);
        const low = point.activeMembers - high - mid;
        return { month: point.month, high, mid, low };
      }),
    [],
  );

  return (
    <div>
      <PageHeading title="회원 이탈 스코어 분석" />

      <CardGrid columns={1}>
        <Card
          title="회원 전체 이탈 스코어"
          description="위험 / 중위험 / 저위험 구성 (최근 12개월)"
        >
          <ChurnScoreHistogramChart data={churnScoreHistogramData} />
        </Card>
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title="이용 가능 회원 카드 사용액 추이"
          description="신규 회원 vs 기존 회원 (최근 12개월)"
        >
          <MemberSegmentUsageTrendChart
            monthlyTotalUsage={monthlyTotalUsage}
            monthlyMemberActivity={monthlyMemberActivity}
          />
        </Card>
        <Card
          title="1인당 카드 사용액 추이"
          description="신규 회원 vs 기존 회원 (최근 12개월)"
        >
          <MemberSegmentAvgUsageChart
            monthlyTotalUsage={monthlyTotalUsage}
            monthlyMemberActivity={monthlyMemberActivity}
          />
        </Card>
      </CardGrid>
    </div>
  );
}
