"use client";

import { useRouter } from "@/i18n/navigation";
import { use } from "react";
import { AdminFaqEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminFaqEditorView
      faqId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.FAQS))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.FAQS))}
    />
  );
}
