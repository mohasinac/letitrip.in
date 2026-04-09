"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import { updateSiteSettingsAction } from "@/actions";
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
    queryFn: () =>
      apiClient.get<SiteSettingsDocument>(API_ENDPOINTS.SITE_SETTINGS.GET),
  });

  const updateMutation = useMutation<
    SiteSettingsDocument,
    Error,
    Partial<SiteSettingsDocument>
  >({
    mutationFn: (data) =>
      updateSiteSettingsAction(
        data,
      ) as unknown as Promise<SiteSettingsDocument>,
  });

  return { ...query, updateMutation };
}
