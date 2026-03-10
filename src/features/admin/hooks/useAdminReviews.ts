"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
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
  const query = useQuery<{ reviews: Review[]; meta: ReviewListMeta }>({
    queryKey: ["admin", "reviews", sieveParams],
    queryFn: () => reviewService.listAdmin(sieveParams),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => reviewService.update(id, data),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => reviewService.delete(id),
  });

  return { ...query, updateMutation, deleteMutation };
}
