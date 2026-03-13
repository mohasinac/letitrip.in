"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listAdminCouponsAction,
  adminCreateCouponAction,
  adminUpdateCouponAction,
  adminDeleteCouponAction,
} from "@/actions";
import type { CouponDocument } from "@/db/schema";

interface CouponListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * useAdminCoupons
 * Accepts a pre-built sieve params string and fetches the coupons list.
 * Exposes create, update, and delete mutations.
 */
export function useAdminCoupons(sieveParams: string) {
  const query = useQuery<{
    coupons: CouponDocument[];
    meta: CouponListMeta;
  }>({
    queryKey: ["admin", "coupons", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      const result = await listAdminCouponsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        coupons: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      };
    },
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
