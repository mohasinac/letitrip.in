"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminProductEditorView, ROUTES } from "@mohasinac/appkit/client";
import type { ListingType } from "@mohasinac/appkit/client";

export function ProductNewClient({
  initialListingType,
}: {
  initialListingType?: ListingType;
}) {
  const router = useRouter();
  return (
    <AdminProductEditorView
      initialListingType={initialListingType}
      onSaved={(id) => router.push(String(ROUTES.ADMIN.PRODUCTS_EDIT(id)))}
    />
  );
}
