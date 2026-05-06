"use client";

import { AdminCarouselEditorView } from "@mohasinac/appkit";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  return (
    <AdminCarouselEditorView
      slideId={params.id}
      onSaved={() => router.push("/admin/carousel")}
      onDeleted={() => router.push("/admin/carousel")}
      onCancel={() => router.push("/admin/carousel")}
    />
  );
}
