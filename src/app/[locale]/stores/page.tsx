import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Spinner } from "@/components";
import { StoresListView } from "@/features/stores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("storesPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function StoresPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        }
      >
        <StoresListView />
      </Suspense>
    </div>
  );
}
