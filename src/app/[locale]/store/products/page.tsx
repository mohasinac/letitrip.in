"use client";

import { SellerProductsView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <SellerProductsView
      onCreateClick={() => router.push(String(ROUTES.STORE.PRODUCTS_NEW))}
    />
  );
}
