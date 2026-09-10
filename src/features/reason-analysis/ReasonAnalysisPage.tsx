import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ReasonImpactChart } from '@/features/reason-analysis/ReasonImpactChart';
import { ScoreDistributionChart } from '@/features/reason-analysis/ScoreDistributionChart';
import {
  getAverageReasonImpact,
  getPredictionScoreHistogram,
} from '@/features/reason-analysis/reasonAnalytics';
import { customers } from '@/data/customers';

export function ReasonAnalysisPage() {
  const reasonImpacts = useMemo(() => getAverageReasonImpact(customers), []);
  const scoreHistogramBuckets = useMemo(
    () => getPredictionScoreHistogram(customers),
    [],
  );

  return (
    <div>
      <PageHeading
        title="이탈 이유 분석"
        description="이탈 이유별 평균 영향도 및 예측점수 분포를 분석합니다."
      />

      <div className="mt-6">
        <Card
          title="이유별 평균 영향도"
          description="전체 회원 기준 이탈 이유별 평균 기여 점수 (높은 순)"
        >
          <ReasonImpactChart reasonImpacts={reasonImpacts} />
        </Card>
      </div>

      <div className="mt-6">
        <Card
          title="예측점수 분포 (히스토그램)"
          description="10점 구간별 회원 인원수 — 저위험(녹색) / 중위험(주황) / 위험(빨강)"
        >
          <ScoreDistributionChart buckets={scoreHistogramBuckets} />
        </Card>
      </div>
    </div>
  );
}
