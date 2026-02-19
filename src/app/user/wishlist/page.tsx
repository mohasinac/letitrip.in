/**
 * User Wishlist Page
 *
 * Route: /user/wishlist
 * Displays the authenticated user's saved products.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useApiQuery } from "@/hooks";
import { Spinner, EmptyState, ProductGrid, WishlistButton } from "@/components";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";

const { themed, typography, spacing } = THEME_CONSTANTS;

interface WishlistItem {
  productId: string;
  addedAt: string;
  product: ProductDocument | null;
}

interface WishlistResponse {
  data: { items: WishlistItem[]; meta: { total: number } };
}

export default function UserWishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useApiQuery<WishlistResponse>({
    queryKey: ["user", "wishlist"],
    queryFn: () =>
      fetch(API_ENDPOINTS.USER.WISHLIST.LIST).then((r) => r.json()),
    enabled: !!user,
  });

  const items = data?.data?.items ?? [];
  const products = items
    .map((item) => item.product)
    .filter((p): p is ProductDocument => p !== null);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
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
    <div className={spacing.stack}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${typography.h3} ${themed.textPrimary}`}>
            {UI_LABELS.USER.WISHLIST.TITLE}
          </h1>
          <p className={`mt-0.5 text-sm ${themed.textSecondary}`}>
            {UI_LABELS.USER.WISHLIST.SUBTITLE}
          </p>
        </div>
        {items.length > 0 && (
          <span className={`text-sm ${themed.textSecondary}`}>
            {UI_LABELS.USER.WISHLIST.ITEMS}: {items.length}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={heartIcon}
          title={UI_LABELS.USER.WISHLIST.EMPTY}
          description={UI_LABELS.USER.WISHLIST.EMPTY_SUBTITLE}
          actionLabel={UI_LABELS.USER.ORDERS.BROWSE_PRODUCTS}
          onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
        />
      ) : (
        <div className="relative">
          <ProductGrid products={products} />
          {/* Wishlist remove buttons overlaid on each card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 absolute inset-0 pointer-events-none">
            {items.map((item) =>
              item.product ? (
                <div key={item.productId} className="relative">
                  <div className="absolute top-2 right-2 pointer-events-auto z-10">
                    <WishlistButton
                      productId={item.productId}
                      initialInWishlist={true}
                    />
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
