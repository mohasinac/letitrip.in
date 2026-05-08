"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { AdminProductEditorView } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminProductEditorView
      productId={id}
      onSaved={() => router.push("/admin/products")}
      onDeleted={() => router.push("/admin/products")}
    />
  );
}
