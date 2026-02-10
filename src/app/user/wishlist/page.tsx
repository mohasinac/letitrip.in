"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks";
import { Heading, Spinner, EmptyState } from "@/components";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";

export default function UserWishlistPage() {
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

  const heartIcon = (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <Heading level={3}>{UI_LABELS.USER.WISHLIST.TITLE}</Heading>

      <EmptyState
        icon={heartIcon}
        title={UI_LABELS.USER.WISHLIST.EMPTY}
        description={UI_LABELS.USER.WISHLIST.EMPTY_SUBTITLE}
        actionLabel={UI_LABELS.USER.ORDERS.BROWSE_PRODUCTS}
        onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
      />
    </div>
  );
}
