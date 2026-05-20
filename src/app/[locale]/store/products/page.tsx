"use client";

import { SellerProductsView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { sellerDeleteProductAction } from "@/actions/seller.actions";

export default function Page() {
  const router = useRouter();
  return (
    <SellerProductsView
      onCreateClick={() => router.push(String(ROUTES.STORE.PRODUCTS_NEW))}
      onDeleteProduct={sellerDeleteProductAction}
    />
  );
}
