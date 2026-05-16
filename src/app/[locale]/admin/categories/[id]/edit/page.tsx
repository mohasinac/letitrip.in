"use client";

import { use } from "react";
import { useRouter } from "@/i18n/navigation";
import { AdminCategoryEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminCategoryEditorView
      categoryId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.CATEGORIES))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.CATEGORIES))}
    />
  );
}
