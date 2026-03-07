"use client";

import { useGuestCartMerge } from "@/hooks";

/**
 * GuestCartMergerEffect
 *
 * Renders nothing — mounts `useGuestCartMerge` which watches for login
 * transitions and automatically merges localStorage guest cart items into
 * the authenticated user's server cart.
 *
 * Must be mounted inside `SessionProvider`.
 */
export function GuestCartMergerEffect() {
  useGuestCartMerge();
  return null;
}
