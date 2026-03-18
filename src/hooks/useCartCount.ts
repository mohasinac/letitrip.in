"use client";

import { useAuth } from "@/contexts";
import { useGuestCart } from "./useGuestCart";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";

/**
 * useCartCount
 *
 * Returns the live cart item count for both guest and authenticated users.
 * - Guest: reads from localStorage via useGuestCart
 * - Auth: uses the cached React Query result from GET /api/cart (shared with CartView)
 *
 * @example
 * const cartCount = useCartCount();
 */
export function useCartCount(): number {
  const { user } = useAuth();
  const { count: guestCount } = useGuestCart();
  const { data } = useQuery<{
    itemCount: number;
    cart: unknown;
    subtotal: number;
  } | null>({
    queryKey: ["cart"],
    queryFn: () =>
      apiClient.get<{
        cart: unknown;
        itemCount: number;
        subtotal: number;
      } | null>("/api/cart"),
    enabled: !!user,
  });
  return user ? (data?.itemCount ?? 0) : guestCount;
}
