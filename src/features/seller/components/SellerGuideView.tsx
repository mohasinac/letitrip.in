import { ROUTES } from "@/constants/routes";
import { THEME_CONSTANTS } from "@/constants/theme";
import { Heading, Text, Section, Row, Grid } from "@mohasinac/appkit/ui";
import { TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
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

const { themed, flex, page } = THEME_CONSTANTS;

export async function SellerGuideView() {
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

  const ONBOARD_STEPS: FlowStep[] = [
    {
      emoji: "👤",
      circleClass:
        "bg-primary/10 dark:bg-primary/20 border-2 border-primary/40",
      badge: t("onboardS1"),
      badgeClass: "bg-primary/10 dark:bg-primary/20 text-primary",
      desc: t("onboardS1Desc"),
    },
    {
      emoji: "✅",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      badge: t("onboardS2"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("onboardS2Desc"),
    },
    {
      emoji: "🚀",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("onboardS3"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      desc: t("onboardS3Desc"),
    },
  ];

  const PAYOUT_STEPS: FlowStep[] = [
    {
      emoji: "💰",
      circleClass:
        "bg-primary/10 dark:bg-primary/20 border-2 border-primary/40",
      badge: t("payoutS1"),
      badgeClass: "bg-primary/10 dark:bg-primary/20 text-primary",
      desc: t("payoutS1Desc"),
    },
    {
      emoji: "📦",
      circleClass:
        "bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-400 dark:border-sky-600",
      badge: t("payoutS2"),
      badgeClass:
        "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
      desc: t("payoutS2Desc"),
    },
    {
      emoji: "💵",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("payoutS3"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      desc: t("payoutS3Desc"),
    },
    {
      emoji: "🏦",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      badge: t("payoutS4"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("payoutS4Desc"),
    },
    {
      emoji: "🎉",
      circleClass:
        "bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-400 dark:border-violet-600",
      badge: t("payoutS5"),
      badgeClass:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      desc: t("payoutS5Desc"),
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section
        className={`${THEME_CONSTANTS.accentBanner.pageHero} text-white py-14 md:py-16 lg:py-20`}
      >
        <div className={`${page.container.md} text-center`}>
          <Heading level={1} variant="none" className="mb-4 text-white">
            {t("title")}
          </Heading>
          <Text variant="none" className="text-white/80 mb-8 max-w-2xl mx-auto">
            {t("subtitle")}
          </Text>
          <TextLink
            href={ROUTES.SELLER.DASHBOARD}
            className="inline-flex items-center gap-2 bg-white text-primary-700 dark:text-secondary-700 font-semibold px-6 py-3 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-100 transition-colors"
          >
            {t("startSelling")}
          </TextLink>
        </div>
      </Section>

      <div className={`${page.container.md} py-14 md:py-16 lg:py-20`}>
        <Grid gap="xl" className="grid-cols-1 md:grid-cols-2 xl:gap-10">
          {SECTIONS.map(({ icon: Icon, title, text }) => (
            <Section
              key={title}
              className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border} flex gap-4`}
            >
              <div className={`${flex.noShrink} mt-1`}>
                <div
                  className={`w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 ${flex.center}`}
                >
                  <Icon className="w-5 h-5 text-primary" />
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
            </Section>
          ))}
        </Grid>

        {/* ── Become a Seller Onboarding Diagram ── */}
        <FlowDiagram
          title={`🚀 ${t("onboardDiagramTitle")}`}
          titleClass="text-primary"
          connectorClass="bg-primary/20"
          steps={ONBOARD_STEPS}
          stepWidth="w-[100px]"
          centered
          className="mt-12 mb-6"
        />

        {/* ── Payout Journey Diagram ── */}
        <FlowDiagram
          title={`💰 ${t("payoutDiagramTitle")}`}
          titleClass="text-primary"
          connectorClass="bg-primary/20"
          steps={PAYOUT_STEPS}
          className="mb-10"
          note={`⌛ ${t("payoutNote")}`}
        />

        <Row
          wrap
          gap="lg"
          className={`mt-4 pt-8 border-t ${themed.border} text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-primary hover:underline"
          >
            {t("helpCenter")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-primary hover:underline"
          >
            {t("contactUs")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.HOW_AUCTIONS_WORK}
            className="text-primary hover:underline"
          >
            How Auctions Work
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.SHIPPING_POLICY}
            className="text-primary hover:underline"
          >
            Shipping Policy
          </TextLink>
        </Row>
      </div>
    </div>
  );
}

