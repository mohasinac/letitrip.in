/**
 * User RipCoins Purchase Page
 *
 * Route: /user/ripcoins/purchase
 * Dedicated page to purchase fixed RipCoin packages.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks";
import { Spinner } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { RipCoinsPurchaseView } from "@/features/user";

const { flex, page } = THEME_CONSTANTS;

export default function UserRipCoinsPurchasePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={`${flex.hCenter} ${page.empty}`}>
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return <RipCoinsPurchaseView />;
}
