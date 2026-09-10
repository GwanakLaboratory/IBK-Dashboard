import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components/molecules/Card';
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="위험"
          value={`${countsByRiskLevel.high}명`}
          helperText={formatShare(countsByRiskLevel.high)}
          icon={AlertTriangle}
          iconColorClassName="bg-red-50 text-red-500"
        />
        <StatCard
          label="중위험"
          value={`${countsByRiskLevel.medium}명`}
          helperText={formatShare(countsByRiskLevel.medium)}
          icon={TrendingUp}
          iconColorClassName="bg-amber-50 text-amber-500"
        />
        <StatCard
          label="저위험"
          value={`${countsByRiskLevel.low}명`}
          helperText={formatShare(countsByRiskLevel.low)}
          icon={Users}
          iconColorClassName="bg-emerald-50 text-emerald-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
