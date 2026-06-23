"use client";

import { AdminCarouselEditorView, ROUTES } from "@mohasinac/appkit";
import { useRouter } from "@/i18n/navigation";

export function CarouselEditClient({ id }: { id: string }) {
  const router = useRouter();
  return (
    <AdminCarouselEditorView
      slideId={id}
      onSaved={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
      onDeleted={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
      onCancel={() => router.push(String(ROUTES.ADMIN.CAROUSEL))}
    />
  );
}
