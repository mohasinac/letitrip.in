"use client";

import { useMutation } from "@tanstack/react-query";
import {
  listAdminReviewsAction,
  adminUpdateReviewAction,
  adminDeleteReviewAction,
} from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { Review } from "../components";

export function useAdminReviews(sieveParams: string) {
  const query = createAdminListQuery<
    unknown,
    { reviews: Review[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "reviews"],
    sieveParams,
    action: listAdminReviewsAction,
    transform: (result) => ({
      reviews: result.items as unknown as Review[],
      meta: extractBasicMeta(result),
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
