"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
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
  const query = useQuery<{
    coupons: CouponDocument[];
    meta: CouponListMeta;
  }>({
    queryKey: ["admin", "coupons", sieveParams],
    queryFn: () => couponService.list(sieveParams),
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (payload) => couponService.create(payload),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data: update }) => couponService.update(id, update),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => couponService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
