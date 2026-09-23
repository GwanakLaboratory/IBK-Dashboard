import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { HighRiskMemberExtractor } from '@/features/marketing/HighRiskMemberExtractor';

export function HighRiskExtractionPage() {
  return (
    <div>
      <PageHeading
        title="고위험 회원 리스트 추출"
        description="마케팅 대상 회원을 그룹/인원수 조건으로 랜덤 추출하고 CSV로 내려받습니다."
      />

      <CardGrid columns={1}>
        <Card
          title="고위험 회원 리스트 추출"
          description="대상 그룹과 인원수를 설정해 랜덤 추출 후 CSV로 내려받기"
        >
          <HighRiskMemberExtractor />
        </Card>
      </CardGrid>
    </div>
  );
}
