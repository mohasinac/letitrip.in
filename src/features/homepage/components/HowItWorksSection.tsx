"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Gavel, PackageCheck } from "lucide-react";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Button, Heading, Section, Span, Text } from "@/components";
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
  isLast,
}: {
  step: (typeof STEPS)[number];
  title: string;
  desc: string;
  visible: boolean;
  delay: number;
  isLast: boolean;
}) {
  const Icon = ICON_MAP[step.iconName];

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Connector arrow between steps (hidden on last) */}
      {!isLast && (
        <div
          className="hidden md:block absolute top-10 left-[calc(50%+3.5rem)] right-0 h-0.5 z-0"
          aria-hidden
        >
          <div
            className={`h-full bg-gradient-to-r from-zinc-300 to-zinc-200 dark:from-slate-600 dark:to-slate-700
              transition-all duration-700 origin-left
              ${visible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
            style={{ transitionDelay: `${delay + 200}ms` }}
          />
          {/* Arrow head */}
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0
              border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent
              border-l-[7px] border-l-zinc-300 dark:border-l-slate-600
              transition-all duration-300
              ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: `${delay + 350}ms` }}
          />
        </div>
      )}

      {/* Card */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Step number badge */}
        <div
          className={`absolute -top-3 -right-3 md:-top-2 md:-right-2 w-7 h-7 rounded-full ${step.badgeBg}
            flex items-center justify-center shadow-md z-20`}
        >
          <Span className="text-white text-xs font-bold">{step.number}</Span>
        </div>

        {/* Icon */}
        <div
          className={`relative w-20 h-20 rounded-2xl ${step.iconBg} flex items-center justify-center
            shadow-md mb-5 border border-white/80 dark:border-slate-700/50`}
        >
          <Icon className={`w-9 h-9 ${step.iconColor}`} strokeWidth={1.75} />
        </div>

        {/* Text */}
        <Heading
          level={3}
          className={`${THEME_CONSTANTS.typography.h5} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
        >
          {title}
        </Heading>
        <Text
          className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} max-w-[200px] leading-relaxed`}
        >
          {desc}
        </Text>
      </div>
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
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Pill label */}
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-sm">
            <Span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 mb-10">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              title={t(step.titleKey as never)}
              desc={t(step.descKey as never)}
              visible={visible}
              delay={i * 150}
              isLast={i === STEPS.length - 1}
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
