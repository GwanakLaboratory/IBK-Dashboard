import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Layers,
  Percent,
  Users,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { Tabs } from '@/components/molecules/Tabs';
import { ActiveCardDistributionChart } from '@/features/dashboard/ActiveCardDistributionChart';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import {
  customers,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  productUsageStats,
} from '@/data/customers';
import type { RiskLevel } from '@/types/churn';

type OverviewTab = 'summary' | 'half';

function scrollToSection(sectionId: string) {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OverviewTab>('summary');

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
        title="종합 현황"
        description="핵심 지표와 위험도 분포를 한눈에 확인합니다."
      />

      <Tabs
        tabs={[
          { key: 'summary', label: '전체 요약' },
          { key: 'half', label: '반기별 비교' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'summary' ? (
        <>
          <CardGrid columns={3} breakpoint="lg">
            <StatCard
              label="전체 카드 사용액"
              value={`${(latestUsage.usage / 10000).toFixed(1)}억원`}
              helperText={`1인당 평균 ${(latestAvgUsagePerMember / 10000).toFixed(1)}만원`}
              Icon={CreditCard}
              onClick={() =>
                navigate('/dashboard/trend', { state: { tab: 'usage' } })
              }
            />
            <StatCard
              label="이용 가능 회원수"
              value={`${latestActivity.activeMembers.toLocaleString('ko-KR')}명`}
              helperText={`신규 ${latestActivity.newSignups.toLocaleString('ko-KR')}명 | 해지 ${latestActivity.canceledMembers.toLocaleString('ko-KR')}명`}
              Icon={Users}
              onClick={() =>
                navigate('/dashboard/trend', { state: { tab: 'members' } })
              }
            />
            <StatCard
              label="전체 이탈률"
              value={`${overallChurnRate.toFixed(1)}%`}
              helperText="발급 대비 누적 해지 비율"
              Icon={Percent}
              indicator
              onClick={() =>
                navigate('/dashboard/trend', { state: { tab: 'churn' } })
              }
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
              onClick={() => navigate('/dashboard/cause')}
            />
            <StatCard
              label="카드 상품 개수"
              value={`${productUsageStats.length}개`}
              helperText="개인 신용카드 상품 기준"
              Icon={Layers}
              onClick={() =>
                scrollToSection('section-active-card-distribution')
              }
            />
          </CardGrid>

          <CardGrid columns={2} breakpoint="lg">
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
              id="section-active-card-distribution"
              title="이용 중인 카드 상품 비중"
              description="현재 이용 회원 기준 발급 카드 상품 비중 상위 5개 (클릭 시 카드 상세로 이동)"
              seeMoreHref="/card-list"
            >
              <ActiveCardDistributionChart stats={productUsageStats} />
            </Card>
          </CardGrid>
        </>
      ) : (
        <CardGrid columns={1}>
          <Card title="반기별 비교">
            <EmptyState />
          </Card>
        </CardGrid>
      )}
    </div>
  );
}
