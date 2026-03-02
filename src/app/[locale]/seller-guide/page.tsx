import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text } from "@/components";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Store,
  Tags,
  Wallet,
  Gavel,
  Package,
  CreditCard,
  ShieldCheck,
  HeadphonesIcon,
} from "lucide-react";

const { themed } = THEME_CONSTANTS;

export async function generateMetadata() {
  return {
    title: `Seller Guide — ${SITE_CONFIG.brand.name}`,
    description:
      "Learn how to sell on LetItRip — listing products, running auctions, managing orders, and getting paid.",
  };
}

export default async function SellerGuidePage() {
  const t = await getTranslations("sellerGuide");

  const SECTIONS = [
    {
      icon: Store,
      title: t("gettingStartedTitle"),
      text: t("gettingStartedText"),
    },
    { icon: Tags, title: t("listingTitle"), text: t("listingText") },
    { icon: Wallet, title: t("pricingTitle"), text: t("pricingText") },
    { icon: Gavel, title: t("auctionsTitle"), text: t("auctionsText") },
    { icon: Package, title: t("ordersTitle"), text: t("ordersText") },
    { icon: CreditCard, title: t("paymentsTitle"), text: t("paymentsText") },
    { icon: ShieldCheck, title: t("policiesTitle"), text: t("policiesText") },
    {
      icon: HeadphonesIcon,
      title: t("supportTitle"),
      text: t("supportText"),
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-800 text-white py-14 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading level={1} className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text className="text-violet-200 mb-8 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
          <Link
            href={ROUTES.SELLER.DASHBOARD}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors"
          >
            {t("startSelling")}
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-10">
          {SECTIONS.map(({ icon: Icon, title, text }) => (
            <section
              key={title}
              className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border} flex gap-4`}
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div>
                <Heading level={2} className="mb-2">
                  {title}
                </Heading>
                <Text variant="secondary" size="sm" className="leading-relaxed">
                  {text}
                </Text>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-6 text-sm">
          <Link
            href={ROUTES.PUBLIC.HELP}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("helpCenter")}
          </Link>
          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("contactUs")}
          </Link>
        </div>
      </div>
    </div>
  );
}
