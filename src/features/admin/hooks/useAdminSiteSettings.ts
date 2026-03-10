"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { siteSettingsService } from "@/services";
import type { SiteSettingsDocument } from "@/db/schema";

export function useAdminSiteSettings() {
  const query = useQuery<SiteSettingsDocument>({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsService.get(),
  });

  const updateMutation = useMutation<any, Error, Partial<SiteSettingsDocument>>(
    {
      mutationFn: (data) => siteSettingsService.update(data),
    },
  );

  return { ...query, updateMutation };
}
