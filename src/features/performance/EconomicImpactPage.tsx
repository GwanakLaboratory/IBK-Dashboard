import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/molecules/PageHeading';
import { EconomicImpactReport } from '@/features/performance/EconomicImpactReport';

export function EconomicImpactPage() {
  return (
    <Screen>
      <PageHeading />
      <EconomicImpactReport />
    </Screen>
  );
}
