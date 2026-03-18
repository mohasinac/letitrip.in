"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";

/**
 * useSiteSettings
 * Fetches global site settings (theme, background config, contact info, etc.).
 * Cached for 10 minutes since site settings rarely change.
 *
 * @example
 * const { data: settings } = useSiteSettings<{ backgroundConfig: BackgroundConfig }>();
 */
export function useSiteSettings<T = unknown>() {
  return useQuery<T>({
    queryKey: ["site-settings"],
    queryFn: () => apiClient.get<T>("/api/site-settings"),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
