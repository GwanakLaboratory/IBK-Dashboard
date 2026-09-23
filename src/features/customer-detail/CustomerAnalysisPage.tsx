import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ChurnRateComparisonChart } from '@/features/customer-detail/ChurnRateComparisonChart';
import { ChurnScoreHistogramChart } from '@/features/customer-detail/ChurnScoreHistogramChart';
import { MemberSegmentAvgUsageChart } from '@/features/customer-detail/MemberSegmentAvgUsageChart';
import { MemberSegmentUsageTrendChart } from '@/features/customer-detail/MemberSegmentUsageTrendChart';
import { UsageSegmentChurnAnalysis } from '@/features/customer-detail/UsageSegmentChurnAnalysis';
import {
  ageGroupChurnStats,
  genderChurnStats,
  memberCohortChurnStats,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
} from '@/data/customers';

export function CustomerAnalysisPage() {
  const churnScoreHistogramData = useMemo(
    () =>
      monthlyMemberActivity.map((point, index) => {
        const distribution = monthlyRiskDistribution[index];
        const high = Math.round(
          (point.activeMembers * distribution.high) / 100,
        );
        const mid = Math.round((point.activeMembers * distribution.mid) / 100);
        const low = point.activeMembers - high - mid;
        return { month: point.month, high, mid, low };
      }),
    [],
  );

  return (
    <div>
      <PageHeading title="회원 이탈 스코어 분석" />

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

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title="회원 전체 이탈 스코어"
          description="위험 / 중위험 / 저위험 구성 (최근 12개월)"
        >
          <ChurnScoreHistogramChart data={churnScoreHistogramData} />
        </Card>
        <Card
          title="카드 사용액 규모별 이탈 분석"
          description="구간 경계값을 설정해 소액/중간/고액 이용자 이탈률 비교"
        >
          <UsageSegmentChurnAnalysis />
        </Card>
      </CardGrid>

      <CardGrid columns={3} breakpoint="lg">
        <Card
          title="신규/기존 회원 이탈률 비교"
          description="신규 회원(6개월 이내 가입) vs 기존 회원"
        >
          <ChurnRateComparisonChart items={memberCohortChurnStats} />
        </Card>
        <Card
          title="연령대별 이탈률 비교"
          description="연령대별 발급 회원수 대비 해지 비율"
        >
          <ChurnRateComparisonChart items={ageGroupChurnStats} />
        </Card>
        <Card
          title="성별 이탈률 비교"
          description="성별 발급 회원수 대비 해지 비율"
        >
          <ChurnRateComparisonChart items={genderChurnStats} />
        </Card>
      </CardGrid>
    </div>
  );
}
