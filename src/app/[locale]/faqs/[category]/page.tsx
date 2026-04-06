import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Suspense } from "react";
import { FAQ_CATEGORIES, ROUTES, THEME_CONSTANTS } from "@/constants";
import type { FAQCategoryKey } from "@/constants";
import { FAQPageContent } from "@/features/faq";

interface Props {
  params: Promise<{ locale: string; category: string }>;
}

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(FAQ_CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  if (!(category in FAQ_CATEGORIES)) {
    return { title: t("metaTitle"), description: t("metaDescription") };
  }

  const key = category as FAQCategoryKey;
  return {
    title: t("categoryMetaTitle", { category: t(`category.${key}`) }),
    description: t(`categoryDescription.${key}`),
  };
}

export default async function FAQCategoryPage({ params }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  if (!(category in FAQ_CATEGORIES)) {
    redirect({ href: ROUTES.PUBLIC.FAQS, locale });
  }

  return (
    <Suspense
      fallback={
        <div
          className={`${THEME_CONSTANTS.container["2xl"]} mx-auto p-8 py-12`}
        >
          <div className={`animate-pulse ${THEME_CONSTANTS.spacing.stack}`}>
            <div
              className={`h-32 ${THEME_CONSTANTS.themed.bgSecondary} rounded-xl`}
            />
            <div
              className={`h-16 ${THEME_CONSTANTS.themed.bgSecondary} rounded-xl`}
            />
            <div
              className={`h-96 ${THEME_CONSTANTS.themed.bgSecondary} rounded-xl`}
            />
          </div>
        </div>
      }
    >
      <FAQPageContent initialCategory={category as FAQCategoryKey} />
    </Suspense>
  );
}
