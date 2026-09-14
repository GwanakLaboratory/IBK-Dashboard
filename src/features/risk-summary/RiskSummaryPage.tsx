import { useMemo } from 'react';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { RiskDistributionChart } from '@/features/risk-summary/RiskDistributionChart';
import { RiskSummaryTable } from '@/features/risk-summary/RiskSummaryTable';
import { customers } from '@/data/customers';
import { countCustomersByRiskLevel } from '@/utils/risk';

export function RiskSummaryPage() {
  // Computed once here and shared by both cards below, instead of each card
  // re-deriving the same counts from the full customer list.
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

  return (
    <div>
      <PageHeading
        title="위험도 현황"
        description="전체 회원의 이탈 위험도 분포를 확인합니다."
      />

      <CardGrid columns={3}>
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
    </div>
  );
}
