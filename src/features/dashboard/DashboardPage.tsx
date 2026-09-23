import { useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Layers,
  Percent,
  Users,
} from 'lucide-react';
import { useLocation } from 'react-router';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { ActiveCardDistributionChart } from '@/features/dashboard/ActiveCardDistributionChart';
import { AverageUsagePerMemberTrendChart } from '@/features/dashboard/AverageUsagePerMemberTrendChart';
import { MemberActivityTrendChart } from '@/features/dashboard/MemberActivityTrendChart';
import { MonthlyRiskDistributionTrendChart } from '@/features/dashboard/MonthlyRiskDistributionTrendChart';
import { MonthlyUsageTrendChart } from '@/features/dashboard/MonthlyUsageTrendChart';
import { NewSignupTrendChart } from '@/features/dashboard/NewSignupTrendChart';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import { RiskTransitionMatrixTable } from '@/features/dashboard/RiskTransitionMatrixTable';
import { TransactionCountTrendChart } from '@/features/dashboard/TransactionCountTrendChart';
import { UsageVolatilityChart } from '@/features/dashboard/UsageVolatilityChart';
import { ReasonImpactChart } from '@/features/reason-analysis/ReasonImpactChart';
import { ScoreDistributionChart } from '@/features/reason-analysis/ScoreDistributionChart';
import {
  getAverageReasonImpact,
  getPredictionScoreHistogram,
} from '@/features/reason-analysis/reasonAnalytics';
import {
  customers,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  monthlyTransactionCount,
  productUsageStats,
  riskTransitionMatrix,
} from '@/data/customers';
import type { RiskLevel } from '@/types/churn';

function scrollToSection(sectionId: string) {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function DashboardPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const sectionId = location.hash.slice(1);
    scrollToSection(sectionId);
  }, [location.hash]);

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
  const reasonImpacts = useMemo(() => getAverageReasonImpact(customers), []);
  const topReason = reasonImpacts[0];
  const scoreHistogramBuckets = useMemo(
    () => getPredictionScoreHistogram(customers),
    [],
  );
  const latestAvgUsagePerMember =
    (latestUsage.usage * 10000) / latestActivity.activeMembers;
  const overallChurnRate = useMemo(() => {
    const totalIssued = productUsageStats.reduce(
      (sum, stat) => sum + stat.issuedCount,
      0,
    );
    const totalCanceled = productUsageStats.reduce(
      (sum, stat) => sum + stat.canceledCount,
      0,
    );
    return totalIssued === 0 ? 0 : (totalCanceled / totalIssued) * 100;
  }, []);

  return (
    <div>
      <PageHeading
        title="대시보드"
        description="카드 회원 이탈 위험 현황을 한눈에 확인합니다."
      />

      <CardGrid columns={6} breakpoint="lg">
        <StatCard
          label="전체 카드 사용액"
          value={`${(latestUsage.usage / 10000).toFixed(1)}억원`}
          helperText={`1인당 평균 ${(latestAvgUsagePerMember / 10000).toFixed(1)}만원`}
          Icon={CreditCard}
          onClick={() => scrollToSection('section-total-usage')}
        />
        <StatCard
          label="이용 가능 회원수"
          value={`${latestActivity.activeMembers.toLocaleString('ko-KR')}명`}
          helperText={`신규 ${latestActivity.newSignups.toLocaleString('ko-KR')}명 | 해지 ${latestActivity.canceledMembers.toLocaleString('ko-KR')}명`}
          Icon={Users}
          onClick={() => scrollToSection('section-active-members')}
        />
        <StatCard
          label="전체 이탈률"
          value={`${overallChurnRate.toFixed(1)}%`}
          helperText="발급 대비 누적 해지 비율"
          Icon={Percent}
          indicator
          onClick={() => scrollToSection('section-risk-distribution-trend')}
        />
        <StatCard
          label="위험도 상태 회원"
          value={`${latestHighRiskCount.toLocaleString('ko-KR')}명`}
          helperText={`전체의 ${latestRiskDistribution.high}%`}
          Icon={AlertTriangle}
          indicator
          onClick={() => scrollToSection('section-risk-summary')}
        />
        <StatCard
          label="주요 이탈 사유"
          value={topReason.label}
          helperText={`평균 기여점수 ${topReason.averageScore}점`}
          Icon={AlertCircle}
          textSize="text-base"
          onClick={() => scrollToSection('section-reason-impact')}
        />
        <StatCard
          label="카드 상품 개수"
          value={`${productUsageStats.length}개`}
          helperText="개인 신용카드 상품 기준"
          Icon={Layers}
          onClick={() => scrollToSection('section-active-card-distribution')}
        />
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          id="section-total-usage"
          title="전체 카드 사용액 추이"
          description="월별 전체 카드 사용액 추이 (최근 12개월)"
        >
          <MonthlyUsageTrendChart monthlyTotalUsage={monthlyTotalUsage} />
        </Card>
        <Card
          title="1인당 평균 카드 사용액 추이"
          description="전체 사용액을 이용 회원수로 나눈 값 (최근 12개월)"
        >
          <AverageUsagePerMemberTrendChart
            monthlyTotalUsage={monthlyTotalUsage}
            monthlyMemberActivity={monthlyMemberActivity}
          />
        </Card>
        <Card
          title="카드 이용 횟수 추이"
          description="월별 전체 카드 이용 건수 (최근 12개월)"
        >
          <TransactionCountTrendChart
            monthlyTransactionCount={monthlyTransactionCount}
          />
        </Card>
        <Card
          title="카드 사용액 변동성 추이"
          description="전월 대비 전체 카드 사용액 증감률 (최근 11개월)"
        >
          <UsageVolatilityChart monthlyTotalUsage={monthlyTotalUsage} />
        </Card>
        <Card
          id="section-active-members"
          title="이용 가능 회원수 추이"
          description="월별 카드 이용 회원수 및 신규 가입자 추이 (최근 12개월)"
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
          id="section-risk-distribution-trend"
          title="위험도 상태별 회원 현황"
          description="위험 / 중위험 / 저위험 구성비 (최근 12개월)"
        >
          <MonthlyRiskDistributionTrendChart
            monthlyRiskDistribution={monthlyRiskDistribution}
          />
        </Card>

        <Card
          title="이탈 위험도 전이 매트릭스"
          description="지난달 위험도 대비 이번달 위험도 변화 비율"
        >
          <RiskTransitionMatrixTable
            rows={riskTransitionMatrix}
            fromMonth={
              monthlyRiskDistribution[monthlyRiskDistribution.length - 2].month
            }
            toMonth={
              monthlyRiskDistribution[monthlyRiskDistribution.length - 1].month
            }
          />
        </Card>
        <Card title="위험도 분포" description="전체 회원의 위험도별 구성비">
          <RiskDistributionChart
            countsByRiskLevel={latestRiskCounts}
            totalCustomerCount={latestActivity.activeMembers}
          />
        </Card>
        <Card
          id="section-risk-summary"
          title="위험도별 인원 현황"
          description="위험도 단계별 회원 수"
        >
          <RiskSummaryTable
            countsByRiskLevel={latestRiskCounts}
            totalCustomerCount={latestActivity.activeMembers}
          />
        </Card>
        <Card
          id="section-reason-impact"
          title="이탈 사유별 평균 영향도"
          description="전체 회원 기준 이탈 이유별 평균 기여 점수 (높은 순)"
        >
          <ReasonImpactChart reasonImpacts={reasonImpacts} />
        </Card>
        <Card
          title="이탈 예측점수 분포"
          description="구간별 회원 인원수 — 저위험(녹색) / 중위험(주황) / 위험(빨강)"
        >
          <ScoreDistributionChart buckets={scoreHistogramBuckets} />
        </Card>
        <Card
          id="section-active-card-distribution"
          title="이용 중인 카드 상품 비중"
          description="현재 이용 회원 기준 발급 카드 상품 비중 상위 5개 (클릭 시 카드 상세로 이동)"
          seeMoreHref="/card-list"
        >
          <ActiveCardDistributionChart stats={productUsageStats} />
        </Card>
      </CardGrid>
    </div>
  );
}
