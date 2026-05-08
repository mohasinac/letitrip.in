"use client";

import { useRouter } from "next/navigation";
import { AdminBlogEditorView, ROUTES } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  return (
    <AdminBlogEditorView
      onSaved={(id) => router.push(String(ROUTES.ADMIN.BLOG_EDIT(id)))}
    />
  );
}
