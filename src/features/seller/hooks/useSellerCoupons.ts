"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSellerCouponsAction,
  sellerDeleteCouponAction,
  sellerUpdateCouponAction,
} from "@/actions";
import { nowISO } from "@/utils";
import type { CouponDocument } from "@/db/schema";

export interface SellerCouponsResponse {
  coupons: CouponDocument[];
  total: number;
}

/**
 * useSellerCoupons
 * Fetches the authenticated seller's own coupons.
 */
export function useSellerCoupons(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery<SellerCouponsResponse>({
    queryKey: ["seller-coupons"],
    queryFn: async () => {
      const items = await listSellerCouponsAction();
      return { coupons: items, total: items.length };
    },
    enabled,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      sellerUpdateCouponAction(id, {
        validity: { isActive, startDate: nowISO() },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-coupons"] });
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: string) => sellerDeleteCouponAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-coupons"] });
    },
  });

  return {
    coupons: query.data?.coupons ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    toggleActive,
    deleteCoupon,
  };
}
