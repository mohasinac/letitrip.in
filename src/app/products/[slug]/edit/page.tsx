"use client";

import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { ProductFE, ProductFormFE } from "@/types/frontend/product.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditProductPageProps {
  params: Promise<{ slug: string }>;
}

function EditProductContent({ params }: EditProductPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [slug, setSlug] = useState<string>("");

  const {
    isLoading: loading,
    error,
    data: product,
    setData: setProduct,
    execute,
  } = useLoadingState<ProductFE | null>({
    initialData: null,
    onLoadError: (err) => {
      logError(err, {
        component: "ProductEdit.loadData",
        metadata: { slug },
      });
    },
  });

  const [shops, setShops] = useState<ShopCardFE[]>([]);

  // Load params
  useEffect(() => {
    const loadParams = async () => {
      const { slug: productSlug } = await params;
      setSlug(productSlug);
    };
    loadParams();
  }, [params]);

  // Load product and shops
  useEffect(() => {
    const loadData = async () => {
      if (!user || !slug) return;

      await execute(async () => {
        // Load product
        const productData = await productsService.getBySlug(slug);

        // Load user's shops
        const shopsData = await shopsService.list({ limit: 50 });
        setShops(shopsData.data);

        return productData;
      });
    };

    loadData();
  }, [user, slug, execute]);

  const handleSubmit = async (formData: ProductFormFE) => {
    if (!user || !product) {
      return;
    }

    setSubmitting(true);

    try {
      const updatedProduct = await productsService.update(
        product.slug,
        formData,
      );
      router.push(`/products/${updatedProduct.slug}`);
    } catch (error: any) {
      logError(error as Error, {
        component: "ProductEdit.handleSubmit",
        metadata: { slug: product.slug },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            You must be logged in to edit a product.
          </p>
          <Link
            href="/login?redirect=/products"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Product
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Products
          </Link>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're trying to edit doesn't exist or has been removed.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Products
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
            href={`/products/${product.slug}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your product details and settings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
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
            <p className="text-sm text-gray-500 mt-2">
              Editing product: {product.name}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <ErrorBoundary>
      <EditProductContent params={params} />
    </ErrorBoundary>
  );
}
