"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminSublistingCategoryEditorView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export function SublistingCategoryEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminSublistingCategoryEditorView
      categoryId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES))}
    />
  );
}
