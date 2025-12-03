"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Store } from "lucide-react";
import { shopsService } from "@/services/shops.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import { ShopCard } from "@/components/cards/ShopCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import type { ShopCardFE } from "@/types/frontend/shop.types";

export default function FollowingPage() {
  const router = useRouter();
  const {
    data: shops,
    isLoading: loading,
    execute,
  } = useLoadingState<ShopCardFE[]>({ initialData: [] });

  const loadFollowingShops = useCallback(async () => {
    const result = await shopsService.getFollowing();
    return result.shops || [];
  }, []);

  useEffect(() => {
    execute(loadFollowingShops);
  }, [execute, loadFollowingShops]);

  // Safe access to shops array
  const shopsList = shops || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto"
            data-testid="loading-spinner"
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading followed shops...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400 fill-current" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Following</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {shopsList.length > 0
              ? `${shopsList.length} shop${
                  shopsList.length > 1 ? "s" : ""
                } you're following`
              : "Shops you follow will appear here"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {shopsList.length === 0 ? (
          <EmptyState
            icon={<Store className="h-12 w-12 text-gray-400" />}
            title="Not following any shops yet"
            description="Start following your favorite shops to get updates on new products and special offers"
            action={{
              label: "Browse Shops",
              onClick: () => router.push("/shops"),
            }}
          />
        ) : (
          <CardGrid>
            {shopsList.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                slug={shop.slug}
                logo={shop.logo || undefined}
                banner={shop.banner || undefined}
                description={shop.description || undefined}
                rating={shop.rating}
                reviewCount={shop.reviewCount}
                productCount={shop.productCount || 0}
                location={shop.location || undefined}
                isVerified={shop.isVerified}
                featured={shop.featured}
                categories={(shop as any).categories}
                isFollowing={true}
              />
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );
}
