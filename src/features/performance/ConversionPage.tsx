import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/molecules/PageHeading';
import { ConversionReport } from '@/features/performance/ConversionReport';

export function ConversionPage() {
  return (
    <Screen>
      <PageHeading />
      <ConversionReport />
    </Screen>
  );
}
