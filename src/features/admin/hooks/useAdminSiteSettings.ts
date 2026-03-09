"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { siteSettingsService } from "@/services";
import type { SiteSettingsDocument } from "@/db/schema";

export function useAdminSiteSettings() {
  const query = useApiQuery<SiteSettingsDocument>({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsService.get(),
  });

  const updateMutation = useApiMutation<any, Partial<SiteSettingsDocument>>({
    mutationFn: (data) => siteSettingsService.update(data),
  });

  return { ...query, updateMutation };
}
