"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { reviewService } from "@/services";
import type { Review } from "../components";

interface ReviewListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * useAdminReviews
 * Accepts a pre-built sieve params string and fetches the admin reviews list.
 * Exposes update-status and delete mutations.
 */
export function useAdminReviews(sieveParams: string) {
  const query = useApiQuery<{ reviews: Review[]; meta: ReviewListMeta }>({
    queryKey: ["admin", "reviews", sieveParams],
    queryFn: () => reviewService.listAdmin(sieveParams),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data }) => reviewService.update(id, data),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => reviewService.delete(id),
  });

  return { ...query, updateMutation, deleteMutation };
}
