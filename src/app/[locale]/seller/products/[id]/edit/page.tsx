/**
 * Seller Edit Product Page — thin shell.
 * All logic lives in SellerEditProductView.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerEditProductView } from "@/features/seller";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerProducts");
  return {
    title: `${t("editProduct")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SellerEditProductPage({ params }: PageProps) {
  const { id } = await params;
  return <SellerEditProductView id={id} />;
}
