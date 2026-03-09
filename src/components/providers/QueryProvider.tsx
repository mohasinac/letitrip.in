"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Module-level singleton so invalidateQueries() can be called outside React.
 * Set once when QueryProvider mounts — safe because there is exactly one provider.
 */
let _queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!_queryClient) {
    // Fallback: create a client on first access (e.g. during SSR or tests)
    _queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return _queryClient;
}

/**
 * QueryProvider
 *
 * Wraps the app with TanStack Query's QueryClientProvider.
 * A single QueryClient is created once and stored in the module-level singleton
 * so that `invalidateQueries()` (called from non-React contexts) works correctly.
 *
 * Devtools are only rendered in development.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    });
    _queryClient = client;
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
