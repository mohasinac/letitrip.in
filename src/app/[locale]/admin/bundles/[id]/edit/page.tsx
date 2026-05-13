"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AdminBundleEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminBundleEditorView
      bundleId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.BUNDLES))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.BUNDLES))}
    />
  );
}
