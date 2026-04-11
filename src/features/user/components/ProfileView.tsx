"use client";

import { Spinner, Button } from "@mohasinac/appkit/ui";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useProfileStats } from "@/hooks";

import { ProfileView as AppkitProfileView } from "@mohasinac/appkit/features/account";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStatsGrid } from "./ProfileStatsGrid";

export function ProfileView() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("profile");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const { orderCount, addressCount } = useProfileStats(!!user);

  useEffect(() => {
    if (!loading && !user) router.push(ROUTES.AUTH.LOGIN);
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }
  if (!user) return null;

  const stats = { orders: orderCount, wishlist: 0, addresses: addressCount };

  return (
    <AppkitProfileView
      renderHeader={() => (
        <div className={THEME_CONSTANTS.flex.between}>
          <ProfileHeader
            photoURL={user.photoURL || undefined}
            displayName={user.displayName || user.email || "User"}
            email={user.email || ""}
            role={user.role || "user"}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(ROUTES.USER.SETTINGS)}
          >
            {tActions("editProfile")}
          </Button>
        </div>
      )}
      renderStats={() => <ProfileStatsGrid stats={stats} />}
    />
  );
}
