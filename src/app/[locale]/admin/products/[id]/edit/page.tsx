"use client";

import { useRouter } from "@/i18n/navigation";
import { use } from "react";
import { AdminProductEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminProductEditorView
      productId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.PRODUCTS))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.PRODUCTS))}
    />
  );
}
