import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerCreateProductView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerProducts");
  return {
    title: `${t("createProduct")} — ${SITE_CONFIG.brand.name}`,
    description: t("createProductSubtitle"),
    robots: { index: false, follow: false },
  };
}

export default function SellerAddProductPage() {
  return <SellerCreateProductView />;
}
