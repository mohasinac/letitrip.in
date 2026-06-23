"use client";

import { useRouter } from "@/i18n/navigation";
import { SellerProductsView, ROUTES } from "@mohasinac/appkit/client";
import { sellerDeleteProductAction } from "@/actions/seller.actions";

export function SellerProductsClient() {
  const router = useRouter();
  return (
    <SellerProductsView
      onCreateClick={() => router.push(String(ROUTES.STORE.PRODUCTS_NEW))}
      onDeleteProduct={sellerDeleteProductAction}
    />
  );
}
