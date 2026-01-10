"use client";

/**
 * React Query Provider Component
 * 
 * Wraps the application with React Query's QueryClientProvider
 * and adds devtools in development mode.
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import { ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Query Provider Component
 * 
 * Provides React Query context to the application.
 * Must be used in client components only.
 * 
 * @example
 * // In app layout or client component
 * <QueryProvider>
 *   <YourApp />
 * </QueryProvider>
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools in development only */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
