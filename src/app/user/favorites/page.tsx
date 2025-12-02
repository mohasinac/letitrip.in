"use client";

import { useState, useEffect } from "react";
import { Heart, Package, Store, Folder, Gavel, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Price } from "@/components/common/values";
import Link from "next/link";
import Image from "next/image";

type FavoriteType = "product" | "shop" | "category" | "auction";

interface FavoriteItem {
  id: string;
  name?: string;
  title?: string;
  image?: string;
  images?: string[];
  price?: number;
  favorited_at: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FavoriteType>("product");
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, activeTab]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/favorites/list/${activeTab}`);
      if (!response.ok) throw new Error("Failed to fetch favorites");

      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      console.error("Fetch favorites error:", err);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/favorites/${activeTab}/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove");

      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Remove favorite error:", err);
    }
  };

  const tabs = [
    { type: "product" as FavoriteType, label: "Products", icon: Package },
    { type: "shop" as FavoriteType, label: "Shops", icon: Store },
    { type: "category" as FavoriteType, label: "Categories", icon: Folder },
    { type: "auction" as FavoriteType, label: "Auctions", icon: Gavel },
  ];

  const getItemLink = (item: FavoriteItem) => {
    switch (activeTab) {
      case "product":
        return `/products/${item.id}`;
      case "shop":
        return `/shops/${item.id}`;
      case "category":
        return `/categories/${item.id}`;
      case "auction":
        return `/auctions/${item.id}`;
      default:
        return "#";
    }
  };

  const getItemImage = (item: FavoriteItem) => {
    return item.image || item.images?.[0] || "/placeholder-image.png";
  };

  const getItemName = (item: FavoriteItem) => {
    return item.name || item.title || "Untitled";
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">
          {/* TODO: Replace with constant */}
          Sign in to view favorites
        </h2>
        <p className="text-gray-600 mb-6">
          {/* TODO: Replace with constant */}
          Save your favorite items and access them anytime
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          {/* TODO: Replace with constant */}
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {/* TODO: Replace with constant */}
          My Favorites
        </h1>
        <p className="text-gray-600">
          {/* TODO: Replace with constant */}
          All your favorite items in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;

            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`
                  flex items-center gap-2 pb-4 border-b-2 transition-colors
                  ${
                    isActive
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">
            {/* TODO: Replace with constant */}
            No favorites yet
          </h3>
          <p className="text-gray-600 mb-6">
            {/* TODO: Replace with constant */}
            Start adding your favorite {activeTab}s to see them here
          </p>
          <Link
            href={activeTab === "product" ? "/products" : `/${activeTab}s`}
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            {/* TODO: Replace with constant */}
            Browse {tabs.find((t) => t.type === activeTab)?.label}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={getItemLink(item)} className="block">
                <div className="relative aspect-square">
                  <Image
                    src={getItemImage(item)}
                    alt={getItemName(item)}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link href={getItemLink(item)}>
                  <h3 className="font-semibold mb-2 hover:text-primary line-clamp-2">
                    {getItemName(item)}
                  </h3>
                </Link>

                {item.price && (
                  <p className="text-lg font-bold text-primary mb-3">
                    <Price amount={item.price} />
                  </p>
                )}

                <button
                  onClick={() => handleRemove(item.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Heart className="h-4 w-4 fill-red-500" />
                  {/* TODO: Replace with constant */}
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// TODO: Replace hardcoded strings with constants from site constants
// Texts to consider: "Sign in to view favorites", "Save your favorite items and access them anytime", "Sign In", "My Favorites", "All your favorite items in one place", "No favorites yet", "Start adding your favorite {activeTab}s to see them here", "Browse {label}", "Remove"
// Also, consider creating a favorites service instead of direct fetch calls
