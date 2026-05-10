"use client";

import { useRouter } from "next/navigation";
import { AdminSublistingCategoryEditorView } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  const router = useRouter();
  return (
    <AdminSublistingCategoryEditorView
      onSaved={() => router.push(String(ROUTES.ADMIN.SUBLISTING_CATEGORIES))}
    />
  );
}
