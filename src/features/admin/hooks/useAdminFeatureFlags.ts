"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { siteSettingsService } from "@/services";
import type { SiteSettingsDocument } from "@/db/schema";

/**
 * useAdminFeatureFlags
 *
 * Fetches site settings and exposes feature flags + payment method toggles
 * with a single update mutation that patches the site-settings singleton.
 */
export function useAdminFeatureFlags() {
  const query = useApiQuery<SiteSettingsDocument>({
    queryKey: ["site-settings", "feature-flags"],
    queryFn: () => siteSettingsService.get(),
  });

  const updateMutation = useApiMutation<
    SiteSettingsDocument,
    Partial<SiteSettingsDocument>
  >({
    mutationFn: (data) => siteSettingsService.update(data),
  });

  return { ...query, updateMutation };
}
