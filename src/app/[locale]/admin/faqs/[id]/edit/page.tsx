"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { AdminFaqEditorView } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminFaqEditorView
      faqId={id}
      onSaved={() => router.push("/admin/faqs")}
      onDeleted={() => router.push("/admin/faqs")}
    />
  );
}
