"use client";

/**
 * Providers Component
 * 
 * Centralized provider wrapper for all global contexts and state management.
 * Includes React Query, Theme, Auth, and Cart providers.
 * 
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import React, { ReactNode, useState } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers - Wraps app with all necessary providers
 * 
 * Features:
 * - React Query for data fetching and caching
 * - Theme provider for dark mode
 * - Auth context (to be implemented)
 * - Cart context (to be implemented)
 * 
 * @param props - Component props
 * @returns Providers wrapper component
 */
export function Providers({ children }: ProvidersProps) {
  // Initialize React Query client with optimistic defaults
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 2 times
            retry: 2,
            // Refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {/* Auth Provider will be added here */}
        {/* Cart Provider will be added here */}
        {children}
      </ThemeProvider>
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
