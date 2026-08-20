"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminFaqEditorView, ROUTES } from "@mohasinac/appkit/client";

export function FaqNewClient() {
  const router = useRouter();
  return (
    <AdminFaqEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.FAQS_EDIT(id)))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.FAQS))}
    />
  );
}
