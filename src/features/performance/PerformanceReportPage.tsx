import { useState } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';

type PerformanceTab = 'conversion' | 'economic';

export function PerformanceReportPage() {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('conversion');

  return (
    <div>
      <PageHeading
        title="성과 리포트"
        description="이탈 방지 활동의 전환율과 경제적 효과를 확인합니다."
      />

      <Tabs
        tabs={[
          { key: 'conversion', label: '전환율' },
          { key: 'economic', label: '경제적 효과' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <CardGrid columns={1}>
        <Card title={activeTab === 'conversion' ? '전환율' : '경제적 효과'}>
          <EmptyState />
        </Card>
      </CardGrid>
    </div>
  );
}
