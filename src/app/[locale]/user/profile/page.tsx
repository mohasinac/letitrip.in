"use client";

import { useAuth, useApiQuery } from "@/hooks";
import {
  Heading,
  Button,
  Spinner,
  ProfileHeader,
  ProfileStatsGrid,
} from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { orderService, addressService } from "@/services";

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const tProfile = useTranslations("profile");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");

  const { data: ordersData } = useApiQuery<{ data: { total: number } }>({
    queryKey: ["user-orders-count"],
    queryFn: () => orderService.list(),
    enabled: !!user,
  });

  const { data: addressesData } = useApiQuery<{ data: unknown[] }>({
    queryKey: ["user-addresses-count"],
    queryFn: () => addressService.list(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { spacing } = THEME_CONSTANTS;

  const stats = {
    orders: ordersData?.data?.total ?? 0,
    wishlist: 0,
    addresses: Array.isArray(addressesData?.data)
      ? addressesData.data.length
      : 0,
  };

  return (
    <div className={spacing.stack}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
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
