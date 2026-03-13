"use client";

import { useQuery } from "@tanstack/react-query";
import { listHomepageSectionsAction } from "@/actions";
import type { HomepageSectionDocument } from "@/db/schema";

/**
 * useHomepageSections
 * Fetches homepage sections, optionally filtered by type or other params.
 * Used by WelcomeSection, WhatsAppCommunitySection, AdvertisementBanner, etc.
 *
 * @param params - Optional query params string (e.g. "type=welcome&enabled=true")
 *
 * @example
 * const { data } = useHomepageSections("type=welcome&enabled=true");
 */
export function useHomepageSections(params?: string) {
  return useQuery<HomepageSectionDocument[]>({
    queryKey: ["homepage-sections", params ?? ""],
    queryFn: async () => {
      const sp = params ? new URLSearchParams(params) : null;
      const result = await listHomepageSectionsAction(
        sp
          ? {
              filters: sp.get("filters") ?? undefined,
              sorts: sp.get("sorts") ?? undefined,
              page: sp.has("page") ? Number(sp.get("page")) : undefined,
              pageSize: sp.has("pageSize")
                ? Number(sp.get("pageSize"))
                : undefined,
            }
          : undefined,
      );
      return result.items;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
