import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { MemberActivityTrendChart } from '@/features/dashboard/MemberActivityTrendChart';
import { NewSignupTrendChart } from '@/features/dashboard/NewSignupTrendChart';
import { QuarterlyUsageChart } from '@/features/dashboard/QuarterlyUsageChart';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskRatioTrendChart } from '@/features/dashboard/RiskRatioTrendChart';
import { RiskSummaryTable } from '@/features/dashboard/RiskSummaryTable';
import {
  customers,
  monthlyMemberActivity,
  quarterlyOverall,
} from '@/data/customers';
import { countCustomersByRiskLevel } from '@/utils/risk';

export function DashboardPage() {
  const countsByRiskLevel = useMemo(
    () => countCustomersByRiskLevel(customers),
    [],
  );
  const totalCustomerCount = customers.length;

  return (
    <div>
      <PageHeading
        title="대시보드"
        description="카드 회원 이탈 위험 현황을 한눈에 확인합니다."
      />

      <CardGrid columns={2} breakpoint="lg">
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
    </div>
  );
}
