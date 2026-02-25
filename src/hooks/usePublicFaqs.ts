"use client";

import { useApiQuery } from "./useApiQuery";
import { faqService } from "@/services";
import type { FAQDocument } from "@/db/schema";

/**
 * usePublicFaqs
 * Fetches public FAQs for homepage/public FAQ sections.
 * Optionally filter by category and limit results.
 *
 * @param category - FAQ category key (e.g. "general", "shipping", "returns")
 * @param limit    - Maximum number of FAQs to return (default: 6)
 */
export function usePublicFaqs(category?: string, limit = 6) {
  return useApiQuery<FAQDocument[]>({
    queryKey: ["faqs", "homepage", category ?? "all", String(limit)],
    queryFn: () => faqService.listPublic(category, limit),
    cacheTTL: 10 * 60 * 1000, // 10 minutes
  });
}
