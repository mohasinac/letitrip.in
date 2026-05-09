"use client";

import { useRouter } from "next/navigation";
import { AdminCategoryEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminCategoryEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.CATEGORIES_EDIT(id)))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.CATEGORIES))}
    />
  );
}
