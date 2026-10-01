import { useState } from 'react';
import { useLocation } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';
import { AverageUsagePerMemberTrendChart } from '@/features/dashboard/AverageUsagePerMemberTrendChart';
import { MemberActivityTrendChart } from '@/features/dashboard/MemberActivityTrendChart';
import { MonthlyUsageTrendChart } from '@/features/dashboard/MonthlyUsageTrendChart';
import { NewSignupTrendChart } from '@/features/dashboard/NewSignupTrendChart';
import { TransactionCountTrendChart } from '@/features/dashboard/TransactionCountTrendChart';
import { UsageVolatilityChart } from '@/features/dashboard/UsageVolatilityChart';
import {
  monthlyMemberActivity,
  monthlyTotalUsage,
  monthlyTransactionCount,
} from '@/data/customers';

type TrendTab = 'usage' | 'members';

function isTrendTab(value: unknown): value is TrendTab {
  return value === 'usage' || value === 'members';
}

export function DashboardTrendPage() {
  const location = useLocation();
  const navigationState = location.state as { tab?: unknown } | null;
  const initialTab = isTrendTab(navigationState?.tab)
    ? navigationState.tab
    : 'usage';
  const [activeTab, setActiveTab] = useState<TrendTab>(initialTab);

  return (
    <Screen>
      <PageHeading />

      <Tabs
        tabs={[
          { key: 'usage', label: '사용액' },
          { key: 'members', label: '회원수' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      >
        {activeTab === 'usage' && (
          <CardGrid columns={2} breakpoint="lg">
            <Card
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
          </CardGrid>
        )}

        {activeTab === 'members' && (
          <CardGrid columns={2} breakpoint="lg">
            <Card
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
              <NewSignupTrendChart
                monthlyMemberActivity={monthlyMemberActivity}
              />
            </Card>
          </CardGrid>
        )}
      </Tabs>
    </Screen>
  );
}
