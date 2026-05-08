"use client";

import { AdminCarouselEditorView, ROUTES } from "@mohasinac/appkit";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  return (
    <AdminCarouselEditorView
      slideId={params.id}
      onSaved={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
      onCancel={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
    />
  );
}
