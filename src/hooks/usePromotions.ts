"use client";

import { useQuery } from "@tanstack/react-query";
import { promotionsService } from "@/services";
import type { ProductDocument, CouponDocument } from "@/db/schema";

interface PromotionsData {
  promotedProducts: ProductDocument[];
  featuredProducts: ProductDocument[];
  activeCoupons: CouponDocument[];
}

/**
 * usePromotions
 * Wraps `promotionsService.list()` for the promotions page.
 */
export function usePromotions() {
  const { data, isLoading, error, refetch } = useQuery<PromotionsData>({
    queryKey: ["promotions"],
    queryFn: () => promotionsService.list(),
  });

  return {
    data,
    promotedProducts: data?.promotedProducts ?? [],
    featuredProducts: data?.featuredProducts ?? [],
    activeCoupons: data?.activeCoupons ?? [],
    isLoading,
    error,
    refetch,
  };
}
