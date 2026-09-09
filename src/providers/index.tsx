import { type ReactNode } from 'react';
import { QueryClientProvider } from '@/providers/QueryClientProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider>{children}</QueryClientProvider>;
}
