import { type ReactNode } from 'react';
import { QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </TanStackQueryClientProvider>
  );
}
