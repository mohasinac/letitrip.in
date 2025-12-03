"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { ProductFormFE } from "@/types/frontend/product.types";
import {
  ProductStatus,
  ProductCondition,
  ShippingClass,
} from "@/types/shared/common.types";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

function CreateProductContent() {
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
        // For now, we'll assume the user has access to create products
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

  const handleSubmit = async (formData: ProductFormFE) => {
    if (!user) {
      setError("You must be logged in to create a product");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const product = await productsService.create(formData);
      router.push(`/products/${product.slug}`);
    } catch (error: any) {
      console.error("Failed to create product:", error);
      setError(error.message || "Failed to create product. Please try again.");
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
            You must be logged in to create a product.
          </p>
          <Link
            href="/login?redirect=/products/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
        </Card>
      </div>
    );
  }

  if (shops.length === 0 && !loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Shops Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to create a shop before you can create products.
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/seller"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add your product details and start selling.
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

        {/* Product Form - Using inline form for now */}
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">
              Product form component coming soon. Using basic inline form for
              now.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <ErrorBoundary>
      <CreateProductContent />
    </ErrorBoundary>
  );
}
