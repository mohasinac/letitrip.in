import { SITE_CONFIG } from "@/constants";
import { getTranslations } from "next-intl/server";
import { AboutView } from "@/features/about";

export async function generateMetadata() {
  const t = await getTranslations("about");
  return {
    title: `About Us — ${SITE_CONFIG.brand.name}`,
    description: t("subtitle"),
  };
}

export default function AboutPage() {
  return <AboutView />;
}
