import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerCouponForm } from "@/features/seller";
import { AdminPageHeader } from "@/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerCoupons");
  return {
    title: `${t("metaTitleNew")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescriptionNew"),
    robots: { index: false, follow: false },
  };
}

export default async function NewSellerCouponPage() {
  const t = await getTranslations("sellerCoupons");
  return (
    <>
      <AdminPageHeader
        title={t("newPageTitle")}
        subtitle={t("newPageSubtitle")}
      />
      <SellerCouponForm />
    </>
  );
}
