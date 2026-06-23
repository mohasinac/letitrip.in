"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminProductEditorView, ROUTES } from "@mohasinac/appkit";

export function ProductEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminProductEditorView
      productId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.PRODUCTS))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.PRODUCTS))}
    />
  );
}
