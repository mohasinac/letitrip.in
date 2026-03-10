"use client";

import { useQuery } from "@tanstack/react-query";
import { siteSettingsService } from "@/services";

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
    queryFn: () => siteSettingsService.get() as Promise<T>,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
