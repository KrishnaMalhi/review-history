'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider, useToast } from '@/components/shared/toast';
import { API_ERROR_EVENT } from '@/lib/api-client';

function ApiErrorToaster() {
  const toast = useToast();

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ message?: string; status?: number }>;
      if (!custom.detail?.message) return;
      if (custom.detail.status === 401) return;
      toast.error(custom.detail.message);
    };

    window.addEventListener(API_ERROR_EVENT, handler as EventListener);
    return () => window.removeEventListener(API_ERROR_EVENT, handler as EventListener);
  }, [toast]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ApiErrorToaster />
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
