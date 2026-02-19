/**
 * Seller New Product Page
 *
 * Route: /seller/products/new
 * Full-page form for creating a new product listing.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Spinner,
  Alert,
  AdminPageHeader,
  ProductForm,
} from "@/components";
import type { AdminProduct } from "@/components";
import { useAuth, useMessage } from "@/hooks";
import {
  UI_LABELS,
  ROUTES,
  API_ENDPOINTS,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
} from "@/constants";
import { apiClient } from "@/lib/api-client";

const { spacing } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.PRODUCTS;
const SELLER_LABELS = UI_LABELS.SELLER_PAGE;

const DEFAULT_PRODUCT: Partial<AdminProduct> = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  brand: "",
  price: 0,
  stockQuantity: 0,
  currency: "INR",
  status: "draft",
  featured: false,
  isAuction: false,
  isPromoted: false,
  tags: [],
  images: [],
  mainImage: "",
  shippingInfo: "",
  returnPolicy: "",
};

export default function SellerNewProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();

  const [formData, setFormData] =
    useState<Partial<AdminProduct>>(DEFAULT_PRODUCT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    setError(null);
    if (!formData.title?.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.description?.trim()) {
      setError("Description is required");
      return;
    }
    if (!formData.category?.trim()) {
      setError("Category is required");
      return;
    }
    if (!formData.mainImage?.trim()) {
      setError("Main image URL is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        price: formData.price ?? 0,
        stockQuantity: formData.stockQuantity ?? 0,
        currency: formData.currency ?? "INR",
        mainImage: formData.mainImage,
        images: formData.images ?? [],
        tags: formData.tags ?? [],
        shippingInfo: formData.shippingInfo || undefined,
        returnPolicy: formData.returnPolicy || undefined,
        isAuction: formData.isAuction ?? false,
        auctionEndDate: formData.auctionEndDate || undefined,
        startingBid: formData.startingBid || undefined,
      });
      showSuccess(SUCCESS_MESSAGES.PRODUCT.CREATED);
      router.push(ROUTES.SELLER.PRODUCTS);
    } catch (err: any) {
      const msg = err?.message ?? LABELS.SAVE_FAILED;
      setError(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={SELLER_LABELS.CREATE_LISTING_TITLE}
        subtitle={LABELS.SUBTITLE}
        actionLabel={UI_LABELS.ACTIONS.BACK}
        onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
      />

      <Card className="p-6">
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <ProductForm product={formData} onChange={setFormData} />

        <div className="mt-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}
            disabled={isSubmitting}
          >
            {UI_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? SELLER_LABELS.SAVING : SELLER_LABELS.SAVE_LISTING}
          </Button>
        </div>
      </Card>
    </div>
  );
}
