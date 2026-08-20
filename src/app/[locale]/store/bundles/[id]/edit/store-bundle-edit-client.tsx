"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminBundleEditorView, ROUTES } from "@mohasinac/appkit/client";

export function StoreBundleEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminBundleEditorView
      scope="store"
      bundleId={id}
      onSaved={() => router.push(String(ROUTES.STORE.BUNDLES))}
      onDeleted={() => router.push(String(ROUTES.STORE.BUNDLES))}
    />
  );
}
