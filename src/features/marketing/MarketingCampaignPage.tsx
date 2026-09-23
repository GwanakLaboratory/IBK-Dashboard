import { useState } from 'react';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';

type CampaignTab = 'send' | 'history';

export function MarketingCampaignPage() {
  const [activeTab, setActiveTab] = useState<CampaignTab>('send');

  return (
    <div>
      <PageHeading
        title="캠페인 발송"
        description="위험 세그먼트에 맞춰 메시지를 발송하고 반응을 추적합니다."
      />

      <Tabs
        tabs={[
          { key: 'send', label: '타겟 발송' },
          { key: 'history', label: '접촉 이력' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <CardGrid columns={1}>
        <Card title={activeTab === 'send' ? '타겟 발송' : '접촉 이력'}>
          <EmptyState />
        </Card>
      </CardGrid>
    </div>
  );
}
