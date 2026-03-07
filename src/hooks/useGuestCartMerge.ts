"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts";
import {
  getGuestCartItems,
  clearGuestCart,
  getGuestReturnTo,
  clearGuestReturnTo,
} from "@/utils";
import { cartService } from "@/services";
import { logger } from "@/classes";

/**
 * useGuestCartMerge
 *
 * Detects login events (uid: null → uid) and:
 * 1. Merges any items stored in the guest localStorage cart into the
 *    authenticated user's server cart via POST /api/cart/merge.
 * 2. If a `guestReturnTo` URL was saved (e.g. /checkout), navigates there
 *    after a successful merge — enabling the "add → login → checkout" flow.
 *
 * Must be mounted exactly once inside `SessionProvider` (via GuestCartMergerEffect).
 */
export function useGuestCartMerge(): void {
  const { user } = useAuth();
  const router = useRouter();
  const prevUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      prevUidRef.current = null;
      return;
    }

    // Only run once per login transition (uid changes from null → non-null)
    if (prevUidRef.current === user.uid) return;
    prevUidRef.current = user.uid;

    const items = getGuestCartItems();
    const returnTo = getGuestReturnTo();

    // No items to merge — just handle the returnTo if set
    if (items.length === 0) {
      if (returnTo) {
        clearGuestReturnTo();
        router.push(returnTo);
      }
      return;
    }

    cartService
      .mergeGuestCart(items)
      .then(() => {
        clearGuestCart();
        logger.debug("Guest cart merged successfully", { count: items.length });
        if (returnTo) {
          clearGuestReturnTo();
          router.push(returnTo);
        }
      })
      .catch((err) => {
        // Non-fatal: items remain in localStorage and will retry on next login
        logger.warn("Guest cart merge failed — items preserved", {
          error: err,
        });
        // Clear returnTo to avoid a stuck redirect loop on every login
        if (returnTo) clearGuestReturnTo();
      });
  }, [user, router]);
}
