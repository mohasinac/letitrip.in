"use client";

import { useApiQuery } from "./useApiQuery";
import { homepageSectionsService } from "@/services";
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
  return useApiQuery<HomepageSectionDocument[]>({
    queryKey: ["homepage-sections", params ?? ""],
    queryFn: () => homepageSectionsService.list(params),
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
}
