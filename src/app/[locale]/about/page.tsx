import { SITE_CONFIG } from "@/constants";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutView } from "@/features/about";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `About Us — ${SITE_CONFIG.brand.name}`,
    description: t("subtitle"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutView />;
}
