"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminBundleEditorView, ROUTES } from "@mohasinac/appkit/client";

export function BundleEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminBundleEditorView
      bundleId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.BUNDLES))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.BUNDLES))}
    />
  );
}
