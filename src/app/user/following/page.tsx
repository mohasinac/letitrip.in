"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, Store } from "lucide-react";
import { shopsService } from "@/services/shops.service";
import { ShopCard } from "@/components/cards/ShopCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import type { Shop } from "@/types";

export default function FollowingPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowingShops();
  }, []);

  const loadFollowingShops = async () => {
    try {
      setLoading(true);
      const result = await shopsService.getFollowing();
      setShops(result.shops || []);
    } catch (error) {
      console.error("Failed to load following shops:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">
            Loading followed shops...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-blue-600 fill-current" />
            <h1 className="text-2xl font-bold text-gray-900">Following</h1>
          </div>
          <p className="text-gray-600">
            {shops.length > 0
              ? `${shops.length} shop${
                  shops.length > 1 ? "s" : ""
                } you're following`
              : "Shops you follow will appear here"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {shops.length === 0 ? (
          <EmptyState
            icon={<Store className="h-12 w-12 text-gray-400" />}
            title="Not following any shops yet"
            description="Start following your favorite shops to get updates on new products and special offers"
            action={{
              label: "Browse Shops",
              onClick: () => (window.location.href = "/shops"),
            }}
          />
        ) : (
          <CardGrid>
            {shops.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                slug={shop.slug}
                logo={shop.logo}
                banner={shop.banner}
                description={shop.description}
                rating={shop.rating}
                reviewCount={shop.reviewCount}
                productCount={shop.productCount || 0}
                location={shop.location}
                isVerified={shop.isVerified}
                isFeatured={shop.isFeatured}
                categories={shop.categories}
                isFollowing={true}
              />
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );
}
