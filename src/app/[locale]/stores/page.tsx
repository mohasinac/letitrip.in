import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Spinner } from "@/components";
import { StoresListView } from "@/features/stores";
import { THEME_CONSTANTS } from "@/constants";

const { page, flex } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("storesPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function StoresPage() {
  return (
    <div className={`${page.container.wide} py-6 sm:py-10`}>
      <Suspense
        fallback={
          <div className={`${flex.hCenter} ${page.empty}`}>
            <Spinner />
          </div>
        }
      >
        <StoresListView />
      </Suspense>
    </div>
  );
}
