"use client";

import { useRouter } from "next/navigation";
import { AdminFaqEditorView } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminFaqEditorView
      onSaved={(id) => router.push(`/admin/faqs/${id}/edit`)}
      onDeleted={() => router.push("/admin/faqs")}
    />
  );
}
