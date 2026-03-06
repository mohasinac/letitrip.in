"use client";

import { useAuth } from "@/hooks";
import { useProfileStats } from "@/hooks";
import { Heading, Button, Spinner, ProfileHeader, ProfileStatsGrid } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const tProfile = useTranslations("profile");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");

  const { orderCount, addressCount } = useProfileStats(!!user);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  const { spacing, flex } = THEME_CONSTANTS;

  if (loading) {
    return (
      <div className={`${flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = {
    orders: orderCount,
    wishlist: 0,
    addresses: addressCount,
  };

  return (
    <div className={spacing.stack}>
      {/* Header with Edit Button */}
      <div className={flex.between}>
        <Heading level={3}>{tProfile("myProfile")}</Heading>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(ROUTES.USER.SETTINGS)}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          {tActions("editProfile")}
        </Button>
      </div>

      {/* Profile Hero Section */}
      <ProfileHeader
        photoURL={user.photoURL || undefined}
        displayName={user.displayName || user.email || "User"}
        email={user.email || ""}
        role={user.role || "user"}
      />

      {/* Stats Grid */}
      <ProfileStatsGrid stats={stats} />
    </div>
  );
}
