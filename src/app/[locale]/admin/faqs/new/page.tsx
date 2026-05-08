"use client";

import { useRouter } from "next/navigation";
import { AdminFaqEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminFaqEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.FAQS_EDIT(id)))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.FAQS))}
    />
  );
}
