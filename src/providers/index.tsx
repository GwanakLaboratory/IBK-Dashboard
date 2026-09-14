import { QueryClientProvider } from '@/providers/QueryClientProvider';
import RouteProvider from '@/providers/RouteProvider';

export default function Providers() {
  return (
    <QueryClientProvider>
      <RouteProvider />
    </QueryClientProvider>
  );
}
