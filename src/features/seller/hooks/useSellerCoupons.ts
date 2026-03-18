"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { sellerDeleteCouponAction, sellerUpdateCouponAction } from "@/actions";
import { nowISO } from "@/utils";
import type { CouponDocument } from "@/db/schema";

export interface SellerCouponsResponse {
  coupons: CouponDocument[];
  total: number;
}

/**
 * useSellerCoupons
 * Fetches the authenticated seller's own coupons via GET /api/seller/coupons.
 */
export function useSellerCoupons(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery<SellerCouponsResponse>({
    queryKey: ["seller-coupons"],
    queryFn: () => apiClient.get<SellerCouponsResponse>("/api/seller/coupons"),
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
