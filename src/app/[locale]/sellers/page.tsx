import { SITE_CONFIG } from "@/constants";
import { getTranslations } from "next-intl/server";
import { SellersListView } from "@/features/seller";

export async function generateMetadata() {
  const t = await getTranslations("sellersPage");
  return {
    title: `Sell on ${SITE_CONFIG.brand.name}`,
    description: t("subtitle"),
  };
}

export default function SellersPage() {
  return <SellersListView />;
}
