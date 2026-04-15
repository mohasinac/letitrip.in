"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Default query options — applied globally to every useQuery call unless the
 * hook overrides them individually.
 *
 * staleTime  — how long cached data is considered fresh (no refetch on mount).
 * gcTime     — how long unused data stays in the cache before being garbage-
 *              collected. Must be > staleTime to prevent "fetch on every
 *              navigation" for data that was just fetched on the previous page.
 * retry      — on network/server errors, 1 retry is enough; 2+ doubles reads.
 * refetchOnWindowFocus   — disabled globally; critical for Firestore cost.
 * refetchOnReconnect     — disabled; prevents a burst of reads when a mobile
 *                          device reconnects to wifi.
 * refetchOnMount         — "true" is the right default: only refetch when data
 *                          has gone stale, not on every mount.
 */
const QUERY_DEFAULTS = {
  staleTime: 5 * 60 * 1000, // 5 min — override per hook (see staleTime tiers)
  gcTime: 30 * 60 * 1000, // 30 min — keep cache across page navigations
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/**
 * Module-level singleton so invalidateQueries() can be called outside React.
 * Set once when QueryProvider mounts — safe because there is exactly one provider.
 */
let _queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!_queryClient) {
    // Fallback: create a client on first access (e.g. during SSR or tests)
    _queryClient = new QueryClient({
      defaultOptions: { queries: QUERY_DEFAULTS },
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
      defaultOptions: { queries: QUERY_DEFAULTS },
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

