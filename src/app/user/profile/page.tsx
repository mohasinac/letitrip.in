"use client";

import { useAuth } from "@/hooks";
import { Card, Heading, Text, Button, AvatarDisplay } from "@/components";
import UserTabs from "@/components/user/UserTabs";
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
        <Text>{UI_LABELS.LOADING.DEFAULT}</Text>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
      <UserTabs />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Heading level={3}>{UI_LABELS.PROFILE.MY_PROFILE}</Heading>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(ROUTES.USER.SETTINGS)}
          >
            {UI_LABELS.ACTIONS.EDIT_PROFILE}
          </Button>
        </div>

        {/* Profile Information Card */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className={`
                ring-2
                ${
                  user.role === "admin"
                    ? "ring-red-500"
                    : user.role === "moderator" || user.role === "seller"
                      ? "ring-yellow-500"
                      : "ring-green-500"
                }
                rounded-full
              `}
              >
                <AvatarDisplay
                  cropData={
                    user.avatarMetadata ||
                    (user.photoURL
                      ? {
                          url: user.photoURL,
                          position: { x: 50, y: 50 },
                          zoom: 1,
                        }
                      : null)
                  }
                  size="xl"
                  alt={user.displayName || "User"}
                  displayName={user.displayName}
                  email={user.email}
                />
              </div>
            </div>

            {/* User Details */}
            <div className={`flex-1 ${THEME_CONSTANTS.spacing.stack}`}>
              <div>
                <Text
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
                >
                  {UI_LABELS.FORM.DISPLAY_NAME}
                </Text>
                <Text className="text-lg font-medium">
                  {user.displayName || UI_LABELS.EMPTY.NOT_SET}
                </Text>
              </div>

              <div>
                <Text
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
                >
                  {UI_LABELS.FORM.EMAIL}
                </Text>
                <div className="flex items-center gap-2">
                  <Text className="text-lg">{user.email}</Text>
                  {user.emailVerified && (
                    <span className="text-green-500 text-sm">
                      {UI_LABELS.STATUS.VERIFIED}
                    </span>
                  )}
                </div>
              </div>

              {user.phoneNumber && (
                <div>
                  <Text
                    className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
                  >
                    {UI_LABELS.FORM.PHONE}
                  </Text>
                  <div className="flex items-center gap-2">
                    <Text className="text-lg">{user.phoneNumber}</Text>
                    {user.phoneVerified && (
                      <span className="text-green-500 text-sm">
                        {UI_LABELS.STATUS.VERIFIED}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Text
                  className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
                >
                  {UI_LABELS.PROFILE.ACCOUNT_ROLE}
                </Text>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : user.role === "moderator"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : user.role === "seller"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  }`}
                >
                  {user.role || "user"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <Text className={`${THEME_CONSTANTS.typography.h3} font-bold mb-2`}>
              0
            </Text>
            <Text className={THEME_CONSTANTS.themed.textSecondary}>
              {UI_LABELS.PROFILE.TOTAL_ORDERS}
            </Text>
          </Card>
          <Card className="p-6 text-center">
            <Text className={`${THEME_CONSTANTS.typography.h3} font-bold mb-2`}>
              0
            </Text>
            <Text className={THEME_CONSTANTS.themed.textSecondary}>
              {UI_LABELS.WISHLIST.ITEMS_COUNT}
            </Text>
          </Card>
          <Card className="p-6 text-center">
            <Text className={`${THEME_CONSTANTS.typography.h3} font-bold mb-2`}>
              0
            </Text>
            <Text className={THEME_CONSTANTS.themed.textSecondary}>
              {UI_LABELS.PROFILE.SAVED_ADDRESSES}
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
