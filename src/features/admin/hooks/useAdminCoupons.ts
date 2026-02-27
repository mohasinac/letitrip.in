"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { couponService } from "@/services";
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
  const query = useApiQuery<{
    coupons: CouponDocument[];
    meta: CouponListMeta;
  }>({
    queryKey: ["admin", "coupons", sieveParams],
    queryFn: () => couponService.list(sieveParams),
  });

  const createMutation = useApiMutation<unknown, unknown>({
    mutationFn: (payload) => couponService.create(payload),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data: update }) => couponService.update(id, update),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => couponService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
