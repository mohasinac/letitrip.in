import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Section, TextLink, FlowDiagram } from "@/components";
import type { FlowStep } from "@/components";
import { getTranslations } from "next-intl/server";
import {
  Landmark,
  ClipboardCheck,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const { themed, flex, page } = THEME_CONSTANTS;

export async function HowPayoutsWorkView() {
  const t = await getTranslations("howPayoutsWork");

  const STEPS = [
    {
      number: 1,
      icon: "🏦",
      title: t("step1Title"),
      text: t("step1Text"),
    },
    {
      number: 2,
      icon: "📦",
      title: t("step2Title"),
      text: t("step2Text"),
    },
    {
      number: 3,
      icon: "📋",
      title: t("step3Title"),
      text: t("step3Text"),
    },
    {
      number: 4,
      icon: "🔍",
      title: t("step4Title"),
      text: t("step4Text"),
    },
    {
      number: 5,
      icon: "💵",
      title: t("step5Title"),
      text: t("step5Text"),
    },
  ];

  const INFO_CARDS = [
    {
      icon: Landmark,
      title: t("bankSetupTitle"),
      text: t("bankSetupText"),
      color:
        "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
      iconColor: "text-primary",
    },
    {
      icon: ClipboardCheck,
      title: t("minimumTitle"),
      text: t("minimumText"),
      color:
        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: ShieldCheck,
      title: t("commissionTitle"),
      text: t("commissionText"),
      color: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    {
      icon: AlertCircle,
      title: t("rejectionTitle"),
      text: t("rejectionText"),
      color: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  const DIAGRAM_STEPS: FlowStep[] = [
    {
      emoji: "📦",
      circleClass:
        "bg-primary/10 dark:bg-primary/20 border-2 border-primary/40",
      badge: t("diagramS1"),
      badgeClass: "bg-primary/10 dark:bg-primary/20 text-primary",
      desc: t("diagramS1Desc"),
    },
    {
      emoji: "📋",
      circleClass:
        "bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-600",
      badge: t("diagramS2"),
      badgeClass:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      desc: t("diagramS2Desc"),
    },
    {
      emoji: "🔍",
      circleClass:
        "bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-400 dark:border-sky-600",
      badge: t("diagramS3"),
      badgeClass:
        "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
      desc: t("diagramS3Desc"),
    },
    {
      emoji: "✅",
      circleClass:
        "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600",
      badge: t("diagramS4"),
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      desc: t("diagramS4Desc"),
    },
    {
      emoji: "🎉",
      circleClass:
        "bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-400 dark:border-violet-600",
      badge: t("diagramS5"),
      badgeClass:
        "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      desc: t("diagramS5Desc"),
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Hero */}
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
            {t("ctaHero")}
          </TextLink>
        </div>
      </Section>

      <div
        className={`${page.container.md} py-10 md:py-12 lg:py-16 space-y-14`}
      >
        {/* Steps */}
        <Section>
          <Heading level={2} className="mb-8 text-center">
            {t("stepsTitle")}
          </Heading>
          <div className="space-y-5">
            {STEPS.map(({ number, icon, title, text }) => (
              <div
                key={number}
                className={`flex items-start gap-4 p-5 rounded-xl border ${themed.border} ${themed.bgPrimary}`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 ${flex.center} text-xl`}
                >
                  {icon}
                </div>
                <div>
                  <Text className="font-semibold mb-0.5">
                    {number}. {title}
                  </Text>
                  <Text variant="secondary" className="text-sm leading-relaxed">
                    {text}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Flow diagram */}
        <Section>
          <FlowDiagram
            title={`💰 ${t("diagramTitle")}`}
            titleClass="text-primary"
            connectorClass="bg-primary/20"
            steps={DIAGRAM_STEPS}
            note={`⌛ ${t("diagramNote")}`}
          />
        </Section>

        {/* Info cards */}
        <Section>
          <Heading level={2} className="mb-8 text-center">
            {t("infoTitle")}
          </Heading>
          <div className="grid gap-5 sm:grid-cols-2">
            {INFO_CARDS.map(({ icon: Icon, title, text, color, iconColor }) => (
              <div key={title} className={`rounded-xl border p-5 ${color}`}>
                <div
                  className={`w-10 h-10 rounded-lg bg-white/60 dark:bg-white/10 ${flex.center} mb-3`}
                >
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <Text className="font-semibold mb-1">{title}</Text>
                <Text variant="secondary" className="text-sm leading-relaxed">
                  {text}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer links */}
        <div
          className={`pt-8 border-t ${themed.border} flex flex-wrap gap-6 text-sm`}
        >
          <TextLink
            href={ROUTES.PUBLIC.SELLER_GUIDE}
            className="text-primary hover:underline"
          >
            {t("sellerGuideLink")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.FEES}
            className="text-primary hover:underline"
          >
            {t("feesLink")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.HELP}
            className="text-primary hover:underline"
          >
            {t("helpLink")}
          </TextLink>
          <TextLink
            href={ROUTES.PUBLIC.CONTACT}
            className="text-primary hover:underline"
          >
            {t("contactLink")}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
