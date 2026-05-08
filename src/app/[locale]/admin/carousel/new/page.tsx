"use client";

import { AdminCarouselEditorView, ROUTES } from "@mohasinac/appkit";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <AdminCarouselEditorView
      onSaved={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
      onCancel={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
    />
  );
}
