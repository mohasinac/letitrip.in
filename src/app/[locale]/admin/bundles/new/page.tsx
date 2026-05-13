"use client";

import { useRouter } from "next/navigation";
import { AdminBundleEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminBundleEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.BUNDLES_EDIT(id)))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.BUNDLES))}
    />
  );
}
