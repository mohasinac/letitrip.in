/**
 * @fileoverview React Component
 * @module src/app/products/create/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { ProductFormFE } from "@/types/frontend/product.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Function: Create Product Content
 */
/**
 * Performs create product content operation
 *
 * @returns {any} The createproductcontent result
 */

/**
 * Performs create product content operation
 *
 * @returns {any} The createproductcontent result
 */

function CreateProductContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    /** Is Loading */
    isLoading: loading,
    error,
    /** Data */
    data: shops,
    /** Set Data */
    setData: setShops,
    execute,
  } = useLoadingState<ShopCardFE[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Error */
    onLoadError: (err) => {
      logError(err, {
        /** Component */
        component: "ProductCreate.loadShops",
      });
    },
  });

  // Load user's shops
  useEffect(() => {
    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const loadShops = async () => {
      if (!user) return;

      await execute(async () => {
        // For now, we'll assume the user has access to create products
        // In a real app, you'd filter shops where user is owner/admin
        const shopsData = await shopsService.list({ limit: 50 });
        return shopsData.data;
      });
    };

    loadShops();
  }, [user, execute]);

  /**
   * Performs async operation
   *
   * @param {ProductFormFE} formData - The form data
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {ProductFormFE} formData - The form data
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSubmit = async (formData: ProductFormFE) => {
    if (!user) {
      return;
    }

    setSubmitting(true);

    try {
      const product = await productsService.create(formData);
      router.push(`/products/${product.slug}`);
    } catch (error: any) {
      logError(error as Error, {
        /** Component */
        component: "ProductCreate.handleSubmit",
        /** Metadata */
        metadata: { productData: formData },
      });
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

  if (!shops || (shops.length === 0 && !loading && !error)) {
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
              <p className="text-red-700">{error.message}</p>
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

export default /**
 * Creates product page
 *
 * @returns {any} The createproductpage result
 *
 */
function CreateProductPage() {
  return (
    <ErrorBoundary>
      <CreateProductContent />
    </ErrorBoundary>
  );
}
