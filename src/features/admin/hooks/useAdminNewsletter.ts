"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { adminService } from "@/services";
import type { NewsletterSubscriberDocument } from "@/db/schema";

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  sources: Record<string, number>;
}

export interface NewsletterResponse {
  subscribers: NewsletterSubscriberDocument[];
  stats: NewsletterStats;
}

/**
 * useAdminNewsletter
 * Fetches newsletter subscribers filtered by `statusFilter`, plus
 * exposes toggle-status and delete mutations.
 */
export function useAdminNewsletter(statusFilter: string) {
  const params = new URLSearchParams({ pageSize: "200", sorts: "-createdAt" });
  if (statusFilter) params.set("filters", `status==${statusFilter}`);

  const query = useApiQuery<NewsletterResponse>({
    queryKey: ["admin", "newsletter", statusFilter],
    queryFn: () => adminService.listNewsletter(`?${params}`),
  });

  const toggleMutation = useApiMutation<
    unknown,
    { id: string; status: "active" | "unsubscribed" }
  >({
    mutationFn: ({ id, status }) =>
      adminService.updateNewsletterEntry(id, { status }),
  });

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => adminService.deleteNewsletterEntry(id),
  });

  return { ...query, toggleMutation, deleteMutation };
}
