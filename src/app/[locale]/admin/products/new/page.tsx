"use client";

import { useRouter } from "next/navigation";
import { AdminProductEditorView } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminProductEditorView
      onSaved={(id) => router.push(`/admin/products/${id}/edit`)}
    />
  );
}
