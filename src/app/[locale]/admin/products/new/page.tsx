"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminProductEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminProductEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.PRODUCTS_EDIT(id)))}
    />
  );
}
