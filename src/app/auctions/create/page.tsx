"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import AuctionForm from "@/components/seller/AuctionForm";
import { auctionsService } from "@/services/auctions.service";
import { shopsService } from "@/services/shops.service";
import { productsService } from "@/services/products.service";
import type { ProductAuctionFormFE } from "@/types/frontend/auction.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { ProductFormFE } from "@/types/frontend/product.types";
import {
  ProductStatus,
  ProductCondition,
  ShippingClass,
  AuctionType,
} from "@/types/shared/common.types";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

function CreateAuctionContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [shops, setShops] = useState<ShopCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's shops
  useEffect(() => {
    const loadShops = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // For now, we'll assume the user has access to create auctions
        // In a real app, you'd filter shops where user is owner/admin
        const shopsData = await shopsService.list({ limit: 50 });
        setShops(shopsData.data);
      } catch (error) {
        console.error("Failed to load shops:", error);
        setError("Failed to load your shops. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, [user]);

  const handleSubmit = async (formData: ProductAuctionFormFE) => {
    if (!user) {
      setError("You must be logged in to create an auction");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // First, create the product
      const productData: ProductFormFE = {
        name: formData.name,
        slug: formData.slug,
        sku: `${formData.slug}-${Date.now()}`, // Generate a unique SKU
        categoryId: "default", // TODO: Add category selection to form
        brand: "",
        price: formData.startingBid,
        compareAtPrice: null,
        stockCount: 1, // Auctions typically have 1 item
        lowStockThreshold: 0,
        weight: null,
        description: formData.description,
        condition: ProductCondition.NEW,
        features: [],
        specifications: {},
        images: formData.images,
        videos: formData.videos,
        shippingClass: ShippingClass.STANDARD,
        returnPolicy: "",
        warrantyInfo: "",
        metaTitle: formData.name,
        metaDescription: formData.description.substring(0, 160),
        featured: false,
        status: ProductStatus.PUBLISHED,
        shopId: formData.shopId || undefined,
      };

      const product = await productsService.create(productData);

      // Then, create the auction
      const auctionData = {
        productId: product.id,
        type: AuctionType.REGULAR, // Default to regular auction
        startingPrice: formData.startingBid,
        reservePrice: formData.reservePrice || undefined,
        buyNowPrice: undefined, // No buy now for basic auctions
        startTime: formData.startTime,
        endTime: formData.endTime,
        autoExtend: false, // Default to no auto-extend
        extensionMinutes: 0,
        minBidIncrement: 100, // Default increment
        status: formData.status,
      };

      const auction = await auctionsService.create(auctionData);
      router.push(`/auctions/${auction.productSlug}`);
    } catch (error: any) {
      console.error("Failed to create auction:", error);
      setError(error.message || "Failed to create auction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            You must be logged in to create an auction.
          </p>
          <Link
            href="/login?redirect=/auctions/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Shops
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => globalThis.location?.reload()}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Shops Found
          </h2>
          <p className="text-gray-600 mb-4">
            You need to create a shop before you can create auctions.
          </p>
          <Link
            href="/shops/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Shop
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/seller"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Auction
          </h1>
          <p className="text-gray-600 mt-2">
            Set up your auction details and start selling your items.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Auction Form */}
        <Card className="p-6">
          <AuctionForm
            mode="create"
            shopId={shops[0]?.id} // Default to first shop, user can change
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </Card>
      </div>
    </div>
  );
}

export default function CreateAuctionPage() {
  return (
    <ErrorBoundary>
      <CreateAuctionContent />
    </ErrorBoundary>
  );
}
