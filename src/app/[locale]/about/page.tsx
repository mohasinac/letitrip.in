import { SITE_CONFIG } from "@/constants";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutView } from "@/features/about";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `About Us — ${SITE_CONFIG.brand.name}`,
    description: t("subtitle"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  return <AboutView />;
}
