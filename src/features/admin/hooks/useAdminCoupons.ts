"use client";

import { useMutation } from "@tanstack/react-query";
import {
  listAdminCouponsAction,
  adminCreateCouponAction,
  adminUpdateCouponAction,
  adminDeleteCouponAction,
} from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { CouponDocument } from "@/db/schema";

export function useAdminCoupons(sieveParams: string) {
  const query = createAdminListQuery<
    CouponDocument,
    { coupons: CouponDocument[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "coupons"],
    sieveParams,
    action: listAdminCouponsAction,
    transform: (result) => ({
      coupons: result.items,
      meta: extractBasicMeta(result),
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
