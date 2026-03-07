"use client";

import { useAuth } from "@/contexts";
import { useGuestCart } from "./useGuestCart";
import { useApiQuery } from "./useApiQuery";
import { cartService } from "@/services";

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
  const { data } = useApiQuery<{
    itemCount: number;
    cart: unknown;
    subtotal: number;
  }>({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
    enabled: !!user,
  });
  return user ? (data?.itemCount ?? 0) : guestCount;
}
