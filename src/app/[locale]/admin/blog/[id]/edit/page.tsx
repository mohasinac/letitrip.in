"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { AdminBlogEditorView } from "@mohasinac/appkit";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  return (
    <AdminBlogEditorView
      postId={id}
      onSaved={() => router.push("/admin/blog")}
      onDeleted={() => router.push("/admin/blog")}
    />
  );
}
