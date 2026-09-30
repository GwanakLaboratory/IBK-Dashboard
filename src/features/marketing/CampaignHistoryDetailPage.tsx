import { Navigate, useParams } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/molecules/PageHeading';
import { CampaignHistoryDetail } from '@/features/marketing/CampaignHistoryDetail';
import { CAMPAIGN_HISTORY } from '@/data/marketing';

export function CampaignHistoryDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaign = CAMPAIGN_HISTORY.find((item) => item.id === campaignId);

  if (!campaign) {
    return <Navigate to="/marketing/history" replace />;
  }

  return (
    <Screen>
      <PageHeading />
      <CampaignHistoryDetail campaign={campaign} />
    </Screen>
  );
}
