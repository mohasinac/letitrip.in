"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listAdminReviewsAction,
  adminUpdateReviewAction,
  adminDeleteReviewAction,
} from "@/actions";
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
 * Exposes update-status and delete mutations (via Server Actions).
 */
export function useAdminReviews(sieveParams: string) {
  const query = useQuery<{ reviews: Review[]; meta: ReviewListMeta }>({
    queryKey: ["admin", "reviews", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      const result = await listAdminReviewsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        reviews: result.items as unknown as Review[],
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      };
    },
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      adminUpdateReviewAction(
        id,
        data as Parameters<typeof adminUpdateReviewAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => adminDeleteReviewAction(id),
  });

  return { ...query, updateMutation, deleteMutation };
}
