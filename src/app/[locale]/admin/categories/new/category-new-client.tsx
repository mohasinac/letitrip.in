"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminCategoryEditorView, ROUTES } from "@mohasinac/appkit/client";

export function CategoryNewClient() {
  const router = useRouter();
  return (
    <AdminCategoryEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.CATEGORIES_EDIT(id)))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.CATEGORIES))}
    />
  );
}
