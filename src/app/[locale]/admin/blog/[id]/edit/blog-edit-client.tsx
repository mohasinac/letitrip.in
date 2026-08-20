"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminBlogEditorView, ROUTES } from "@mohasinac/appkit/client";

export function BlogEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminBlogEditorView
      postId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.BLOG))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.BLOG))}
    />
  );
}
