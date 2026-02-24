"use client";

import { useAuth, useApiQuery } from "@/hooks";
import {
  Heading,
  Button,
  Spinner,
  ProfileHeader,
  ProfileStatsGrid,
} from "@/components";
import { THEME_CONSTANTS, UI_LABELS, ROUTES, API_ENDPOINTS } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { data: ordersData } = useApiQuery<{ data: { total: number } }>({
    queryKey: ["user-orders-count"],
    queryFn: () => apiClient.get(API_ENDPOINTS.ORDERS.LIST),
    enabled: !!user,
  });

  const { data: addressesData } = useApiQuery<{ data: unknown[] }>({
    queryKey: ["user-addresses-count"],
    queryFn: () => apiClient.get(API_ENDPOINTS.ADDRESSES.LIST),
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
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
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
