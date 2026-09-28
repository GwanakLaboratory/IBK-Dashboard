import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';

type CampaignTab = 'send' | 'history';

export function MarketingCampaignPage() {
  const [activeTab, setActiveTab] = useState<CampaignTab>('send');

  return (
    <Screen>
      <PageHeading />

      <Tabs
        tabs={[
          { key: 'send', label: '타겟 발송' },
          { key: 'history', label: '접촉 이력' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      >
        <CardGrid columns={1}>
          <Card title={activeTab === 'send' ? '타겟 발송' : '접촉 이력'}>
            <EmptyState />
          </Card>
        </CardGrid>
      </Tabs>
    </Screen>
  );
}
