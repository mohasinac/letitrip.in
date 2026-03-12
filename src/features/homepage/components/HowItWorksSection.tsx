"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Gavel, PackageCheck } from "lucide-react";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Button, Heading, Section, Text } from "@/components";
import { useRouter } from "@/i18n/navigation";

// ─── Step configuration ───────────────────────────────────────────────────────

const STEPS = [
  {
    number: 1,
    iconName: "Search" as const,
    titleKey: "howItWorksStep1Title",
    descKey: "howItWorksStep1Desc",
    accent: "from-indigo-500 to-blue-600",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    badgeBg: "bg-indigo-600",
  },
  {
    number: 2,
    iconName: "Gavel" as const,
    titleKey: "howItWorksStep2Title",
    descKey: "howItWorksStep2Desc",
    accent: "from-violet-500 to-purple-600",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeBg: "bg-violet-600",
  },
  {
    number: 3,
    iconName: "PackageCheck" as const,
    titleKey: "howItWorksStep3Title",
    descKey: "howItWorksStep3Desc",
    accent: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeBg: "bg-emerald-600",
  },
] as const;

const ICON_MAP = { Search, Gavel, PackageCheck };

// ─── Single step card ──────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  desc,
  visible,
  delay,
}: {
  step: (typeof STEPS)[number];
  title: string;
  desc: string;
  visible: boolean;
  delay: number;
}) {
  const Icon = ICON_MAP[step.iconName];

  return (
    <div
      className={[
        "relative rounded-3xl p-8",
        "bg-white dark:bg-slate-900",
        "shadow-md group hover:-translate-y-2 hover:shadow-xl",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Step number watermark (absolute behind content) */}
      <div
        className="absolute top-4 right-5 font-display text-7xl bg-gradient-to-br from-primary to-cobalt opacity-10 bg-clip-text text-transparent select-none pointer-events-none leading-none"
        aria-hidden="true"
      >
        {step.number}
      </div>

      {/* Visible index badge */}
      <div
        className={`relative z-10 w-10 h-10 rounded-full ${step.badgeBg} text-white font-bold text-sm flex items-center justify-center mb-5 shadow-md`}
      >
        {step.number}
      </div>

      {/* Icon */}
      <div
        className={`relative z-10 w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center mb-4 border border-white/80 dark:border-slate-700/50`}
      >
        <Icon className={`w-7 h-7 ${step.iconColor}`} strokeWidth={1.75} />
      </div>

      {/* Text */}
      <Heading
        level={3}
        className={`relative z-10 ${THEME_CONSTANTS.typography.h5} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
      >
        {title}
      </Heading>
      <Text
        className={`relative z-10 ${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} leading-relaxed`}
      >
        {desc}
      </Text>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  const t = useTranslations("homepage");
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Section
      ref={sectionRef}
      className={`p-8 ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Pill label */}
          <div
            className={`inline-block mb-4 ${THEME_CONSTANTS.sectionHeader.pill}`}
          >
            {t("howItWorksPill")}
          </div>

          <Heading
            level={2}
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {t("howItWorksTitle")}
          </Heading>
          <Text
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} max-w-xl mx-auto`}
          >
            {t("howItWorksSubtitle")}
          </Text>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              title={t(step.titleKey as never)}
              desc={t(step.descKey as never)}
              visible={visible}
              delay={i * 150}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center transition-all duration-700
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
          >
            {t("howItWorksCta")}
          </Button>
        </div>
      </div>
    </Section>
  );
}
