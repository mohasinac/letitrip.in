"use client";

import { useMutation } from "@tanstack/react-query";
import { adminUpdateReviewAction, adminDeleteReviewAction } from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { Review } from "../components";

export function useAdminReviews(sieveParams: string) {
  const query = createAdminListQuery<
    {
      items: Review[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    },
    { reviews: Review[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "reviews"],
    sieveParams,
    endpoint: "/api/admin/reviews",
    transform: (result) => ({
      reviews: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }),
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
