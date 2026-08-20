"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminCategoryEditorView, ROUTES } from "@mohasinac/appkit/client";

export function CategoryEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminCategoryEditorView
      categoryId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.CATEGORIES))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.CATEGORIES))}
    />
  );
}
