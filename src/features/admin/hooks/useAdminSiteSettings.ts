"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { getSiteSettingsAction, updateSiteSettingsAction } from "@/actions";
import type { SiteSettingsDocument } from "@/db/schema";

export function useAdminSiteSettings() {
  const query = useQuery<SiteSettingsDocument>({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettingsAction() as Promise<SiteSettingsDocument>,
  });

  const updateMutation = useMutation<any, Error, Partial<SiteSettingsDocument>>(
    {
      mutationFn: (data) => updateSiteSettingsAction(data),
    },
  );

  return { ...query, updateMutation };
}
