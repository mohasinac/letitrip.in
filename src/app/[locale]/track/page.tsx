import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Heading, Text, Caption } from "@/components";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShoppingBag, Truck, MapPin, CheckCircle2 } from "lucide-react";

const { themed } = THEME_CONSTANTS;

export async function generateMetadata() {
  return {
    title: `Track Order — ${SITE_CONFIG.brand.name}`,
    description:
      "Track the status of your LetItRip orders and shipments in real time.",
  };
}

export default async function TrackOrderPage() {
  const t = await getTranslations("trackOrder");

  const STEPS = [
    {
      icon: ShoppingBag,
      title: t("step1Title"),
      text: t("step1Text"),
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
    {
      icon: Truck,
      title: t("step2Title"),
      text: t("step2Text"),
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-900/40",
    },
    {
      icon: MapPin,
      title: t("step3Title"),
      text: t("step3Text"),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      icon: CheckCircle2,
      title: t("step4Title"),
      text: t("step4Text"),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white py-14 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading level={1} className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text className="text-indigo-200">{t("subtitle")}</Text>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 space-y-14 md:space-y-16">
        {/* Sign-in prompt */}
        <section
          className={`${themed.bgSecondary} rounded-2xl border ${themed.border} p-8 text-center`}
        >
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <Heading level={2} className="mb-3">
            {t("signInPrompt")}
          </Heading>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {t("signIn")}
            </Link>
            <Link
              href={ROUTES.USER.ORDERS}
              className={`inline-flex items-center justify-center gap-2 ${themed.bgPrimary} border ${themed.border} ${themed.textPrimary} font-medium px-6 py-3 rounded-lg hover:opacity-80 transition-opacity`}
            >
              {t("viewOrders")}
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section>
          <Heading level={2} className="text-center mb-10">
            {t("howItWorksTitle")}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {STEPS.map(({ icon: Icon, title, text, color, bg }, index) => (
              <div
                key={title}
                className={`${themed.bgSecondary} rounded-xl border ${themed.border} p-6 relative`}
              >
                <Caption className="absolute top-4 right-4 font-bold">
                  {String(index + 1).padStart(2, "0")}
                </Caption>
                <div
                  className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <Heading level={3} className="mb-2">
                  {title}
                </Heading>
                <Text variant="secondary" size="sm" className="leading-relaxed">
                  {text}
                </Text>
              </div>
            ))}
          </div>
        </section>

        {/* Need help */}
        <section
          className={`${themed.bgSecondary} rounded-xl border ${themed.border} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
        >
          <div>
            <Heading level={2} className="mb-1">
              {t("needHelpTitle")}
            </Heading>
            <Text variant="secondary" size="sm">
              {t("needHelpText")}
            </Text>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href={ROUTES.PUBLIC.HELP}
              className={`text-sm ${themed.textSecondary} hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-4 transition-colors`}
            >
              {t("helpCenter")}
            </Link>
            <Link
              href={ROUTES.PUBLIC.CONTACT}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t("contactSupport")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
