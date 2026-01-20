"use client";

/**
 * React Query Provider
 * 
 * Configures React Query with optimal caching strategies
 * for the entire application.
 */

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { queryClientConfig } from "@/lib/caching";

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  // Create query client once per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryClientConfig,
      }),
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </TanstackQueryClientProvider>
  );
}
