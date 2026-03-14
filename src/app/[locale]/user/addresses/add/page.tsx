import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AddAddressView } from "@/features/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("addresses");
  return {
    title: `${t("metaTitleAdd")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescriptionAdd"),
    robots: { index: false, follow: false },
  };
}

export default function AddAddressPage() {
  return <AddAddressView />;
}
