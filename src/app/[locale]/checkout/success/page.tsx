import type { Metadata } from "next";
import React, { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { CheckoutSuccessView } from "@/features/cart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: `${t("metaTitleSuccess")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescriptionSuccess"),
    robots: { index: false, follow: false },
  };
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessView />
    </Suspense>
  );
}
