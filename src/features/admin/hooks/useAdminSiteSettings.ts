"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { updateSiteSettingsAction } from "@/actions";
import type { SiteSettingsDocument } from "@/db/schema";

export function useAdminSiteSettings() {
  const query = useQuery<SiteSettingsDocument>({
    queryKey: ["site-settings"],
    queryFn: () => apiClient.get<SiteSettingsDocument>("/api/site-settings"),
  });

  const updateMutation = useMutation<any, Error, Partial<SiteSettingsDocument>>(
    {
      mutationFn: (data) => updateSiteSettingsAction(data),
    },
  );

  return { ...query, updateMutation };
}
