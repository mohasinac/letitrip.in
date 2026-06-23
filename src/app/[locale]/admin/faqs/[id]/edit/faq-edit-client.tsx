"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminFaqEditorView, ROUTES } from "@mohasinac/appkit";

export function FaqEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminFaqEditorView
      faqId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.FAQS))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.FAQS))}
    />
  );
}
