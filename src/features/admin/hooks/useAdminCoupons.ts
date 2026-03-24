"use client";

import { useMutation } from "@tanstack/react-query";
import {
  adminCreateCouponAction,
  adminUpdateCouponAction,
  adminDeleteCouponAction,
} from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { CouponDocument } from "@/db/schema";

export function useAdminCoupons(sieveParams: string) {
  const query = createAdminListQuery<
    {
      items: CouponDocument[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    },
    { coupons: CouponDocument[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "coupons"],
    sieveParams,
    endpoint: "/api/admin/coupons",
    transform: (result) => ({
      coupons: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }),
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (payload) =>
      adminCreateCouponAction(
        payload as Parameters<typeof adminCreateCouponAction>[0],
      ),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data: update }) =>
      adminUpdateCouponAction(
        id,
        update as Parameters<typeof adminUpdateCouponAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => adminDeleteCouponAction(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
