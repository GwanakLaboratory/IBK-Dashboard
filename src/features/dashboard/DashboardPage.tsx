import { useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  UserPlus,
  Users,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { MemberActivityTrendChart } from '@/features/dashboard/MemberActivityTrendChart';
import { MonthlyRiskDistributionTrendChart } from '@/features/dashboard/MonthlyRiskDistributionTrendChart';
import { MonthlyUsageTrendChart } from '@/features/dashboard/MonthlyUsageTrendChart';
import { NewSignupTrendChart } from '@/features/dashboard/NewSignupTrendChart';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import {
  customers,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
} from '@/data/customers';
import type { RiskLevel } from '@/types/churn';

export function DashboardPage() {
  const latestUsage = monthlyTotalUsage[monthlyTotalUsage.length - 1];
  const latestActivity =
    monthlyMemberActivity[monthlyMemberActivity.length - 1];
  const latestRiskDistribution =
    monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
  const latestHighRiskCount = Math.round(
    (latestActivity.activeMembers * latestRiskDistribution.high) / 100,
  );
  const latestRiskCounts: Record<RiskLevel, number> = {
    high: latestHighRiskCount,
    medium: Math.round(
      (latestActivity.activeMembers * latestRiskDistribution.mid) / 100,
    ),
    low: Math.round(
      (latestActivity.activeMembers * latestRiskDistribution.low) / 100,
    ),
  };
  const topReason = useMemo(() => getAverageReasonImpact(customers)[0], []);

  return (
    <div>
      <PageHeading
        title="대시보드"
        description="카드 회원 이탈 위험 현황을 한눈에 확인합니다."
      />

      <CardGrid columns={5} breakpoint="lg">
        <StatCard
          label="전체 카드 사용액"
          value={`${(latestUsage.usage / 10000).toFixed(1)}억원`}
          helperText={`${latestUsage.month} 기준`}
          Icon={CreditCard}
        />
        <StatCard
          label="이용 가능 회원수"
          value={`${latestActivity.activeMembers.toLocaleString('ko-KR')}명`}
          helperText={`${latestActivity.month} 기준`}
          Icon={Users}
        />
        <StatCard
          label="신규 가입자 수"
          value={`${latestActivity.newSignups.toLocaleString('ko-KR')}명`}
          helperText={`${latestActivity.month} 기준`}
          Icon={UserPlus}
        />
        <StatCard
          label="위험도 상태 회원"
          value={`${latestHighRiskCount.toLocaleString('ko-KR')}명`}
          helperText={`전체의 ${latestRiskDistribution.high}%`}
          Icon={AlertTriangle}
          indicator
        />
        <StatCard
          label="주요 이탈 사유"
          value={topReason.label}
          helperText={`평균 기여점수 ${topReason.averageScore}점`}
          Icon={AlertCircle}
        />
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title="전체 카드 사용액 추이"
          description="월별 전체 카드 사용액 추이 (최근 12개월)"
        >
          <MonthlyUsageTrendChart monthlyTotalUsage={monthlyTotalUsage} />
        </Card>
        <Card
          title="이용 가능 회원수 추이"
          description="월별 카드 이용 회원수 추이 (최근 12개월)"
        >
          <MemberActivityTrendChart
            monthlyMemberActivity={monthlyMemberActivity}
          />
        </Card>
        <Card
          title="신규 가입자 추이"
          description="월별 신규 가입 회원 수 (최근 12개월)"
        >
          <NewSignupTrendChart monthlyMemberActivity={monthlyMemberActivity} />
        </Card>
        <Card
          title="위험도 상태별 회원 현황"
          description="위험 / 중위험 / 저위험 구성비 (최근 12개월)"
        >
          <MonthlyRiskDistributionTrendChart
            monthlyRiskDistribution={monthlyRiskDistribution}
          />
        </Card>

        <Card title="위험도 분포" description="전체 회원의 위험도별 구성비">
          <RiskDistributionChart
            countsByRiskLevel={latestRiskCounts}
            totalCustomerCount={latestActivity.activeMembers}
          />
        </Card>
        <Card title="위험도별 인원 현황" description="위험도 단계별 회원 수">
          <RiskSummaryTable
            countsByRiskLevel={latestRiskCounts}
            totalCustomerCount={latestActivity.activeMembers}
          />
        </Card>
      </CardGrid>
    </div>
  );
}
