/**
 * Seller Edit Product Page
 *
 * Route: /seller/products/[id]/edit
 * Full-page form for editing an existing product listing.
 */

"use client";

import { use, useEffect, useState, useMemo } from "react";
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
import { useAuth, useApiQuery, useMessage } from "@/hooks";
import {
  UI_LABELS,
  ROUTES,
  API_ENDPOINTS,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { apiClient } from "@/lib/api-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

const { spacing } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.PRODUCTS;
const SELLER_LABELS = UI_LABELS.SELLER_PAGE;

export default function SellerEditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();

  const [formData, setFormData] = useState<Partial<AdminProduct> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  // Fetch the product by id
  const { data: productData, isLoading: productLoading } =
    useApiQuery<AdminProduct>({
      queryKey: ["seller-product-edit", id],
      queryFn: () =>
        apiClient.get<AdminProduct>(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),
      enabled: !!id,
    });

  // Once product is loaded, populate form data
  useEffect(() => {
    if (productData) {
      setFormData(productData);
    }
  }, [productData]);

  // Check ownership
  const isOwner = useMemo(
    () => productData && user && productData.sellerId === user.uid,
    [productData, user],
  );

  const handleSubmit = async () => {
    if (!formData) return;
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

    try {
      setIsSubmitting(true);
      await apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
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
        status: formData.status,
      });
      showSuccess(SUCCESS_MESSAGES.PRODUCT.UPDATED);
      router.push(ROUTES.SELLER.PRODUCTS);
    } catch (err: any) {
      const msg = err?.message ?? LABELS.SAVE_FAILED;
      setError(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || productLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!productData) {
    return (
      <div className={spacing.stack}>
        <AdminPageHeader
          title={SELLER_LABELS.EDIT_LISTING_TITLE}
          actionLabel={UI_LABELS.ACTIONS.BACK}
          onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
        />
        <Alert variant="error">{ERROR_MESSAGES.PRODUCT.NOT_FOUND}</Alert>
      </div>
    );
  }

  // If user doesn't own this product, show error
  if (isOwner === false) {
    return (
      <div className={spacing.stack}>
        <AdminPageHeader
          title={SELLER_LABELS.EDIT_LISTING_TITLE}
          actionLabel={UI_LABELS.ACTIONS.BACK}
          onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
        />
        <Alert variant="error">
          {ERROR_MESSAGES.PRODUCT.UPDATE_NOT_ALLOWED}
        </Alert>
      </div>
    );
  }

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={SELLER_LABELS.EDIT_LISTING_TITLE}
        subtitle={formData?.title}
        actionLabel={UI_LABELS.ACTIONS.BACK}
        onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
      />

      <Card className="p-6">
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {formData && <ProductForm product={formData} onChange={setFormData} />}

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
            disabled={isSubmitting || !formData}
          >
            {isSubmitting ? SELLER_LABELS.SAVING : SELLER_LABELS.SAVE_LISTING}
          </Button>
        </div>
      </Card>
    </div>
  );
}
