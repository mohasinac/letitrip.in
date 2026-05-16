"use client";

import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation";
import { AdminSublistingCategoryEditorView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  return (
    <AdminSublistingCategoryEditorView
      categoryId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES))}
    />
  );
}
