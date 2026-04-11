"use client";

/**
 * SellerCreateProductView
 * Path: src/features/seller/components/SellerCreateProductView.tsx
 *
 * Full-page form for a seller to create a new product listing.
 */

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SellerCreateProductView as AppkitSellerCreateProductView } from "@mohasinac/appkit/features/seller";
import {
  AdminPageHeader,
  Button,
  ProductForm,
  type AdminProduct,
} from "@/components";
import { useMessage } from "@/hooks";
import { useCreateSellerProduct } from "../hooks/useSellerProducts";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing, themed } = THEME_CONSTANTS;

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
  condition: "new",
  insurance: false,
  shippingPaidBy: "buyer",
  isAuction: false,
  autoExtendable: false,
  auctionExtensionMinutes: 5,
  auctionShippingPaidBy: "winner",
};

export function SellerCreateProductView() {
  const router = useRouter();
  const t = useTranslations("sellerProducts");
  const { showSuccess, showError } = useMessage();
  const [product, setProduct] = useState<Partial<AdminProduct>>(EMPTY_PRODUCT);

  const { mutate: createProduct, isPending: isLoading } =
    useCreateSellerProduct(
      () => {
        showSuccess(t("createSuccess"));
        router.push(ROUTES.SELLER.PRODUCTS);
      },
      () => showError(t("saveFailed")),
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.title) return;
    createProduct(product);
  };

  return (
    <AppkitSellerCreateProductView
      isLoading={isLoading}
      className={`${themed.bgPrimary} min-h-screen`}
      renderForm={() => (
        <>
          <AdminPageHeader
            title={t("createProduct")}
            subtitle={t("createProductSubtitle")}
            breadcrumb={[
              { label: t("products"), href: ROUTES.SELLER.PRODUCTS },
            ]}
          />

          <div className={`max-w-3xl mx-auto px-4 pb-12 ${spacing.stack}`}>
            <form
              onSubmit={handleSubmit}
              className={`${themed.bgSecondary} rounded-xl p-6 ${spacing.stack}`}
            >
              <ProductForm product={product} onChange={setProduct} />

              <div className="flex justify-start gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}
                  disabled={isLoading}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !product.title}
                >
                  {isLoading ? t("saving") : t("saveListing")}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    />
  );
}
