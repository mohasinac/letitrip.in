"use client";

import { AdminCarouselEditorView } from "@mohasinac/appkit";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <AdminCarouselEditorView
      onSaved={() => router.push("/admin/carousel")}
      onCancel={() => router.push("/admin/carousel")}
    />
  );
}
