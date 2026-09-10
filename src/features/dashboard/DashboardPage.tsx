import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { QuarterlyUsageChart } from '@/features/dashboard/QuarterlyUsageChart';
import { RiskRatioTrendChart } from '@/features/dashboard/RiskRatioTrendChart';
import { TopRiskCustomersTable } from '@/features/dashboard/TopRiskCustomersTable';
import { customers, quarterlyOverall } from '@/data/customers';
import { countCustomersByRiskLevel } from '@/utils/risk';

const TOP_RISK_CUSTOMER_COUNT = 5;

export function DashboardPage() {
  const countsByRiskLevel = useMemo(
    () => countCustomersByRiskLevel(customers),
    [],
  );
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="전체 회원" value={`${customers.length}명`} />
        <StatCard label="위험 회원" value={`${countsByRiskLevel.high}명`} />
        <StatCard label="중위험 회원" value={`${countsByRiskLevel.medium}명`} />
        <StatCard label="평균 예측점수" value={`${averagePredictionScore}점`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      </div>

      <div className="mt-6">
        <Card
          title="이탈 위험 상위 회원"
          description="예측점수 기준 위험 회원 Top 5"
        >
          <TopRiskCustomersTable customers={topRiskCustomers} />
        </Card>
      </div>
    </div>
  );
}
