/**
 * User RipCoins Page
 *
 * Route: /user/ripcoins
 * Displays RipCoin wallet balance, purchase flow, and transaction history.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { Spinner } from "@/components";
import { ROUTES } from "@/constants";
import { RipCoinsWallet } from "@/features/user";

export default function UserRipCoinsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return <RipCoinsWallet />;
}
