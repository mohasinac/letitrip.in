"use client";

import { useGuestCartMerge } from "@mohasinac/appkit/features/cart";
import { useAuth } from "@/contexts";
import { useRouter } from "@/i18n/navigation";

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
  const { user } = useAuth();
  const router = useRouter();

  useGuestCartMerge({
    userId: user?.uid,
    onNavigate: (url) => router.push(url),
  });
  return null;
}

