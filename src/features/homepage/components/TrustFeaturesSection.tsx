"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { THEME_CONSTANTS, TRUST_FEATURES } from "@/constants";
import type { TrustFeatureItem } from "@/constants";
import { Heading, Section, Text } from "@mohasinac/appkit/ui";

// ─── Icon resolver ────────────────────────────────────────────────────────────
const ICON_MAP: Record<
  TrustFeatureItem["iconName"],
  React.FC<{ className?: string; strokeWidth?: number }>
> = { ShieldCheck, Truck, RotateCcw, Headphones };

// ─── Single cards-variant card ───────────────────────────────────────────────
function TrustFeatureCard({
  item,
  visible,
  delay,
}: {
  item: TrustFeatureItem;
  visible: boolean;
  delay: number;
}) {
  const Icon = ICON_MAP[item.iconName];

  return (
    <div
      className={[
        "flex flex-col items-center text-center p-4",
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient icon box (LX-9) */}
      <div className={THEME_CONSTANTS.trustStrip.iconBox}>
        <Icon
          className="w-7 h-7 text-primary-600 dark:text-primary-400"
          strokeWidth={1.5}
        />
      </div>

      <Heading
        level={3}
        className="mt-3 mb-1 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-100"
      >
        {item.title}
      </Heading>
      <Text className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {item.description}
      </Text>
    </div>
  );
}

// ─── Single strip-variant item ───────────────────────────────────────────────
function TrustStripItem({ item }: { item: TrustFeatureItem }) {
  const Icon = ICON_MAP[item.iconName];
  return (
    <div className="inline-flex flex-shrink-0 items-center gap-2 px-6">
      <Icon
        className="w-5 h-5 text-primary-600 dark:text-primary-400"
        strokeWidth={1.5}
      />
      <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
        {item.title}
      </Text>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface TrustFeaturesSectionProps {
  variant?: "cards" | "strip";
}

// ─── Section ─────────────────────────────────────────────────────────────────
export function TrustFeaturesSection({
  variant = "cards",
}: TrustFeaturesSectionProps) {
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

  if (variant === "strip") {
    // Duplicate items for seamless marquee loop
    const doubled = [...TRUST_FEATURES, ...TRUST_FEATURES];
    return (
      <Section
        ref={sectionRef}
        className="py-4 overflow-hidden border-y border-zinc-100 dark:border-slate-800"
      >
        <div className="flex animate-marquee">
          {doubled.map((item, i) => (
            <TrustStripItem key={`${item.iconName}-${i}`} item={item} />
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section
      ref={sectionRef}
      className={`py-10 px-4 ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Heading
            level={2}
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {t("whyChooseUs")}
          </Heading>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          {TRUST_FEATURES.map((item, index) => (
            <TrustFeatureCard
              key={item.iconName}
              item={item}
              visible={visible}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
