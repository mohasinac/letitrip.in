"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { THEME_CONSTANTS, TRUST_FEATURES } from "@/constants";
import type { TrustFeatureItem } from "@/constants";

// ─── Icon resolver ───────────────────────────────────────────────────────────
const ICON_MAP: Record<
  TrustFeatureItem["iconName"],
  React.FC<{ className?: string }>
> = {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
};

// ─── Single feature card ──────────────────────────────────────────────────────
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
      className={`${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} ${THEME_CONSTANTS.spacing.padding.md} text-center
        shadow-sm hover:shadow-md transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.2s`,
      }}
    >
      {/* Icon circle */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-4 mx-auto">
        <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
      </div>

      <h3
        className={`${THEME_CONSTANTS.typography.h6} ${THEME_CONSTANTS.themed.textPrimary} mb-1`}
      >
        {item.title}
      </h3>
      <p
        className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
      >
        {item.description}
      </p>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function TrustFeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Fade-in + slide-up on first scroll-into-viewport
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
    <section
      ref={sectionRef}
      className={`${THEME_CONSTANTS.spacing.padding.lg} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
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
    </section>
  );
}
