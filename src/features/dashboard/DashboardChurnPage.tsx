import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';
import { MonthlyRiskDistributionTrendChart } from '@/features/dashboard/MonthlyRiskDistributionTrendChart';
import { RiskMemberFlowChart } from '@/features/dashboard/RiskMemberFlowChart';
import { RiskTransitionMatrixTable } from '@/features/dashboard/RiskTransitionMatrixTable';
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
  riskTransitionMatrix,
} from '@/data/customers';

type ChurnTab = 'trend' | 'cause';

function isChurnTab(value: unknown): value is ChurnTab {
  return value === 'trend' || value === 'cause';
}

export function DashboardChurnPage() {
  const location = useLocation();
  const navigationState = location.state as { tab?: unknown } | null;
  const initialTab = isChurnTab(navigationState?.tab)
    ? navigationState.tab
    : 'trend';
  const [activeTab, setActiveTab] = useState<ChurnTab>(initialTab);

  const reasonImpacts = useMemo(() => getAverageReasonImpact(customers), []);
  const scoreHistogramBuckets = useMemo(
    () => getPredictionScoreHistogram(customers),
    [],
  );

  return (
    <Screen>
      <PageHeading />

      <Tabs
        tabs={[
          { key: 'trend', label: '이탈 추이' },
          { key: 'cause', label: '이탈 원인' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      >
        {activeTab === 'trend' && (
          <>
            <CardGrid columns={2} breakpoint="lg">
              <Card
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
                    monthlyRiskDistribution[monthlyRiskDistribution.length - 2]
                      .month
                  }
                  toMonth={
                    monthlyRiskDistribution[monthlyRiskDistribution.length - 1]
                      .month
                  }
                />
              </Card>
            </CardGrid>
            <CardGrid columns={1}>
              <Card
                title="위험군 규모 · 월별 흐름"
                description="최근 12개월 위험군 회원 수 추이"
              >
                <RiskMemberFlowChart
                  monthlyMemberActivity={monthlyMemberActivity}
                  monthlyRiskDistribution={monthlyRiskDistribution}
                />
              </Card>
            </CardGrid>
          </>
        )}

        {activeTab === 'cause' && (
          <CardGrid columns={2} breakpoint="lg">
            <Card
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
          </CardGrid>
        )}
      </Tabs>
    </Screen>
  );
}
