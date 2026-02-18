"use client";

import { useAuth } from "@/hooks";
import {
  Heading,
  Button,
  Spinner,
  ProfileHeader,
  ProfileStatsGrid,
} from "@/components";
import { THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { spacing } = THEME_CONSTANTS;

  // NOTE: Address/order counts require /api/user/addresses and /api/user/orders routes (not yet created)
  // Wire up useApiQuery(API_ENDPOINTS.ADDRESSES.LIST) and API_ENDPOINTS.ORDERS.LIST once routes exist
  const stats = {
    orders: 0,
    wishlist: 0,
    addresses: 0,
  };

  return (
    <div className={spacing.stack}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <Heading level={3}>{UI_LABELS.PROFILE.MY_PROFILE}</Heading>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(ROUTES.USER.SETTINGS)}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          {UI_LABELS.ACTIONS.EDIT_PROFILE}
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
