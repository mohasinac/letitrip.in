"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Package, Users, ShoppingBag, Star } from "lucide-react";
import { THEME_CONSTANTS } from "@/constants";
import { Section, Heading, Text } from "@/components";

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP = {
  Package,
  Users,
  ShoppingBag,
  Star,
} as const;

type IconName = keyof typeof ICON_MAP;

// ─── Stat config ─────────────────────────────────────────────────────────────

interface StatConfig {
  iconName: IconName;
  valueKey: string;
  labelKey: string;
  iconColor: string;
  iconBg: string;
}

const STATS: StatConfig[] = [
  {
    iconName: "Package",
    valueKey: "statsProducts",
    labelKey: "statsProductsLabel",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
  {
    iconName: "Users",
    valueKey: "statsSellers",
    labelKey: "statsSellersLabel",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    iconName: "ShoppingBag",
    valueKey: "statsBuyers",
    labelKey: "statsBuyersLabel",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    iconName: "Star",
    valueKey: "statsRating",
    labelKey: "statsRatingLabel",
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
  },
];

// ─── Single stat item ─────────────────────────────────────────────────────────

function StatItem({
  config,
  value,
  label,
  visible,
  delay,
}: {
  config: StatConfig;
  value: string;
  label: string;
  visible: boolean;
  delay: number;
}) {
  const Icon = ICON_MAP[config.iconName];

  return (
    <div
      className={`flex flex-col items-center text-center px-4 py-6 transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon circle */}
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.iconBg} mb-4 shadow-sm`}
      >
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>

      {/* Stat value */}
      <Heading
        level={2}
        className={`text-3xl md:text-4xl font-extrabold tracking-tight ${THEME_CONSTANTS.themed.textPrimary} mb-1`}
      >
        {value}
      </Heading>

      {/* Label */}
      <Text
        className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} font-medium uppercase tracking-wider`}
      >
        {label}
      </Text>
    </div>
  );
}

// ─── Divider line (shows between stats on desktop) ────────────────────────────

function Divider({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className={`hidden md:block w-px self-stretch my-6 transition-all duration-700
        ${visible ? "opacity-100" : "opacity-0"}
        bg-zinc-200 dark:bg-slate-700`}
      style={{ transitionDelay: `${delay}ms` }}
      aria-hidden
    />
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
      className={`p-6 ${THEME_CONSTANTS.sectionBg.cool}`}
    >
      <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y-2 md:divide-y-0 divide-x-0 md:divide-x-0 gap-0 relative">
          {/* Background decorative band */}
          <div
            className="absolute inset-0 rounded-2xl bg-white/60 dark:bg-slate-800/40 shadow-sm border border-zinc-100 dark:border-slate-700/50"
            aria-hidden
          />

          {STATS.map((stat, i) => (
            <div key={stat.valueKey} className="relative flex items-center">
              <StatItem
                config={stat}
                value={t(stat.valueKey as never)}
                label={t(stat.labelKey as never)}
                visible={visible}
                delay={i * 120}
              />
              {/* Vertical dividers between items on md+ */}
              {i < STATS.length - 1 && (
                <Divider visible={visible} delay={i * 120 + 60} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
