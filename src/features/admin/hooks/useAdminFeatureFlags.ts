"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { siteSettingsService } from "@/services";
import type { SiteSettingsDocument } from "@/db/schema";

/**
 * useAdminFeatureFlags
 *
 * Fetches site settings and exposes feature flags + payment method toggles
 * with a single update mutation that patches the site-settings singleton.
 */
export function useAdminFeatureFlags() {
  const query = useQuery<SiteSettingsDocument>({
    queryKey: ["site-settings", "feature-flags"],
    queryFn: () => siteSettingsService.get(),
  });

  const updateMutation = useMutation<
    SiteSettingsDocument,
    Error,
    Partial<SiteSettingsDocument>
  >({
    mutationFn: (data) => siteSettingsService.update(data),
  });

  return { ...query, updateMutation };
}
