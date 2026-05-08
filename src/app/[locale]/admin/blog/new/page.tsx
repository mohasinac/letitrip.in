"use client";

import { useRouter } from "next/navigation";
import { AdminBlogEditorView } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminBlogEditorView
      onSaved={(id) => router.push(`/admin/blog/${id}/edit`)}
    />
  );
}
