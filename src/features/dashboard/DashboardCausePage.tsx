import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ReasonImpactChart } from '@/features/reason-analysis/ReasonImpactChart';
import { ScoreDistributionChart } from '@/features/reason-analysis/ScoreDistributionChart';
import {
  getAverageReasonImpact,
  getPredictionScoreHistogram,
} from '@/features/reason-analysis/reasonAnalytics';
import { customers } from '@/data/customers';

export function DashboardCausePage() {
  const reasonImpacts = useMemo(() => getAverageReasonImpact(customers), []);
  const scoreHistogramBuckets = useMemo(
    () => getPredictionScoreHistogram(customers),
    [],
  );

  return (
    <div>
      <PageHeading
        title="이탈 원인"
        description="이탈에 영향을 준 이유와 예측점수 분포를 확인합니다."
      />

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
    </div>
  );
}
