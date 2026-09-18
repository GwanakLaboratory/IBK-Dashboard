import { useMemo } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ChurnScoreHistogramChart } from '@/features/customer-detail/ChurnScoreHistogramChart';
import { monthlyMemberActivity } from '@/data/customers';

const HIGH_RISK_SHARE = 0.05;
const MID_RISK_SHARE = 0.15;

export function CustomerAnalysisPage() {
  const churnScoreHistogramData = useMemo(
    () =>
      monthlyMemberActivity.map((point) => {
        const high = Math.round(point.activeMembers * HIGH_RISK_SHARE);
        const mid = Math.round(point.activeMembers * MID_RISK_SHARE);
        const low = point.activeMembers - high - mid;
        return { month: point.month, high, mid, low };
      }),
    [],
  );

  return (
    <div>
      <PageHeading title="회원 이탈 스코어 분석" />

      <CardGrid columns={1}>
        <Card
          title="회원 전체 이탈 스코어"
          description="위험 / 중위험 / 저위험 구성 (최근 12개월)"
        >
          <ChurnScoreHistogramChart data={churnScoreHistogramData} />
        </Card>
      </CardGrid>
    </div>
  );
}
