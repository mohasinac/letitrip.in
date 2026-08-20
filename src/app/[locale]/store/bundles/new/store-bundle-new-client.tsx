"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminBundleEditorView, ROUTES } from "@mohasinac/appkit/client";

export function StoreBundleNewClient() {
  const router = useRouter();
  return (
    <AdminBundleEditorView
      scope="store"
      onSaved={(id) => router.push(String(ROUTES.STORE.BUNDLES_EDIT(id)))}
      onDeleted={() => router.push(String(ROUTES.STORE.BUNDLES))}
    />
  );
}
