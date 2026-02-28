"use client";

/**
 * SellerCreateProductView
 * Path: src/features/seller/components/SellerCreateProductView.tsx
 *
 * Full-page form for a seller to create a new product listing.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader,
  Button,
  ProductForm,
  type AdminProduct,
} from "@/components";
import { useApiMutation, useMessage } from "@/hooks";
import { sellerService } from "@/services";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing, themed, borderRadius } = THEME_CONSTANTS;

const EMPTY_PRODUCT: Partial<AdminProduct> = {
  title: "",
  description: "",
  category: "",
  categoryId: "",
  price: 0,
  currency: "INR",
  stockQuantity: 1,
  availableQuantity: 1,
  mainImage: "",
  images: [],
  status: "draft",
  featured: false,
  tags: [],
};

export function SellerCreateProductView() {
  const router = useRouter();
  const t = useTranslations("sellerProducts");
  const { showSuccess, showError } = useMessage();
  const [product, setProduct] = useState<Partial<AdminProduct>>(EMPTY_PRODUCT);

  const { mutate: createProduct, isLoading } = useApiMutation({
    mutationFn: () => sellerService.createProduct(product),
    onSuccess: () => {
      showSuccess(t("createSuccess"));
      router.push(ROUTES.SELLER.PRODUCTS);
    },
    onError: () => {
      showError(t("saveFailed"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.title) return;
    createProduct(undefined);
  };

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      <AdminPageHeader
        title={t("createProduct")}
        subtitle={t("createProductSubtitle")}
        breadcrumb={[{ label: t("products"), href: ROUTES.SELLER.PRODUCTS }]}
      />

      <div className={`max-w-3xl mx-auto px-4 pb-12 ${spacing.stack}`}>
        <form
          onSubmit={handleSubmit}
          className={`${themed.bgSecondary} ${borderRadius.xl} ${spacing.padding.lg} ${spacing.stack}`}
        >
          <ProductForm product={product} onChange={setProduct} />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !product.title}>
              {isLoading ? t("saving") : t("saveListing")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
