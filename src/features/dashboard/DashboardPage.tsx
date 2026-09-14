import { useMemo } from 'react';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { QuarterlyUsageChart } from '@/features/dashboard/QuarterlyUsageChart';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskRatioTrendChart } from '@/features/dashboard/RiskRatioTrendChart';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import { TopRiskCustomersTable } from '@/features/dashboard/TopRiskCustomersTable';
import { customers, quarterlyOverall } from '@/data/customers';
import { countCustomersByRiskLevel } from '@/utils/risk';

const TOP_RISK_CUSTOMER_COUNT = 5;

export function DashboardPage() {
  const countsByRiskLevel = useMemo(
    () => countCustomersByRiskLevel(customers),
    [],
  );
  const totalCustomerCount = customers.length;

  function formatShare(count: number) {
    if (totalCustomerCount === 0) {
      return '전체의 0%';
    }
    return `전체의 ${((count / totalCustomerCount) * 100).toFixed(1)}%`;
  }

  const averagePredictionScore = useMemo(() => {
    const totalScore = customers.reduce(
      (sum, customer) => sum + customer.predictionScore,
      0,
    );
    return customers.length === 0
      ? 0
      : Math.round(totalScore / customers.length);
  }, []);
  const topRiskCustomers = useMemo(
    () =>
      [...customers]
        .sort(
          (customerA, customerB) =>
            customerB.predictionScore - customerA.predictionScore,
        )
        .slice(0, TOP_RISK_CUSTOMER_COUNT),
    [],
  );

  return (
    <div>
      <PageHeading
        title="대시보드"
        description="카드 회원 이탈 위험 현황을 한눈에 확인합니다."
      />

      <CardGrid columns={4}>
        <StatCard label="전체 회원" value={`${customers.length}명`} />
        <StatCard
          label="위험"
          value={`${countsByRiskLevel.high}명`}
          helperText={formatShare(countsByRiskLevel.high)}
          indicator={<RiskIndicator riskLevel="high" />}
        />
        <StatCard
          label="중위험"
          value={`${countsByRiskLevel.medium}명`}
          helperText={formatShare(countsByRiskLevel.medium)}
          indicator={<RiskIndicator riskLevel="medium" />}
        />
        <StatCard
          label="저위험"
          value={`${countsByRiskLevel.low}명`}
          helperText={formatShare(countsByRiskLevel.low)}
          indicator={<RiskIndicator riskLevel="low" />}
        />
        <StatCard label="평균 예측점수" value={`${averagePredictionScore}점`} />
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card title="위험도 분포" description="전체 회원의 위험도별 구성비">
          <RiskDistributionChart
            countsByRiskLevel={countsByRiskLevel}
            totalCustomerCount={totalCustomerCount}
          />
        </Card>
        <Card title="위험도별 인원 현황" description="위험도 단계별 회원 수">
          <RiskSummaryTable
            countsByRiskLevel={countsByRiskLevel}
            totalCustomerCount={totalCustomerCount}
          />
        </Card>
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title="분기별 전체 카드 사용액 추이"
          description="단위: 만원 (점선=예측)"
        >
          <QuarterlyUsageChart quarterlyOverall={quarterlyOverall} />
        </Card>
        <Card
          title="분기별 위험도 비율 추이"
          description="위험 / 중위험 / 저위험 구성비 (%)"
        >
          <RiskRatioTrendChart quarterlyOverall={quarterlyOverall} />
        </Card>
      </CardGrid>

      <CardGrid columns={1}>
        <Card
          title="이탈 위험 상위 회원"
          description="예측점수 기준 위험 회원 Top 5"
          seeMoreHref="/customer-detail"
        >
          <TopRiskCustomersTable customers={topRiskCustomers} />
        </Card>
      </CardGrid>
    </div>
  );
}
