"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminSublistingCategoryEditorView } from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit/client";

export function SublistingCategoryNewClient() {
  const router = useRouter();
  return (
    <AdminSublistingCategoryEditorView
      onSaved={() => router.push(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES))}
    />
  );
}
