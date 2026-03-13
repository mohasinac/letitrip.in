"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Package, Users, ShoppingBag, Star } from "lucide-react";
import { THEME_CONSTANTS } from "@/constants";
import { Section, Heading, Text } from "@/components";

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP = { Package, Users, ShoppingBag, Star } as const;
type IconName = keyof typeof ICON_MAP;

// ─── Stat config ─────────────────────────────────────────────────────────────

interface StatConfig {
  iconName: IconName;
  valueKey: string;
  labelKey: string;
}

const STATS: StatConfig[] = [
  {
    iconName: "Package",
    valueKey: "statsProducts",
    labelKey: "statsProductsLabel",
  },
  {
    iconName: "Users",
    valueKey: "statsSellers",
    labelKey: "statsSellersLabel",
  },
  {
    iconName: "ShoppingBag",
    valueKey: "statsBuyers",
    labelKey: "statsBuyersLabel",
  },
  { iconName: "Star", valueKey: "statsRating", labelKey: "statsRatingLabel" },
];

// ─── Single stat item ─────────────────────────────────────────────────────────

function StatItem({
  config,
  value,
  label,
  visible,
  delay,
  isLast,
}: {
  config: StatConfig;
  value: string;
  label: string;
  visible: boolean;
  delay: number;
  isLast: boolean;
}) {
  const Icon = ICON_MAP[config.iconName];

  return (
    <div
      className={[
        "relative flex flex-col items-center text-center px-6 py-8",
        "transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        !isLast
          ? `md:border-r ${THEME_CONSTANTS.accentBanner.spotlightDivider}`
          : "",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon wrapper */}
      <div
        className={`w-14 h-14 rounded-2xl ${THEME_CONSTANTS.accentBanner.spotlightIconBg} backdrop-blur ${THEME_CONSTANTS.flex.center} mb-4`}
      >
        <Icon
          className={`w-7 h-7 ${THEME_CONSTANTS.accentBanner.spotlightIcon}`}
        />
      </div>

      {/* Stat value */}
      <Heading
        level={2}
        variant="none"
        className={`font-display text-4xl md:text-5xl ${THEME_CONSTANTS.accentBanner.spotlightText} mb-1`}
      >
        {value}
      </Heading>

      {/* Label */}
      <Text
        variant="none"
        className={`${THEME_CONSTANTS.accentBanner.spotlightTextMuted} text-sm uppercase tracking-widest`}
      >
        {label}
      </Text>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function StatsCounterSection() {
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Section
      ref={sectionRef}
      className={`${THEME_CONSTANTS.accentBanner.spotlightSection} py-12 px-4`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.valueKey}
              config={stat}
              value={t(stat.valueKey as never)}
              label={t(stat.labelKey as never)}
              visible={visible}
              delay={i * 120}
              isLast={i === STATS.length - 1}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
