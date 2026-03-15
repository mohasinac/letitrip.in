"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Globe, KeyRound, Database } from "lucide-react";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Section, Span, Text, TextLink } from "@/components";

// ─── Security items config ──────────────────────────────────────────────────

interface SecurityItem {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  titleKey: string;
  descKey: string;
  color: string;
  iconColor: string;
}

const SECURITY_ITEMS: SecurityItem[] = [
  {
    icon: Lock,
    titleKey: "securityEncryptionTitle",
    descKey: "securityEncryptionDesc",
    color:
      "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30",
    iconColor: "text-primary",
  },
  {
    icon: Globe,
    titleKey: "securityTransportTitle",
    descKey: "securityTransportDesc",
    color:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: KeyRound,
    titleKey: "securityAccessTitle",
    descKey: "securityAccessDesc",
    color:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Database,
    titleKey: "securityDataTitle",
    descKey: "securityDataDesc",
    color: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
];

// ─── Single card ─────────────────────────────────────────────────────────────

function SecurityCard({
  item,
  label,
  desc,
  visible,
  delay,
}: {
  item: SecurityItem;
  label: string;
  desc: string;
  visible: boolean;
  delay: number;
}) {
  const Icon = item.icon;

  return (
    <div
      className={[
        "rounded-xl border p-5 transition-all duration-500",
        item.color,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`w-10 h-10 rounded-lg bg-white/60 dark:bg-white/10 ${THEME_CONSTANTS.flex.center} mb-3`}
      >
        <Icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={1.5} />
      </div>
      <Text className="font-semibold mb-1">{label}</Text>
      <Text variant="secondary" className="text-sm leading-relaxed">
        {desc}
      </Text>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function SecurityHighlightsSection() {
  const t = useTranslations("homepage");
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
      className={`py-14 px-4 ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Span className={THEME_CONSTANTS.sectionHeader.pill}>
            🔒 {t("securityPill")}
          </Span>
          <Heading
            level={2}
            className={`mt-4 ${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {t("securityTitle")}
          </Heading>
          <Text variant="secondary" className="mt-2 max-w-xl mx-auto">
            {t("securitySubtitle")}
          </Text>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {SECURITY_ITEMS.map((item, index) => (
            <SecurityCard
              key={item.titleKey}
              item={item}
              label={t(item.titleKey)}
              desc={t(item.descKey)}
              visible={visible}
              delay={index * 100}
            />
          ))}
        </div>

        {/* CTA link */}
        <div className="text-center mt-8">
          <TextLink href={ROUTES.PUBLIC.SECURITY}>
            {t("securityLearnMore")} →
          </TextLink>
        </div>
      </div>
    </Section>
  );
}
