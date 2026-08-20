"use client";

import { AdminCarouselEditorView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export function CarouselNewClient() {
  const router = useRouter();
  return (
    <AdminCarouselEditorView
      onSaved={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
      onCancel={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
    />
  );
}
