"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // A failing endpoint costs (1 + retry) invocations, and the delay
            // below is deliberately tight, so retries land almost immediately —
            // at retry: 2 an outage tripled its own request volume against the
            // service that was already failing. One retry still absorbs the
            // transient blip that retrying exists for.
            retry: 1,
            retryDelay: (attempt) => Math.min(200 * 2 ** attempt, 3000),
            staleTime: 30_000,
            // Stays false as the global default. Hooks that genuinely need
            // focus-freshness opt in individually (useNotifications, useCart*),
            // which keeps the cost attributable to the hook that chose it.
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
