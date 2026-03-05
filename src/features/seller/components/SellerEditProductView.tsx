/**
 * SellerEditProductView
 *
 * Extracted from src/app/[locale]/seller/products/[id]/edit/page.tsx
 * Receives the product `id` as a prop (resolved by the page shell via `use(params)`).
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
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
  ROUTES,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";
import { productService } from "@/services";

const { spacing, flex } = THEME_CONSTANTS;

interface SellerEditProductViewProps {
  id: string;
}

export function SellerEditProductView({ id }: SellerEditProductViewProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("sellerProducts");
  const tActions = useTranslations("actions");

  const [formData, setFormData] = useState<Partial<AdminProduct> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const { data: productData, isLoading: productLoading } =
    useApiQuery<AdminProduct>({
      queryKey: ["seller-product-edit", id],
      queryFn: () => productService.getById(id),
      enabled: !!id,
    });

  useEffect(() => {
    if (productData) {
      setFormData(productData);
    }
  }, [productData]);

  const isOwner = useMemo(
    () => productData && user && productData.sellerId === user.uid,
    [productData, user],
  );

  const handleSubmit = async () => {
    if (!formData) return;
    setError(null);

    if (!formData.title?.trim()) {
      setError(t("titleRequired"));
      return;
    }
    if (!formData.description?.trim()) {
      setError(t("descriptionRequired"));
      return;
    }
    if (!formData.category?.trim()) {
      setError(t("categoryRequired"));
      return;
    }

    try {
      setIsSubmitting(true);
      await productService.update(id, {
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
        condition: formData.condition || "new",
        insurance: formData.insurance ?? false,
        insuranceCost: formData.insurance ? (formData.insuranceCost ?? 0) : undefined,
        shippingPaidBy: formData.shippingPaidBy || "buyer",
        isAuction: formData.isAuction ?? false,
        auctionEndDate: formData.auctionEndDate || undefined,
        startingBid: formData.startingBid || undefined,
        reservePrice: formData.reservePrice || undefined,
        buyNowPrice: formData.buyNowPrice || undefined,
        minBidIncrement: formData.minBidIncrement || undefined,
        autoExtendable: formData.autoExtendable ?? false,
        auctionExtensionMinutes: formData.autoExtendable
          ? (formData.auctionExtensionMinutes ?? 5)
          : undefined,
        auctionShippingPaidBy: formData.isAuction
          ? (formData.auctionShippingPaidBy || "winner")
          : undefined,
        status: formData.status,
      });
      showSuccess(SUCCESS_MESSAGES.PRODUCT.UPDATED);
      router.push(ROUTES.SELLER.PRODUCTS);
    } catch (err: any) {
      const msg = err?.message ?? t("saveFailed");
      setError(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || productLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!productData) {
    return (
      <div className={spacing.stack}>
        <AdminPageHeader
          title={t("editListingTitle")}
          actionLabel={tActions("back")}
          onAction={() => router.push(ROUTES.SELLER.PRODUCTS)}
        />
        <Alert variant="error">{ERROR_MESSAGES.PRODUCT.NOT_FOUND}</Alert>
      </div>
    );
  }

  if (isOwner === false) {
    return (
      <div className={spacing.stack}>
        <AdminPageHeader
          title={t("editListingTitle")}
          actionLabel={tActions("back")}
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
        title={t("editListingTitle")}
        subtitle={formData?.title}
        actionLabel={tActions("back")}
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
            {tActions("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData}
          >
            {isSubmitting ? t("saving") : t("saveListing")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
