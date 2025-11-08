"use client";

import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { apiService } from "@/services/api.service";
import { ProductCard } from "@/components/cards/ProductCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = (await apiService.get("/api/favorites")) as {
        favorites: any[];
      };
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removingId) return;

    try {
      await apiService.delete(`/api/favorites/${removingId}`);
      setFavorites(favorites.filter((f) => f.id !== removingId));
      setRemovingId(null);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      alert("Failed to remove from favorites");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-600 mt-2">
            {favorites.length} {favorites.length === 1 ? "item" : "items"} in
            your wishlist
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div>
            <CardGrid>
              {favorites.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.sale_price || product.price}
                    originalPrice={product.original_price}
                    image={product.images?.[0] || "/placeholder.jpg"}
                    rating={product.rating}
                    reviewCount={product.review_count}
                    shopName={product.shop_name || "Unknown Shop"}
                    shopSlug={product.shop_slug || "#"}
                    inStock={product.stock > 0}
                    isFeatured={product.is_featured}
                    condition={product.condition}
                    isFavorite={true}
                    onToggleFavorite={() => setRemovingId(product.id)}
                  />
                </div>
              ))}
            </CardGrid>
          </div>
        ) : (
          <EmptyState
            title="Your wishlist is empty"
            description="Start adding products to your wishlist to save them for later"
            action={{
              label: "Browse Products",
              onClick: () => (window.location.href = "/products"),
            }}
          />
        )}

        {/* Remove Confirmation */}
        {removingId && (
          <ConfirmDialog
            isOpen={true}
            title="Remove from Favorites"
            description="Are you sure you want to remove this product from your favorites?"
            confirmLabel="Remove"
            variant="danger"
            onConfirm={handleRemove}
            onClose={() => setRemovingId(null)}
          />
        )}
      </div>
    </div>
  );
}
